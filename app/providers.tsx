"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase-init"; // `auth` may be Auth | null

export interface AuthContextType {
  user: User | null;
  userPlan: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userPlan] = useState<string | null>("basic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If `auth` is null, skip subscribing entirely.
    if (!auth) {
      console.warn("Firebase Auth is not initialized (auth is null).");
      setLoading(false);
      return;
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication service unavailable");
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error("Authentication service unavailable");
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  };

  const logOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Authentication service unavailable");
    await sendPasswordResetEmail(auth, email);
  };

  const value: AuthContextType = {
    user,
    userPlan,
    loading,
    signIn,
    signUp,
    logOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
