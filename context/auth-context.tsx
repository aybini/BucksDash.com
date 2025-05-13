"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  getAuth,
} from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string) => Promise<User>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  userPlan: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        try {
          // Fetch user plan only after setting the user
          const userDoc = await fetch(`/api/user/${user.uid}`).then((res) => res.json())
          setUserPlan(userDoc.plan || null)
        } catch (error) {
          console.error("Error fetching user plan:", error)
          setUserPlan(null)
        }
      } else {
        setUser(null)
        setUserPlan(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password)
      setUser(userCredential.user)
      return userCredential.user
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password)
      setUser(userCredential.user)
      return userCredential.user
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const logOut = async () => {
    try {
      await firebaseSignOut(getAuth())
      setUser(null)
      setUserPlan(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(getAuth(), email)
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logOut,
    resetPassword,
    userPlan,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
