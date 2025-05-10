"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getRecentTransactions, type Transaction } from "@/lib/firebase-service"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function RecentActivity() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!user) return

      setIsLoading(true)
      try {
        const recentTransactions = await getRecentTransactions(user.uid, 5)
        setTransactions(recentTransactions)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentActivity()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: any) => {
    const jsDate = new Date((date as any).toDate?.() || date)
    return format(jsDate, "MMM d")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest financial transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-8">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center">
                <div
                  className={`mr-2 sm:mr-4 rounded-full p-1.5 sm:p-2 ${transaction.type === "income" ? "bg-green-100" : "bg-rose-100"}`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className={`h-3 w-3 sm:h-4 sm:w-4 text-green-600`} />
                  ) : (
                    <ArrowDownRight className={`h-3 w-3 sm:h-4 sm:w-4 text-rose-600`} />
                  )}
                </div>
                <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium leading-tight truncate">{transaction.description}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {transaction.category} • {formatDate(transaction.date)}
                  </p>
                </div>
                <div
                  className={`${transaction.type === "income" ? "text-green-600" : "text-rose-600"} text-xs sm:text-sm font-medium ml-2`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
