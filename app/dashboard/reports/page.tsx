"use client"

import { AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getTransactions } from "@/lib/firebase-service"
import { ReportFilters } from "@/components/reports/report-filters"
import { SpendingByCategory } from "@/components/reports/spending-by-category"
import { IncomeVsExpenses } from "@/components/reports/income-vs-expenses"
import { MonthlySpendingChart } from "@/components/reports/monthly-spending-chart"
import { TransactionTrends } from "@/components/reports/transaction-trends"
import { IncomeAnalysis } from "@/components/reports/income-analysis"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"

export default function ReportsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    endDate: new Date(),
  })
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return
      setIsLoading(true)
      setError(null)

      try {
        const transactionData = await getTransactions(user.uid)

        const filteredTransactions = transactionData.filter((transaction) => {
          const transactionDate =
            transaction.date instanceof Date ? transaction.date : transaction.date?.toDate?.() || new Date()
          return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate
        })

        setTransactions(filteredTransactions)
      } catch (err) {
        console.error("Error fetching transaction data:", err)
        setError("Failed to load transaction data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.uid, dateRange])

  const calculateSummaryMetrics = () => {
    if (!transactions.length) return { totalIncome: 0, totalExpenses: 0, netSavings: 0 }

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const netSavings = totalIncome - totalExpenses

    return { totalIncome, totalExpenses, netSavings }
  }

  const { totalIncome, totalExpenses, netSavings } = calculateSummaryMetrics()

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
  }

  return (
    <div className="flex flex-col space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
      <p className="text-muted-foreground">Analyze your financial data and track your progress over time.</p>

      <ReportFilters dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netSavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(netSavings)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap gap-2 justify-center sm:justify-start mt-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="spending">Spending</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpendingByCategory transactions={transactions} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IncomeVsExpenses transactions={transactions} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="spending" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlySpendingChart transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="income" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Income Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncomeAnalysis transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionTrends transactions={transactions} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
