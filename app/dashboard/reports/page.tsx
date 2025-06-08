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
import { AlertCircle, BarChart3, TrendingUp, DollarSign, PieChart, Activity, Loader2, Shield, Sparkles, Target, Zap } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  date: Date | any
  category?: string
  description?: string
}

interface DateRange {
  startDate: Date
  endDate: Date
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    endDate: new Date(),
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4
    }))
    setParticles(generatedParticles)
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return
      setIsLoading(true)
      setError(null)

      try {
        const transactionData = await getTransactions(user.uid) as Transaction[]

        const filteredTransactions = transactionData.filter((transaction: Transaction) => {
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
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    const netSavings = totalIncome - totalExpenses

    return { totalIncome, totalExpenses, netSavings }
  }

  const { totalIncome, totalExpenses, netSavings } = calculateSummaryMetrics()

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading financial reports...</span>
              <BarChart3 className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg opacity-40"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 p-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="flex flex-col space-y-8">

          {/* Enhanced Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent drop-shadow-lg">
                    Financial Reports
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <BarChart3 className="w-6 h-6 text-blue-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-blue-500/20 blur-lg animate-pulse">
                    Financial Reports
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700/50">
                  <Shield className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Analytics Focused</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700/50">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Smart Insights</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700/50">
                  <Activity className="w-4 h-4 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Real-time Data</span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mt-4 relative z-10">
              <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                <span>Analyze your financial data and track your progress over time</span>
                <Target className="w-5 h-5 text-blue-500 animate-pulse" />
              </p>
            </div>
          </div>

          {/* Enhanced Report Filters */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 dark:from-indigo-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <ReportFilters dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
            </div>
          </div>

          {error && (
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-red-200/50 dark:border-red-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 dark:from-red-500/10 dark:to-transparent rounded-3xl" />
              <Alert variant="destructive" className="relative z-10 bg-transparent border-none shadow-none">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Summary Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Income */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 dark:from-red-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            {/* Net Savings */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className={`absolute inset-0 bg-gradient-to-r ${netSavings >= 0 ? 'from-emerald-500/5 via-transparent to-emerald-500/5 dark:from-emerald-500/10 dark:to-transparent' : 'from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent'} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${netSavings >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                  <Target className={`w-6 h-6 ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Savings</p>
                  <p className={`text-2xl font-bold ${netSavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}`}>
                    {formatCurrency(netSavings)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions Count */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {transactions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
                    Detailed Analytics
                  </h3>
                  <div className="relative">
                    <Zap className="w-6 h-6 text-blue-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-75" />
                  </div>
                </div>

                <TabsList className="flex flex-wrap gap-2 justify-center sm:justify-start mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/30 rounded-2xl p-2">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300">
                    <PieChart className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="spending" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Spending
                  </TabsTrigger>
                  <TabsTrigger value="income" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Income
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300">
                    <Activity className="w-4 h-4 mr-2" />
                    Trends
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30">
                      <div className="flex items-center space-x-3 mb-4">
                        <PieChart className="w-5 h-5 text-blue-500" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h4>
                      </div>
                      <SpendingByCategory transactions={transactions} />
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="w-5 h-5 text-green-500" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Income vs Expenses</h4>
                      </div>
                      <IncomeVsExpenses transactions={transactions} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="spending" className="pt-4">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <BarChart3 className="w-5 h-5 text-red-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Spending</h4>
                    </div>
                    <MonthlySpendingChart transactions={transactions} />
                  </div>
                </TabsContent>

                <TabsContent value="income" className="pt-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Income Analysis</h4>
                    </div>
                    <IncomeAnalysis transactions={transactions} />
                  </div>
                </TabsContent>

                <TabsContent value="trends" className="pt-4">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-5 h-5 text-purple-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Trends</h4>
                    </div>
                    <TransactionTrends transactions={transactions} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}