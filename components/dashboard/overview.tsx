"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview as OverviewChart } from "@/components/dashboard/overview-chart"
import { useAuth } from "@/lib/auth-context"
import { getTransactions, type Transaction } from "@/lib/firebase-service"
import { Skeleton } from "@/components/ui/skeleton"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Overview() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    currentMonth: format(new Date(), "MMMM yyyy"),
  })
  const [timeframe, setTimeframe] = useState("month")

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return

      setIsLoading(true)
      try {
        const now = new Date()
        const firstDayOfMonth = startOfMonth(now)
        const lastDayOfMonth = endOfMonth(now)

        // Fetch all transactions
        const allTransactions = await getTransactions(user.uid)
        setTransactions(allTransactions)

        // Filter transactions for current month
        const currentMonthTransactions = allTransactions.filter((transaction) => {
          const transactionDate = new Date((transaction.date as any).toDate?.() || transaction.date)
          return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth
        })

        // Calculate totals
        let totalIncome = 0
        let totalExpenses = 0

        currentMonthTransactions.forEach((transaction) => {
          if (transaction.type === "income") {
            totalIncome += transaction.amount
          } else {
            totalExpenses += transaction.amount
          }
        })

        setMonthlyData({
          income: totalIncome,
          expenses: totalExpenses,
          balance: totalIncome - totalExpenses,
          currentMonth: format(now, "MMMM yyyy"),
        })
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Your financial health for {monthlyData.currentMonth}</CardDescription>
          </div>
          <Tabs defaultValue="month" className="mt-2 sm:mt-0" onValueChange={setTimeframe}>
            <TabsList className="grid w-full max-w-[200px] grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
              <Skeleton className="h-20 w-full sm:w-[30%]" />
              <Skeleton className="h-20 w-full sm:w-[30%]" />
              <Skeleton className="h-20 w-full sm:w-[30%]" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(monthlyData.income)}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(monthlyData.expenses)}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  monthlyData.balance >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-amber-50 dark:bg-amber-900/20"
                }`}
              >
                <p className="text-sm text-muted-foreground">Balance</p>
                <p
                  className={`text-2xl sm:text-3xl font-bold ${
                    monthlyData.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {formatCurrency(monthlyData.balance)}
                </p>
              </div>
            </div>
            <div className="h-[350px]">
              <OverviewChart transactions={transactions} timeframe={timeframe} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
