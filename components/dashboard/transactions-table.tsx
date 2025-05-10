"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Edit2, Trash2, FileText, BanknoteIcon as BankIcon, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { deleteTransaction, type Transaction } from "@/lib/firebase-service"
import { useToast } from "@/components/ui/use-toast"
import { TransactionForm } from "@/components/forms/transaction-form"
import { checkPlaidConnection } from "@/lib/plaid-client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onRefresh: () => void
}

export function TransactionsTable({ transactions, isLoading, onRefresh }: TransactionsTableProps) {
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [plaidConnected, setPlaidConnected] = useState<boolean | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions)
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const checkConnection = async () => {
      if (user) {
        const status = await checkPlaidConnection(user.uid)
        setPlaidConnected(status.connected)
      }
    }

    checkConnection()
  }, [user])

  useEffect(() => {
    // Apply filters to transactions
    let result = [...transactions]

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(term) ||
          transaction.category.toLowerCase().includes(term) ||
          (transaction.notes && transaction.notes.toLowerCase().includes(term)),
      )
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((transaction) => transaction.category === categoryFilter)
    }

    // Type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter)
    }

    // Date filter
    if (dateFilter) {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)
      const ninetyDaysAgo = new Date(today)
      ninetyDaysAgo.setDate(today.getDate() - 90)

      result = result.filter((transaction) => {
        const transactionDate = new Date((transaction.date as any).toDate?.() || transaction.date)

        if (dateFilter === "last30") {
          return transactionDate >= thirtyDaysAgo
        } else if (dateFilter === "last90") {
          return transactionDate >= ninetyDaysAgo
        } else if (dateFilter === "older") {
          return transactionDate < ninetyDaysAgo
        }

        return true
      })
    }

    setFilteredTransactions(result)
  }, [transactions, searchTerm, categoryFilter, typeFilter, dateFilter])

  const handleEditClick = (transaction: Transaction, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditTransaction(transaction)
    setIsEditFormOpen(true)
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTransactionToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !transactionToDelete) return

    try {
      await deleteTransaction(user.uid, transactionToDelete)
      toast({
        title: "Transaction deleted",
        description: "The transaction has been deleted successfully.",
      })
      onRefresh()
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setTransactionToDelete(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const toggleTransactionDetails = (id: string) => {
    if (expandedTransactionId === id) {
      setExpandedTransactionId(null)
    } else {
      setExpandedTransactionId(id)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setCategoryFilter(null)
    setTypeFilter(null)
    setDateFilter(null)
  }

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(transactions.map((t) => t.category))].sort()

  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p>Loading transactions...</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No transactions yet</h3>
        {plaidConnected === false ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Connect your bank account to automatically import transactions, or add them manually.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                className="mx-auto touch-manipulation active:scale-95"
                onClick={() => (window.location.href = "/dashboard/connect-accounts")}
              >
                <BankIcon className="mr-2 h-4 w-4" />
                Connect Bank Account
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-500">
            Add your first transaction to start tracking your finances.
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
            <div className="relative w-full sm:w-auto">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[250px]"
              />
              <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto touch-manipulation active:scale-95">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {isFilterOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="p-4 border rounded-md mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select value={typeFilter || ""} onValueChange={(value) => setTypeFilter(value || null)}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-filter">Date Range</Label>
                <Select value={dateFilter || ""} onValueChange={(value) => setDateFilter(value || null)}>
                  <SelectTrigger id="date-filter">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="last30">Last 30 days</SelectItem>
                    <SelectItem value="last90">Last 90 days</SelectItem>
                    <SelectItem value="older">Older than 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="touch-manipulation active:scale-95"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop view - Table */}
      <div className="rounded-md border w-full overflow-x-auto hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date((transaction.date as any).toDate?.() || transaction.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100">
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell
                  className={`text-right ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(transaction, e)}
                      className="h-10 w-10 p-0 touch-manipulation active:scale-95"
                      aria-label="Edit transaction"
                    >
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(transaction.id!, e)}
                      className="h-10 w-10 p-0 text-red-500 hover:text-red-600 touch-manipulation active:scale-95"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - Cards */}
      <div className="md:hidden space-y-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="p-4 cursor-pointer touch-manipulation"
                onClick={() => toggleTransactionDetails(transaction.id!)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date((transaction.date as any).toDate?.() || transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                </div>

                {expandedTransactionId === transaction.id && transaction.notes && (
                  <div className="mt-2 pt-2 border-t text-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                    <p className="text-sm">{transaction.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2 pt-2 border-t">
                  <div>
                    {expandedTransactionId === transaction.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(transaction, e)}
                      className="h-8 w-8 p-0 touch-manipulation active:scale-95"
                      aria-label="Edit transaction"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(transaction.id!, e)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 touch-manipulation active:scale-95"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTransactions.length === 0 && (
          <p className="text-center py-4 text-muted-foreground">No transactions match your filters</p>
        )}
      </div>

      <TransactionForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        transaction={editTransaction}
        onSuccess={onRefresh}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-2 sm:mt-0 touch-manipulation active:scale-95">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 touch-manipulation active:scale-95"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}