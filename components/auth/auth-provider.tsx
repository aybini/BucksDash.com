"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { useAuth as useFirebaseAuth } from "@/lib/auth-context"
import type { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
}

// Create a properly typed context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useFirebaseAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Export a properly typed hook
export const useAuth = () => useContext(AuthContext)
