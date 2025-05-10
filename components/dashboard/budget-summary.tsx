"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { getBudgetCategories, getTransactions } from "@/lib/firebase-service"
import { Skeleton } from "@/components/ui/skeleton"
import { startOfMonth, endOfMonth } from "date-fns"

interface BudgetProgress {
  id: string
  category: string
  spent: number
  total: number
  percentage: number
}

export function BudgetSummary() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<BudgetProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBudgetData() {
      if (!user) return

      setIsLoading(true)
      try {
        // Get budget categories
        const categories = await getBudgetCategories(user.uid)

        // Get transactions for current month
        const now = new Date()
        const firstDayOfMonth = startOfMonth(now)
        const lastDayOfMonth = endOfMonth(now)

        const transactions = await getTransactions(user.uid)
        const currentMonthTransactions = transactions.filter((transaction) => {
          const transactionDate = new Date((transaction.date as any).toDate?.() || transaction.date)
          return (
            transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth && transaction.type === "expense"
          )
        })

        // Calculate spending by category
        const spendingByCategory: Record<string, number> = {}

        currentMonthTransactions.forEach((transaction) => {
          if (!spendingByCategory[transaction.category]) {
            spendingByCategory[transaction.category] = 0
          }
          spendingByCategory[transaction.category] += transaction.amount
        })

        // Create budget progress data
        const budgetProgress = categories
          .filter((category) => category.type === "expense")
          .map((category) => {
            const spent = spendingByCategory[category.name] || 0
            const percentage = Math.round((spent / category.amount) * 100)

            return {
              id: category.id!,
              category: category.name,
              spent,
              total: category.amount,
              percentage,
            }
          })
          // Sort by percentage (highest first)
          .sort((a, b) => b.percentage - a.percentage)
          // Limit to top 5
          .slice(0, 5)

        setBudgets(budgetProgress)
      } catch (error) {
        console.error("Error fetching budget data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudgetData()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Summary</CardTitle>
        <CardDescription>Your monthly budget progress.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-[50px] ml-auto" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No budget categories found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-medium text-sm sm:text-base">{budget.category}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    ${budget.spent.toFixed(2)} / ${budget.total.toFixed(2)}
                  </div>
                </div>
                <Progress
                  value={budget.percentage}
                  className={`h-2 sm:h-3 ${budget.percentage > 100 ? "bg-red-200" : ""}`}
                  indicatorClassName={budget.percentage > 100 ? "bg-red-500" : ""}
                />
                <div className="flex justify-end text-[10px] sm:text-xs text-muted-foreground">
                  {budget.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
