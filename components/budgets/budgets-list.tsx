"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle, Calendar, Target, TrendingUp, Sparkles, Wallet, BarChart3, AlertTriangle } from "lucide-react"
import { BudgetForm } from "@/components/forms/budget-form"
import { BudgetCategories } from "@/components/dashboard/budget-categories"
import { BudgetProgress } from "@/components/dashboard/budget-progress"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { getBudgetCategories, getTransactions } from "@/lib/firebase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BudgetsList() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)) // YYYY-MM format
  const { user } = useAuth()
  const { toast } = useToast()
  const [overBudgetCategories, setOverBudgetCategories] = useState<string[]>([])

  // Generate an array of the last 12 months in YYYY-MM format
  const getLastTwelveMonths = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(month.toISOString().substring(0, 7))
    }
    return months
  }

  const months = getLastTwelveMonths()

  const fetchData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Fetch budget categories
      const fetchedCategories = await getBudgetCategories(user.uid)

      // Fetch transactions
      const fetchedTransactions = await getTransactions(user.uid)

      // Filter transactions for the selected month
      const filteredTransactions = fetchedTransactions.filter((transaction) => {
        const transactionDate =
          transaction.date instanceof Date ? transaction.date : new Date(transaction.date.seconds * 1000)

        const transactionMonth = transactionDate.toISOString().substring(0, 7)
        return transactionMonth === selectedMonth
      })

      // Check for over-budget categories
      const overBudget: string[] = []
      fetchedCategories.forEach((category) => {
        const spent = filteredTransactions
          .filter((t) => t.category === category.name && t.type === "expense")
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        if (spent > category.amount) {
          overBudget.push(category.name)
        }
      })

      setOverBudgetCategories(overBudget)
      setCategories(fetchedCategories)
      setTransactions(filteredTransactions)
    } catch (error) {
      console.error("Error fetching budget data:", error)
      toast({
        title: "Error",
        description: "Failed to load budget data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user, selectedMonth])

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchData()
  }

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="flex flex-col space-y-8">
      
      {/* Enhanced Header */}
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 dark:from-emerald-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4 group">
            <div className="relative">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent drop-shadow-lg">
                Budget Management
              </h2>
              <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                <Target className="w-6 h-6 text-emerald-500 animate-pulse drop-shadow-lg" />
              </div>
              {/* Glow effect behind text */}
              <div className="absolute inset-0 text-4xl font-bold text-emerald-500/20 blur-lg animate-pulse">
                Budget Management
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700/50">
              <Wallet className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Smart Control</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Enhanced Month Selector */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative flex items-center space-x-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <Calendar className="w-5 h-5 text-teal-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-gray-900 dark:text-white text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {months.map((month) => (
                    <option key={month} value={month} className="bg-white dark:bg-gray-800">
                      {formatMonthDisplay(month)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhanced Add Budget Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
              <Button
                onClick={() => setIsFormOpen(true)}
                className="relative bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:via-emerald-700 hover:to-emerald-800 text-white font-semibold h-12 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 text-base overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Add Budget</span>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Over Budget Alert */}
      {overBudgetCategories.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 backdrop-blur-xl rounded-3xl p-6 border border-red-200/50 dark:border-red-700/50 shadow-2xl relative overflow-hidden group transition-all duration-700 transform animate-in slide-in-from-top-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
          <Alert variant="destructive" className="bg-transparent border-none shadow-none relative z-10">
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping" />
              </div>
              <div className="flex-1">
                <AlertTitle className="text-red-800 dark:text-red-200 font-bold text-lg flex items-center space-x-2">
                  <span>Over Budget Alert</span>
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 mt-2 text-base">
                  You've exceeded your budget in <span className="font-semibold">{overBudgetCategories.length}</span>{" "}
                  {overBudgetCategories.length === 1 ? "category" : "categories"}: <span className="font-semibold">{overBudgetCategories.join(", ")}</span>. 
                  Click on the budget amount to quickly adjust it.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Enhanced Budget Progress Container */}
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6 group">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
              Budget Progress Overview
            </h3>
            <div className="relative">
              <BarChart3 className="w-6 h-6 text-blue-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-75" />
            </div>
          </div>
          
          <BudgetProgress categories={categories} transactions={transactions} isLoading={isLoading} />
        </div>
      </div>

      {/* Enhanced Budget Categories Container */}
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 dark:from-emerald-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6 group">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 bg-clip-text text-transparent drop-shadow-sm">
              Category Breakdown
            </h3>
            <div className="relative">
              <TrendingUp className="w-6 h-6 text-emerald-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-75" />
            </div>
          </div>
          
          <BudgetCategories
            categories={categories}
            transactions={transactions}
            isLoading={isLoading}
            onCategoriesChange={(updatedCategories) => {
              setCategories(updatedCategories)
              // Recalculate over-budget categories
              const overBudget: string[] = []
              updatedCategories.forEach((category) => {
                const spent = transactions
                  .filter((t) => t.category === category.name && t.type === "expense")
                  .reduce((sum, t) => sum + (t.amount || 0), 0)

                if (spent > category.amount) {
                  overBudget.push(category.name)
                }
              })
              setOverBudgetCategories(overBudget)
            }}
          />
        </div>
      </div>

      {user && (
        <BudgetForm
          userId={user.uid}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}