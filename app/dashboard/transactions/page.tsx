"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, RefreshCw, Sparkles, TrendingUp, Activity, Zap, DollarSign, Calendar, ArrowUpDown } from "lucide-react"
import { TransactionForm } from "@/components/forms/transaction-form"
import {
  TransactionFilters,
  type TransactionFilters as FilterOptions,
} from "@/components/dashboard/transaction-filters"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { useAuth } from "@/lib/auth-context"
import { getTransactions, type Transaction } from "@/lib/firebase-service"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { refreshPlaidTransactions } from "@/lib/plaid-client"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    types: ["income", "expense"],
  })
  const { user } = useAuth()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(12)].map((_, i) => ({
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

  const fetchTransactions = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await getTransactions(user.uid)
      console.log("Fetched transactions:", data.length)
      setAllTransactions(data)
      setFilteredTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [user])

  const handleRefreshPlaid = async () => {
    if (!user) return

    setIsRefreshing(true)
    try {
      const result = await refreshPlaidTransactions(user.uid)
      if (result.success) {
        toast({
          title: "Transactions refreshed",
          description: `Successfully synced ${result.count || 0} transactions from your bank accounts.`,
        })
        fetchTransactions()
      } else {
        toast({
          title: "Refresh failed",
          description: result.error || "Failed to refresh transactions from your bank accounts.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error refreshing Plaid transactions:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while refreshing your transactions.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters)

    let filtered = [...allTransactions]

    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      startDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((t) => getTransactionDate(t) >= startDate)
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((t) => getTransactionDate(t) <= endDate)
    }

    if (filters.minAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount >= filters.minAmount!)
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount <= filters.maxAmount!)
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((t) => filters.types.includes(t.type))
    }

    setFilteredTransactions(filtered)
  }

  const getTransactionDate = (transaction: Transaction): Date => {
    if (transaction.date instanceof Date) return transaction.date
    if (typeof transaction.date === "object" && "toDate" in transaction.date) return (transaction.date as any).toDate()
    if (typeof transaction.date === "string") return new Date(transaction.date)
    return new Date()
  }

  const handleTransactionSuccess = () => {
    fetchTransactions()
    setIsFormOpen(false)
  }

  const handleFilter = (filters: FilterOptions) => {
    applyFilters(filters)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    const defaultFilters = { types: ["income", "expense"] }
    applyFilters(defaultFilters)
  }

  const getActiveFiltersCount = (): number => {
    let count = 0
    if (activeFilters.startDate) count++
    if (activeFilters.endDate) count++
    if (activeFilters.minAmount !== undefined) count++
    if (activeFilters.maxAmount !== undefined) count++
    if (activeFilters.types.length < 2) count++
    return count
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
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
                    Transactions
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpDown className="w-6 h-6 text-blue-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-blue-500/20 blur-lg animate-pulse">
                    Transactions
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700/50">
                  <DollarSign className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Financial Flow</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/*  
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <Button
                    onClick={handleRefreshPlaid}
                    variant="outline"
                    className="relative bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105 h-12 px-6 text-base font-medium rounded-xl shadow-lg"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`mr-2 h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Syncing..." : "Sync Bank Data"}
                    {isRefreshing && <div className="absolute inset-0 bg-green-400/20 rounded-xl animate-pulse" />}
                  </Button>
                </div>
                */}
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white font-semibold h-12 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 text-base overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center space-x-2">
                      <PlusCircle className="h-5 w-5" />
                      <span>Add Transaction</span>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </span>
                  </Button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <Button
                    onClick={() => setIsFilterOpen(true)}
                    variant="outline"
                    className="relative bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105 h-12 px-6 text-base font-medium rounded-xl shadow-lg"
                  >
                    <Filter className="mr-2 h-5 w-5" />
                    <span>Filter</span>
                    {getActiveFiltersCount() > 0 && (
                      <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white animate-pulse shadow-lg">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 backdrop-blur-xl rounded-3xl p-6 border border-purple-200/50 dark:border-purple-700/50 shadow-2xl relative overflow-hidden group transition-all duration-700 transform animate-in slide-in-from-top-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-lg font-semibold text-purple-900 dark:text-purple-100">Active Filters:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeFilters.startDate && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-3 py-1 rounded-full shadow-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        From: {new Date(activeFilters.startDate).toLocaleDateString()}
                      </Badge>
                    )}
                    {activeFilters.endDate && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded-full shadow-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        To: {new Date(activeFilters.endDate).toLocaleDateString()}
                      </Badge>
                    )}
                    {activeFilters.minAmount !== undefined && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full shadow-sm">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Min: {formatCurrency(activeFilters.minAmount)}
                      </Badge>
                    )}
                    {activeFilters.maxAmount !== undefined && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/30 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full shadow-sm">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Max: {formatCurrency(activeFilters.maxAmount)}
                      </Badge>
                    )}
                    {activeFilters.types.length === 1 && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/40 dark:to-indigo-800/30 border-indigo-200 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full shadow-sm">
                        <Activity className="w-3 h-3 mr-1" />
                        {activeFilters.types[0] === "income" ? "Income Only" : "Expenses Only"}
                      </Badge>
                    )}
                  </div>

                  <div className="ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters} 
                      className="bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-sm border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 rounded-xl shadow-sm h-8 px-4 text-sm font-medium"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Transactions Table Container with Fixed Height and Scroll */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            {/* Header Section - Fixed */}
            <div className="relative z-10 p-8 pb-6 border-b border-gray-200/50 dark:border-white/20">
              <div className="flex items-center space-x-3 group">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
                  Transaction History
                </h3>
                <div className="relative">
                  <TrendingUp className="w-6 h-6 text-blue-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-75" />
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="relative z-10 h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-blue-400 dark:hover:scrollbar-thumb-blue-500">
              <div className="p-8 pt-6">
                <TransactionsTable
                  transactions={filteredTransactions}
                  isLoading={isLoading || isRefreshing}
                  onRefresh={fetchTransactions}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <TransactionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={handleTransactionSuccess} />
      <TransactionFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={handleFilter}
        initialFilters={activeFilters}
      />
    </div>
  )
}