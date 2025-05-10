import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  try {
    const FIREBASE_SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL
    const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY

    // Check if we have the required environment variables
    if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error("Missing Firebase admin credentials in environment variables")
    }

    // Handle the private key - it might need to be processed
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")

    // If we have a full service account key JSON, use that
    if (FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount

      try {
        // Try to parse the service account key as JSON
        serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY)
      } catch (e) {
        console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON, using individual credentials instead")
        serviceAccount = null
      }

      if (serviceAccount) {
        return initializeApp({
          credential: cert(serviceAccount),
        })
      }
    }

    // Fallback to using individual credentials
    return initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    })
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)

    // For development purposes, initialize with minimal config if we can't use the real credentials
    if (process.env.NODE_ENV !== "production") {
      console.warn("Using minimal Firebase Admin config for development")
      return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rose-finance-dev",
      })
    }

    throw error
  }
}

// Initialize the app if it hasn't been initialized already
const app = getApps().length === 0 ? initializeFirebaseAdmin() : getApps()[0]

// Export the auth and firestore instances
export const auth = getAuth(app)
export const adminDb = getFirestore(app)
