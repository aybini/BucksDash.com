"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { getPlaidConnectionStatus, refreshFinancialData } from "@/lib/plaid-actions"
import {
  Loader2,
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChartIcon,
  BarChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { format, parseISO, isValid, subMonths } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function FinancialInsights() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const status = await getPlaidConnectionStatus(user.uid)

        // Get user document for more detailed insights
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()

          // Set insights from Plaid data
          setInsights(userData.plaidInsights || status.insights || {})
          setLastUpdated(userData.plaidLastSync?.toDate() || null)

          // Get recent transactions for charts
          const transactionsRef = collection(db, `users/${user.uid}/transactions`)
          const q = query(transactionsRef, orderBy("date", "desc"), limit(100))
          const snapshot = await getDocs(q)

          const recentTransactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))

          setTransactions(recentTransactions)

          // Process monthly data for charts
          const monthlySpending = processMonthlyData(recentTransactions)
          setMonthlyData(monthlySpending)
        }
      } catch (error) {
        console.error("Error fetching insights:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [user])

  // Process monthly data for charts
  const processMonthlyData = (transactions) => {
    const monthlyData = {}
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthYear = format(monthDate, "MMM yyyy")
      monthlyData[monthYear] = {
        name: monthYear,
        income: 0,
        expenses: 0,
      }
    }

    transactions.forEach((tx) => {
      if (!tx.date) return

      let txDate
      if (typeof tx.date === "string") {
        txDate = parseISO(tx.date)
      } else if (tx.date.toDate) {
        txDate = tx.date.toDate()
      } else {
        txDate = new Date(tx.date)
      }

      if (!isValid(txDate)) return

      const monthYear = format(txDate, "MMM yyyy")

      // Only process if it's in our initialized months
      if (monthlyData[monthYear]) {
        if (tx.type === "income") {
          monthlyData[monthYear].income += tx.amount
        } else {
          monthlyData[monthYear].expenses += tx.amount
        }
      }
    })

    return Object.values(monthlyData)
  }

  const handleRefresh = async () => {
    if (!user) return

    setIsRefreshing(true)
    try {
      const result = await refreshFinancialData(user.uid)

      if (result.success) {
        toast({
          title: "Data refreshed",
          description: "Your financial data has been updated successfully.",
        })

        // Update insights and last updated time
        setInsights(result.insights)
        setLastUpdated(result.lastUpdated)

        // Refresh transactions
        const transactionsRef = collection(db, `users/${user.uid}/transactions`)
        const q = query(transactionsRef, orderBy("date", "desc"), limit(100))
        const snapshot = await getDocs(q)

        const recentTransactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setTransactions(recentTransactions)

        // Process monthly data for charts
        const monthlySpending = processMonthlyData(recentTransactions)
        setMonthlyData(monthlySpending)
      } else {
        toast({
          title: "Refresh failed",
          description: result.error || "Failed to refresh your financial data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "An error occurred while refreshing your data.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-rose-600" />
            Financial Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of your financial data</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-rose-600" />
            Financial Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of your financial data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="text-sm">
              Connect your bank accounts to see AI-powered insights about your spending patterns, recurring
              transactions, and more.
            </p>
            <Button
              onClick={() => router.push("/dashboard/connect-accounts")}
              className="mt-4 bg-rose-600 hover:bg-rose-700"
            >
              Connect Bank Account
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format top spending categories for chart
  const spendingCategoryData =
    insights.topSpendingCategories?.map((category: any, index: number) => ({
      name: category.category,
      value: category.amount || category.total || 0,
      color: COLORS[index % COLORS.length],
    })) || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-rose-600" />
            Financial Insights
          </CardTitle>
          <CardDescription>AI-powered analysis of your financial data</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 px-2 lg:h-9 lg:px-3"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mb-4">
            Last updated: {format(lastUpdated, "MMM d, yyyy h:mm a")}
          </p>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="spending" className="text-xs sm:text-sm">
              Spending
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm">
              Trends
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs sm:text-sm">
              Subscriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center">
                  <BarChartIcon className="h-5 w-5 text-rose-600 mr-2" />
                  <h3 className="font-medium">Monthly Spending</h3>
                </div>
                <p className="text-3xl font-bold mt-2">${insights.totalExpenses?.toFixed(2) || "0.00"}</p>
                <p className="text-sm text-muted-foreground">This month's total expenses</p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Monthly Income</h3>
                </div>
                <p className="text-3xl font-bold mt-2">${insights.totalIncome?.toFixed(2) || "0.00"}</p>
                <p className="text-sm text-muted-foreground">This month's total income</p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center mb-4">
                <PieChartIcon className="h-5 w-5 text-rose-600 mr-2" />
                <h3 className="font-medium">Monthly Income vs. Expenses</h3>
              </div>

              <div className="h-[250px]">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#4ade80" />
                      <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No monthly data available</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spending" className="mt-4 space-y-4">
            <div className="h-[300px] w-full">
              {spendingCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendingCategoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No spending data available</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.topSpendingCategories?.slice(0, 3).map((category: any, index: number) => (
                <div key={index} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{category.category}</p>
                  <p className="text-2xl font-bold">${(category.amount || category.total || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{category.count || 0} transactions</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center">
                    <ArrowUpRight className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium">Average Income</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    $
                    {(monthlyData.reduce((sum, month) => sum + month.income, 0) / (monthlyData.length || 1)).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly average</p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center">
                    <ArrowDownRight className="h-5 w-5 text-rose-600 mr-2" />
                    <h3 className="font-medium">Average Spending</h3>
                  </div>
                  <p className="text-3xl font-bold mt-2">
                    $
                    {(monthlyData.reduce((sum, month) => sum + month.expenses, 0) / (monthlyData.length || 1)).toFixed(
                      2,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Monthly average</p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-rose-600 mr-2" />
                  <h3 className="font-medium">Transaction Insights</h3>
                </div>
                <p className="text-sm mb-4">
                  Your average transaction size is{" "}
                  <span className="font-bold">${insights.averageTransactionSize?.toFixed(2) || "0.00"}</span>
                </p>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <p className="text-sm">
                    <span className="font-medium">Pro Tip:</span> Setting a budget for each category can help you track
                    and control your spending more effectively.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-rose-600 mr-2" />
                  <h3 className="font-medium">Detected Subscriptions</h3>
                </div>
                <p className="text-3xl font-bold mt-2">{insights.detectedSubscriptionsCount || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Total monthly subscription cost: ${insights.totalSubscriptionCost?.toFixed(2) || "0.00"}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-sm">
                  <span className="font-medium">Did you know?</span> The average American spends over $200 per month on
                  subscriptions, and many forget about subscriptions they no longer use.
                </p>
              </div>

              <Button onClick={() => router.push("/dashboard/subscriptions")} variant="outline" className="w-full">
                View All Subscriptions
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
