"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { RefreshFinancialData } from "./refresh-financial-data"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Building, Landmark, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { checkNetworkStatus } from "@/lib/firebase-service"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AccountBalances() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(!checkNetworkStatus())
  const [isOpen, setIsOpen] = useState(true)
  const { user } = useAuth()

  const fetchAccountBalances = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const accountData = userData.plaidAccountBalances || []

        // Sort accounts by balance (highest first)
        const sortedAccounts = [...accountData].sort((a, b) => {
          const balanceA = a.balance?.available || a.balance?.current || 0
          const balanceB = b.balance?.available || b.balance?.current || 0
          return balanceB - balanceA
        })

        setAccounts(sortedAccounts)

        // Calculate total balance
        const total = accountData.reduce((sum, account) => {
          return sum + (account.balance?.available || account.balance?.current || 0)
        }, 0)

        setTotalBalance(total)

        if (userData.plaidLastSync) {
          setLastUpdated(userData.plaidLastSync.toDate ? userData.plaidLastSync.toDate() : userData.plaidLastSync)
        }
      }
    } catch (error) {
      console.error("Error fetching account balances:", error)
      setError("Failed to load account balances. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccountBalances()

    // Check network status
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine)
    }

    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange)
      window.removeEventListener("offline", handleOnlineStatusChange)
    }
  }, [user])

  const handleRefreshComplete = () => {
    fetchAccountBalances()
  }

  const formatCurrency = (amount: number | null | undefined, currency = "USD") => {
    if (amount === null || amount === undefined) return "N/A"

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Get account icon based on type
  const getAccountIcon = (type: string, subtype: string) => {
    switch (type) {
      case "depository":
        if (subtype === "checking") return <Wallet className="h-4 w-4" />
        if (subtype === "savings") return <Building className="h-4 w-4" />
        return <Landmark className="h-4 w-4" />
      case "credit":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Landmark className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Account Balances</CardTitle>
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Account Balances</CardTitle>
          <RefreshFinancialData
            userId={user?.uid}
            lastUpdated={lastUpdated}
            onRefreshComplete={handleRefreshComplete}
            buttonSize="sm"
          />
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Account Balances</CardTitle>
          <RefreshFinancialData
            userId={user?.uid}
            lastUpdated={lastUpdated}
            onRefreshComplete={handleRefreshComplete}
            buttonSize="sm"
          />
        </CardHeader>
        <CardContent>
          {isOffline ? (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You're currently offline. Some features may be limited.</AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              No connected accounts found. Connect a bank account to see your balances.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Account Balances</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshFinancialData
              userId={user?.uid}
              lastUpdated={lastUpdated}
              onRefreshComplete={handleRefreshComplete}
              buttonSize="sm"
            />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">Toggle accounts</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CardContent>
          {isOffline && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You're currently offline. Account balances may not be up to date.</AlertDescription>
            </Alert>
          )}

          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>

          <CollapsibleContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-2"
                >
                  <div className="flex items-center">
                    <div className="mr-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                      {getAccountIcon(account.type, account.subtype)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{account.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {account.subtype || account.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{account.mask ? `••••${account.mask}` : ""}</p>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <p className="font-semibold">
                      {formatCurrency(
                        account.balance?.available || account.balance?.current,
                        account.balance?.isoCurrencyCode,
                      )}
                    </p>
                    {account.balance?.available !== account.balance?.current && account.balance?.available !== null && (
                      <p className="text-xs text-muted-foreground">
                        {account.balance?.available !== null
                          ? `Available: ${formatCurrency(account.balance?.available, account.balance?.isoCurrencyCode)}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  )
}
