import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Debug logging
console.log("Firebase config:", {
  apiKey: firebaseConfig.apiKey ? "Set" : "Not set",
  authDomain: firebaseConfig.authDomain ? "Set" : "Not set",
  projectId: firebaseConfig.projectId ? "Set" : "Not set",
  // ... log other config properties
})

let app
let auth
let db

if (typeof window !== "undefined") {
  if (!getApps().length) {
    console.log("Initializing Firebase app")
    app = initializeApp(firebaseConfig)
    console.log("Firebase app initialized")
  } else {
    console.log("Firebase app already initialized")
    app = getApps()[0]
  }
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db }
