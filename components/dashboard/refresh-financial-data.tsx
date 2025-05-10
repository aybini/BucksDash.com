"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { refreshFinancialData } from "@/lib/plaid-actions"
import { useToast } from "@/components/ui/use-toast"
import { format, formatDistanceToNow } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkNetworkStatus } from "@/lib/firebase-service"

interface RefreshFinancialDataProps {
  userId?: string
  lastUpdated?: Date | null
  onRefreshComplete?: (data: any) => void
  buttonSize?: "default" | "sm" | "lg" | "icon"
}

export function RefreshFinancialData({
  userId,
  lastUpdated,
  onRefreshComplete,
  buttonSize = "default",
}: RefreshFinancialDataProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [refreshResults, setRefreshResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [isOffline, setIsOffline] = useState(!checkNetworkStatus())

  const handleRefresh = async () => {
    if (!userId) return

    // Check network status before attempting refresh
    if (!checkNetworkStatus()) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      })
      return
    }

    setIsRefreshing(true)
    setError(null)

    try {
      const result = await refreshFinancialData(userId)

      if (result.success) {
        toast({
          title: "Data refreshed",
          description: "Successfully updated your financial data.",
        })

        setRefreshResults(result)
        setShowResults(true)

        if (onRefreshComplete) {
          onRefreshComplete(result)
        }
      } else {
        setError(result.error || "Failed to refresh your financial data.")
        toast({
          title: "Error refreshing data",
          description: result.error || "Failed to refresh your financial data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error refreshing financial data:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "An unexpected error occurred while refreshing your data.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never updated"

    try {
      const date =
        lastUpdated instanceof Date ? lastUpdated : lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated)

      const formattedDate = format(date, "MMM d, yyyy h:mm a")
      const timeAgo = formatDistanceToNow(date, { addSuffix: true })

      return `${formattedDate} (${timeAgo})`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown"
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={buttonSize}
              onClick={handleRefresh}
              disabled={isRefreshing || isOffline}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {buttonSize !== "icon" && buttonSize !== "sm" && <span>Refresh Data</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last updated: {formatLastUpdated()}</p>
            <p className="text-xs text-muted-foreground">Click to refresh your financial data</p>
            {isOffline && <p className="text-xs text-amber-500">Currently offline</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Data Refresh Complete</DialogTitle>
            <DialogDescription>Your financial data has been successfully updated.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {refreshResults && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Transactions</p>
                  <p className="text-xl font-bold">{refreshResults.transactionCount || 0}</p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Accounts</p>
                  <p className="text-xl font-bold">{refreshResults.balancesUpdated ? "Updated" : "No change"}</p>
                </div>
              </div>

              {refreshResults.insights && (
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Insights Updated</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Subscriptions</p>
                      <p className="text-sm font-medium">{refreshResults.insights.detectedSubscriptionsCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Income Sources</p>
                      <p className="text-sm font-medium">{refreshResults.insights.incomeSourcesCount || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Last updated: {format(refreshResults.lastUpdated, "MMM d, yyyy h:mm a")}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
