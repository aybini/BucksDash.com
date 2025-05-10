"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AccountBalances } from "@/components/dashboard/account-balances"
import { DataEntryPoints } from "@/components/dashboard/data-entry-points"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { RefreshFinancialData } from "@/components/dashboard/refresh-financial-data"
import { checkNetworkStatus } from "@/lib/firebase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WifiOff } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (!loading && !user && isClient) {
      router.push("/login")
    }

    const checkConnection = () => {
      const online = checkNetworkStatus()
      setIsOffline(!online)
    }

    checkConnection()

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)
    const interval = setInterval(checkConnection, 30000)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
      clearInterval(interval)
    }
  }, [user, loading, router, isClient])

  const handleRefreshComplete = (data: any) => {
    if (data.lastUpdated) {
      setLastUpdated(data.lastUpdated)
    }
  }

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        {user && (
          <RefreshFinancialData
            userId={user.uid}
            lastUpdated={lastUpdated}
            onRefreshComplete={handleRefreshComplete}
          />
        )}
      </div>

      {isOffline && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800">
          <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle>You're offline</AlertTitle>
          <AlertDescription>
            You can still view and edit your data. Changes will be saved locally and synced when you're back online.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 grid-cols-1">
        <Overview />
        <div className="grid gap-6 md:grid-cols-2">
          <AccountBalances />
          <RecentActivity />
        </div>
        <div className="pt-4">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <DataEntryPoints />
        </div>
      </div>
    </div>
  )
}
