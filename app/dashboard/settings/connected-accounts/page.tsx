"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { RefreshFinancialData } from "@/components/dashboard/refresh-financial-data"
import { formatDistanceToNow } from "date-fns"

export default function ConnectedAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [isPremium, setIsPremium] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const fetchConnectedAccounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setAccounts(userData.plaidAccounts || [])
        setIsPremium(userData.plan === "premium")

        if (userData.plaidLastSync?.toDate) {
          setLastUpdated(userData.plaidLastSync.toDate())
        }
      }
    } catch (error) {
      console.error("Error fetching connected accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user && isClient) {
      fetchConnectedAccounts()
    }
  }, [user, isClient])

  const handleRefreshComplete = () => {
    fetchConnectedAccounts()
  }

  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connected Accounts</h1>
        <RefreshFinancialData lastUpdated={lastUpdated} onRefreshComplete={handleRefreshComplete} />
      </div>

      {!isPremium ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Accounts</CardTitle>
            <CardDescription>
              To connect bank accounts, you need a premium account. Since you're on the basic plan, you’ll need to
              delete your current account and create a new one with a premium subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/pricing")} className="bg-rose-600 hover:bg-rose-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              View Pricing
            </Button>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Connected Accounts</CardTitle>
            <CardDescription>
              Connect your bank accounts to automatically import transactions and track your finances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/connect-accounts")} className="bg-rose-600 hover:bg-rose-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts.map((account, index) => {
            const lastSyncDate =
              account?.lastUpdated?.toDate?.() ?? account?.lastUpdated ?? new Date()

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{account?.institutionName || "Unnamed Institution"}</CardTitle>
                    {account?.hasError && (
                      <div className="flex items-center text-red-500">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Connection Issue</span>
                      </div>
                    )}
                  </div>
                  <CardDescription>
                    Connected {formatDistanceToNow(lastSyncDate, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {account?.hasError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
                      <p className="font-medium">Error: {account?.errorMessage || "Unknown error"}</p>
                      <p className="text-xs mt-1">Please try reconnecting your account to resolve this issue.</p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => router.push("/dashboard/connect-accounts")}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconnect
                    </Button>
                    {/* Optional: Add disconnect logic here */}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Button onClick={() => router.push("/dashboard/connect-accounts")} className="bg-rose-600 hover:bg-rose-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Connect Another Account
          </Button>
        </div>
      )}
    </div>
  )
}
