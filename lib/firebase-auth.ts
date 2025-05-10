import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { auth, initFirebase } from "./firebase-init"

// Function to create a new user account
export async function signUp(email: string, password: string, name: string): Promise<User> {
  initFirebase() // Ensure Firebase is initialized
  if (!auth) throw new Error("Firebase Auth is not initialized")

  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: name })
  await sendEmailVerification(userCredential.user)
  return userCredential.user
}

// Function to log in an existing user
export async function signIn(email: string, password: string): Promise<User> {
  // Make sure Firebase is initialized
  initFirebase()

  // Double-check auth is available
  if (!auth) {
    console.error("Firebase Auth is not initialized")
    throw new Error("Authentication service is not available")
  }

  try {
    console.log(`Attempting to sign in user: ${email}`)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // For development purposes, we'll skip email verification check
    // In production, uncomment this code
    /*
    if (!userCredential.user.emailVerified) {
      // Throw a specific error for unverified email
      const error = new Error("Please verify your email before logging in")
      error.name = "auth/email-not-verified"
      throw error
    }
    */

    console.log("Sign in successful:", userCredential.user.uid)
    return userCredential.user
  } catch (error: any) {
    console.error("Sign in error details:", error)

    // Map Firebase error codes to more specific errors
    if (error.code === "auth/invalid-credential") {
      console.error("Invalid credentials provided")
      const customError = new Error("The email or password you entered is incorrect")
      customError.name = "auth/invalid-login-credentials"
      throw customError
    }

    // Re-throw the original error if it's not one we're handling specially
    throw error
  }
}

// Function to log out a user
export async function signOut(): Promise<void> {
  initFirebase() // Ensure Firebase is initialized
  if (!auth) throw new Error("Firebase Auth is not initialized")

  await firebaseSignOut(auth)
}

// Add a function to resend verification email
export async function resendVerificationEmail(): Promise<void> {
  initFirebase()
  if (!auth || !auth.currentUser) throw new Error("No user is currently signed in")

  await sendEmailVerification(auth.currentUser)
}
