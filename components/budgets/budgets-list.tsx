"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle } from "lucide-react"
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
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </div>

      {overBudgetCategories.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Over Budget Alert</AlertTitle>
          <AlertDescription>
            You've exceeded your budget in {overBudgetCategories.length}{" "}
            {overBudgetCategories.length === 1 ? "category" : "categories"}: {overBudgetCategories.join(", ")}. Click on
            the budget amount to quickly adjust it.
          </AlertDescription>
        </Alert>
      )}

      <BudgetProgress categories={categories} transactions={transactions} isLoading={isLoading} />

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
