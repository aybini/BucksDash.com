"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { checkNetworkStatus, reconnectToFirestore } from "@/lib/firebase-service"
import { WifiOff, RefreshCw } from "lucide-react"
import { OfflineBanner } from "@/components/ui/offline-banner"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isOffline, setIsOffline] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      const online = checkNetworkStatus()
      setIsOffline(!online)

      // If we're online but showing as offline, try to reconnect
      if (online && isOffline) {
        handleReconnect()
      }
    }

    checkStatus()

    // Set up event listeners for online/offline status
    const handleOnline = () => {
      console.log("Browser reports online status")
      setIsOffline(false)
      handleReconnect()
    }

    const handleOffline = () => {
      console.log("Browser reports offline status")
      setIsOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check status periodically
    const interval = setInterval(checkStatus, 30000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [isOffline])

  const handleReconnect = async () => {
    if (!user) return

    setIsReconnecting(true)
    try {
      console.log("Attempting to reconnect to Firestore...")
      await reconnectToFirestore()
      console.log("Reconnection attempt completed")
    } catch (error) {
      console.error("Error during reconnection:", error)
    } finally {
      setIsReconnecting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-rose-600">BucksDash</h1>
            {isOffline && (
              <div className="flex items-center text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </div>
            )}
            {isReconnecting && (
              <div className="flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Reconnecting...
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOffline && !isReconnecting && (
              <Button variant="outline" size="sm" onClick={handleReconnect} className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            )}
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden pb-20 md:pb-16 pt-6">{children}</main>
      </div>
      <MobileNav />
      <OfflineBanner />
    </div>
  )
}
