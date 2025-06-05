// lib/firebase-init.ts

import { initializeApp, getApps, type FirebaseApp, getApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,                       // used instead of plain getFirestore when persisting
  enableNetwork as enableFirestoreNetwork,
  disableNetwork,
  type Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  connectFirestoreEmulator,
  persistentLocalCache,                        // unchanged
  persistentMultipleTabManager,                // unchanged
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// —————— Your original Firebase config ——————
const firebaseConfig = {
  apiKey:                process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:             process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:         process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:     process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:                 process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:         process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// —————— Initialize (or retrieve) the singleton FirebaseApp ——————
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    try {
      return initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
      throw error;
    }
  } else {
    return getApp();
  }
}

// —————— Singleton Firestore instance ——————
let firestoreInstance: Firestore | null = null;

function getFirestoreDb(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = getFirebaseApp();

  // ←— **NEW**: Only request IndexedDB persistence in production on the client
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    try {
      firestoreInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
      console.log("Firestore initialized with persistent cache (multi-tab).");
    } catch (err: any) {
      console.warn(
        "Could not initialize Firestore persistence. Falling back to memory mode. ",
        err
      );
      firestoreInstance = getFirestore(app);
    }
  } else {
    // ←— **UNCHANGED** but moved here: 
    // In development (or on the server), get a plain (memory-only) Firestore instance
    firestoreInstance = getFirestore(app);
    console.log(
      typeof window === "undefined"
        ? "Firestore initialized without persistence (server)."
        : "Firestore initialized without persistence (development)."
    );
  }

  return firestoreInstance;
}

// —————— Export singletons ——————
export const app = getFirebaseApp();
export const db = getFirestoreDb();

// Browser-only services: unmodified
export const auth: Auth | null = typeof window !== "undefined" ? getAuth(app) : null;
export const storage = typeof window !== "undefined" ? getStorage(app) : null;

// —————— Connection-checking logic (unchanged) ——————
let isFirestoreConnected = false;
let connectionCheckInterval: NodeJS.Timeout | null = null;
let connectionRetryCount = 0;
const MAX_RETRY_COUNT = 5;

export async function checkFirestoreConnection(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const currentUser = auth?.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, `users/${currentUser.uid}`);
      await getDoc(userDocRef);
    } else {
      const firestoreApp = getFirestore(app);
      await enableFirestoreNetwork(firestoreApp);
    }

    if (!isFirestoreConnected) {
      console.log("Firestore connection established");
      isFirestoreConnected = true;
      connectionRetryCount = 0;
    }

    return true;
  } catch (error: any) {
    const errorCode = error?.code || "";
    const errorMessage = error?.message || "";

    if (errorCode === "permission-denied") {
      console.log(
        "Firestore is connected but permission denied for test operation"
      );
      isFirestoreConnected = true;
      connectionRetryCount = 0;
      return true;
    }

    console.warn(
      `Firestore connection check failed: ${errorCode} - ${errorMessage}`
    );
    isFirestoreConnected = false;
    connectionRetryCount++;

    if (errorCode === "unavailable") {
      console.log("Firestore backend is currently unavailable. Retrying...");
    } else if (errorMessage.includes("network")) {
      console.log("Network appears offline. Using cached data.");
    }

    if (connectionRetryCount >= MAX_RETRY_COUNT) {
      console.error(
        `Failed to connect to Firestore after ${MAX_RETRY_COUNT} attempts. Using offline mode.`
      );
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

export function startConnectionMonitoring(intervalMs = 30000): void {
  if (typeof window === "undefined") return;
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  checkFirestoreConnection();
  connectionCheckInterval = setInterval(() => {
    checkFirestoreConnection();
  }, intervalMs);
}

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

// —————— initFirebase helper (unchanged) ——————
export const initFirebase = () => {
  try {
    const firebaseApp = getFirebaseApp();
    const firebaseDb = getFirestoreDb();

    let firebaseAuth = null;
    let firebaseStorage = null;

    if (typeof window !== "undefined") {
      firebaseAuth = getAuth(firebaseApp);
      firebaseStorage = getStorage(firebaseApp);

      if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        console.log("Using Firebase emulator");
        connectFirestoreEmulator(firebaseDb, "localhost", 8080);
      }
    }

    return {
      firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
};

// —————— Auto-initialize on module load (unchanged) ——————
if (typeof window !== "undefined" && !getApps().length) {
  console.log("Initializing Firebase on module load");
  initFirebase();
}

// —————— logConnectionStatus helper (unchanged) ——————
export async function logConnectionStatus(
  userId: string,
  status: "online" | "offline"
): Promise<void> {
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
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to log connection status:", error);
  }
}
