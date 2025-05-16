import { initializeApp, getApps, type FirebaseApp, getApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import {
  getFirestore,
  enableNetwork as enableFirestoreNetwork,
  disableNetwork,
  type Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase app instance - safe for both client and server
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    try {
      return initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
      throw error; // Re-throw to make errors visible
    }
  } else {
    return getApp();
  }
}

// Initialize Firestore - safe for both client and server
function getFirestoreDb(): Firestore {
  try {
    const app = getFirebaseApp();
    
    // Only use persistent cache in browser environment
    if (typeof window !== "undefined") {
      try {
        return initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch (error) {
        console.error("Error initializing Firestore with persistent cache:", error);
        // Fall back to standard initialization if persistent cache fails
        return getFirestore(app);
      }
    } else {
      // For server, use standard Firestore without persistence
      return getFirestore(app);
    }
  } catch (error) {
    console.error("Error getting Firestore instance:", error);
    throw error;
  }
}

// Create and export the Firebase instances
export const app = getFirebaseApp();
export const db = getFirestoreDb();

// Browser-only services
export const auth = typeof window !== "undefined" ? getAuth(app) : null;
export const storage = typeof window !== "undefined" ? getStorage(app) : null;

// Connection state tracking (browser only)
let isFirestoreConnected = false;
let connectionCheckInterval: NodeJS.Timeout | null = null;
let connectionRetryCount = 0;
const MAX_RETRY_COUNT = 5;

// Modify the checkFirestoreConnection function to use a read operation instead of a write
// and to handle permission errors properly
export async function checkFirestoreConnection(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Instead of writing to a test document, try to read from a collection the user should have access to
    // First check if we have a logged in user
    const currentUser = auth?.currentUser;

    if (currentUser) {
      // If user is logged in, try to read their user document
      const userDocRef = doc(db, `users/${currentUser.uid}`);
      await getDoc(userDocRef);
    } else {
      // If no user is logged in, just check if Firestore is reachable by getting any public document
      // or by checking the connection state
      const firestoreApp = getFirestore(app);
      await enableFirestoreNetwork(firestoreApp);
    }

    // If we get here, connection is successful
    if (!isFirestoreConnected) {
      console.log("Firestore connection established");
      isFirestoreConnected = true;
      connectionRetryCount = 0;
    }

    return true;
  } catch (error: any) {
    const errorCode = error?.code || "";
    const errorMessage = error?.message || "";

    // If this is a permission error but Firestore is actually connected
    if (errorCode === "permission-denied") {
      console.log("Firestore is connected but permission denied for test operation");
      // We still consider this a successful connection since Firestore is reachable
      isFirestoreConnected = true;
      connectionRetryCount = 0;
      return true;
    }

    console.warn(`Firestore connection check failed: ${errorCode} - ${errorMessage}`);
    isFirestoreConnected = false;
    connectionRetryCount++;

    // Log more detailed information for debugging
    if (errorCode === "unavailable") {
      console.log("Firestore backend is currently unavailable. Will retry automatically.");
    } else if (errorMessage.includes("network")) {
      console.log("Network appears to be offline. Firestore will use cached data.");
    }

    // If we've tried too many times, log a more detailed error
    if (connectionRetryCount >= MAX_RETRY_COUNT) {
      console.error(`Failed to connect to Firestore after ${MAX_RETRY_COUNT} attempts. Using offline mode.`);

      // Try to disable and re-enable the network to force a reconnection
      try {
        await disableNetwork(db);
        setTimeout(async () => {
          try {
            await enableFirestoreNetwork(db);
          } catch (e) {
            console.error("Failed to re-enable network:", e);
          }
        }, 5000);
      } catch (e) {
        console.error("Failed to reset network connection:", e);
      }

      connectionRetryCount = 0;
    }

    return false;
  }
}

// Add a function to start periodic connection checks
export function startConnectionMonitoring(intervalMs = 30000): void {
  if (typeof window === "undefined") return;
  
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }

  // Initial check
  checkFirestoreConnection();

  // Set up periodic checks
  connectionCheckInterval = setInterval(() => {
    checkFirestoreConnection();
  }, intervalMs);
}

// Add a function to stop connection monitoring
export function stopConnectionMonitoring(): void {
  if (typeof window === "undefined") return;
  
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
}

export function isFirestoreCurrentlyConnected(): boolean {
  return isFirestoreConnected;
}

// Initialize Firebase with all services and return them
export const initFirebase = () => {
  try {
    const firebaseApp = getFirebaseApp();
    const firebaseDb = getFirestoreDb();
    
    let firebaseAuth = null;
    let firebaseStorage = null;
    
    if (typeof window !== "undefined") {
      firebaseAuth = getAuth(firebaseApp);
      firebaseStorage = getStorage(firebaseApp);
      
      // Use emulator if specified (client-side only)
      if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        console.log("Using Firebase emulator");
        connectFirestoreEmulator(firebaseDb, "localhost", 8080);
      }
    }

    return { firebaseApp, auth: firebaseAuth, db: firebaseDb, storage: firebaseStorage };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
};

// Initialize Firebase on module load for browser only
if (typeof window !== "undefined") {
  console.log("Initializing Firebase on module load");
  initFirebase();
}

// Add a function to log connection status to a user document
export async function logConnectionStatus(userId: string, status: "online" | "offline"): Promise<void> {
  if (!userId || !db) return;

  try {
    const userDocRef = doc(db, `users/${userId}`);
    await setDoc(
      userDocRef,
      {
        lastConnectionStatus: {
          status,
          timestamp: serverTimestamp(),
        },
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Failed to log connection status:", error);
  }
}