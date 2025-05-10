"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"

interface ClientProviderWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function ClientProviderWrapper({ children, requireAuth = true }: ClientProviderWrapperProps) {
  const { user, loading } = useAuth()

  // If authentication is required and user is not logged in after loading
  if (requireAuth && !loading && !user) {
    redirect("/login")
  }

  // Don't render children until auth state is determined
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-rose-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
