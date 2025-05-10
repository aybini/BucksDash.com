"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, RefreshCw } from "lucide-react"
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
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions</h2>
        <div className="flex flex-wrap gap-2">
          {/*  
          <Button
            onClick={handleRefreshPlaid}
            variant="outline"
            className="text-sm h-9 px-3 sm:px-4 touch-manipulation active:scale-95"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Syncing..." : "Sync Bank Data"}
          </Button>
          */}
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-sm h-9 px-3 sm:px-4 touch-manipulation active:scale-95"
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Transaction
          </Button>
          <Button
            onClick={() => setIsFilterOpen(true)}
            variant="outline"
            className="text-sm h-9 px-3 sm:px-4 touch-manipulation active:scale-95"
          >
            <Filter className="mr-1 h-4 w-4" />
            Filter
            {getActiveFiltersCount() > 0 && (
              <Badge className="ml-1 bg-rose-600 text-white">{getActiveFiltersCount()}</Badge>
            )}
          </Button>
        </div>
      </div>

      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm font-medium">Active Filters:</span>

          {activeFilters.startDate && (
            <Badge variant="secondary">From: {new Date(activeFilters.startDate).toLocaleDateString()}</Badge>
          )}
          {activeFilters.endDate && (
            <Badge variant="secondary">To: {new Date(activeFilters.endDate).toLocaleDateString()}</Badge>
          )}
          {activeFilters.minAmount !== undefined && (
            <Badge variant="secondary">Min: {formatCurrency(activeFilters.minAmount)}</Badge>
          )}
          {activeFilters.maxAmount !== undefined && (
            <Badge variant="secondary">Max: {formatCurrency(activeFilters.maxAmount)}</Badge>
          )}
          {activeFilters.types.length === 1 && (
            <Badge variant="secondary">{activeFilters.types[0] === "income" ? "Income Only" : "Expenses Only"}</Badge>
          )}

          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-7 text-xs">
            Clear All
          </Button>
        </div>
      )}

      <TransactionsTable
        transactions={filteredTransactions}
        isLoading={isLoading || isRefreshing}
        onRefresh={fetchTransactions}
      />

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
