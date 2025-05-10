"use client"

import { useEffect, useState } from "react"
import { WifiOff, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { reconnectToFirestore, checkNetworkStatus, syncPendingChanges } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { checkFirestoreConnection, startConnectionMonitoring, stopConnectionMonitoring } from "@/lib/firebase-init"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "failed">("idle")
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "unstable">(
    "connected",
  )
  const { user } = useAuth()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      const networkOnline = checkNetworkStatus()
      const firestoreConnected = await checkFirestoreConnection()

      setIsOffline(!networkOnline)

      if (networkOnline && !firestoreConnected) {
        setConnectionStatus("unstable")
      } else if (networkOnline) {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("disconnected")
      }

      // If we're coming back online, try to sync
      if (networkOnline && isOffline && user) {
        handleSync()
      }
    }

    checkStatus()

    // Set up event listeners for online/offline status
    const handleOnline = () => {
      setIsOffline(false)
      setConnectionStatus("connecting")

      // Check if Firestore is actually connected
      setTimeout(async () => {
        const firestoreConnected = await checkFirestoreConnection()
        setConnectionStatus(firestoreConnected ? "connected" : "unstable")

        if (user && firestoreConnected) {
          handleSync()
        }
      }, 2000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setConnectionStatus("disconnected")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Start connection monitoring
    startConnectionMonitoring(15000)

    // Check status periodically
    const interval = setInterval(checkStatus, 15000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
      stopConnectionMonitoring()
    }
  }, [isOffline, user])

  const handleRetry = async () => {
    setRetrying(true)
    setConnectionStatus("connecting")
    setRetryCount((prev) => prev + 1)

    try {
      const success = await reconnectToFirestore()
      if (success) {
        setIsOffline(false)
        setConnectionStatus("connected")
        setRetryCount(0)

        if (user) {
          handleSync()
        }
      } else {
        setConnectionStatus("unstable")

        // If we've tried too many times, show a more helpful message
        if (retryCount >= 3) {
          console.log(
            "Multiple reconnection attempts failed. Consider checking your network connection or reloading the page.",
          )
        }
      }
    } catch (error) {
      console.error("Failed to reconnect:", error)
      setConnectionStatus("unstable")
    } finally {
      setRetrying(false)
    }
  }

  const handleSync = async () => {
    if (!user) return

    setSyncStatus("syncing")
    try {
      await syncPendingChanges(user.uid)
      setSyncStatus("synced")

      // Reset status after showing success message
      setTimeout(() => {
        setSyncStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Failed to sync changes:", error)
      setSyncStatus("failed")
    }
  }

  // Don't show anything if everything is working normally
  if (connectionStatus === "connected" && syncStatus === "idle") return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {connectionStatus === "disconnected" ? (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
              <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                You're currently offline. Your changes will be saved locally and synced when you're back online.
              </span>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-3 py-1 bg-yellow-200 dark:bg-yellow-800 rounded-md text-yellow-800 dark:text-yellow-200 text-sm font-medium hover:bg-yellow-300 dark:hover:bg-yellow-700 disabled:opacity-50 whitespace-nowrap"
            >
              {retrying ? (
                <span className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Retrying...
                </span>
              ) : (
                "Retry Connection"
              )}
            </button>
          </div>
        </div>
      ) : connectionStatus === "unstable" ? (
        <div className="bg-orange-100 dark:bg-orange-900 p-3">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-700 dark:text-orange-300" />
              <span className="text-orange-800 dark:text-orange-200 text-sm">
                {retryCount >= 3
                  ? "Having trouble connecting to the server. Your data is being saved locally. Try reloading the page if this persists."
                  : "Connection to the server is unstable. Some features may be limited. Your data is being saved locally."}
              </span>
            </div>
            <div className="flex gap-2">
              {retryCount >= 3 && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-orange-200 dark:bg-orange-800 rounded-md text-orange-800 dark:text-orange-200 text-sm font-medium hover:bg-orange-300 dark:hover:bg-orange-700 whitespace-nowrap"
                >
                  Reload Page
                </button>
              )}
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="px-3 py-1 bg-orange-200 dark:bg-orange-800 rounded-md text-orange-800 dark:text-orange-200 text-sm font-medium hover:bg-orange-300 dark:hover:bg-orange-700 disabled:opacity-50 whitespace-nowrap"
              >
                {retrying ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Reconnecting...
                  </span>
                ) : (
                  "Reconnect"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : connectionStatus === "connecting" ? (
        <div className="bg-blue-100 dark:bg-blue-900 p-3">
          <div className="container mx-auto flex items-center justify-center">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin text-blue-700 dark:text-blue-300" />
            <span className="text-blue-800 dark:text-blue-200 text-sm">Connecting to server...</span>
          </div>
        </div>
      ) : syncStatus === "syncing" ? (
        <div className="bg-blue-100 dark:bg-blue-900 p-3">
          <div className="container mx-auto flex items-center justify-center">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin text-blue-700 dark:text-blue-300" />
            <span className="text-blue-800 dark:text-blue-200 text-sm">Syncing your data...</span>
          </div>
        </div>
      ) : syncStatus === "synced" ? (
        <div className="bg-green-100 dark:bg-green-900 p-3">
          <div className="container mx-auto flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-700 dark:text-green-300" />
            <span className="text-green-800 dark:text-green-200 text-sm">Your data has been synced successfully!</span>
          </div>
        </div>
      ) : syncStatus === "failed" ? (
        <div className="bg-red-100 dark:bg-red-900 p-3">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-red-800 dark:text-red-200 text-sm">
              Failed to sync some changes. Please try again.
            </span>
            <button
              onClick={handleSync}
              className="px-3 py-1 bg-red-200 dark:bg-red-800 rounded-md text-red-800 dark:text-red-200 text-sm font-medium hover:bg-red-300 dark:hover:bg-red-700"
            >
              Retry Sync
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
