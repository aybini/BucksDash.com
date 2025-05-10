"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BudgetProgressProps {
  categories: any[]
  transactions: any[]
  isLoading: boolean
}

export function BudgetProgress({ categories, transactions, isLoading }: BudgetProgressProps) {
  // Calculate total budget
  const totalBudget = categories.reduce((sum, category) => sum + (category.amount || 0), 0)

  // Calculate total spent
  const totalSpent = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)

  // Calculate percentage spent
  const percentageSpent = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0

  // Determine status color
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Calculate over/under budget counts
  const overBudgetCount = categories.filter((category) => {
    const spent = transactions
      .filter((transaction) => transaction.category === category.name && transaction.type === "expense")
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
    return spent > category.amount
  }).length

  const underBudgetCount = categories.length - overBudgetCount

  // Determine overall budget status
  const isOverBudget = totalSpent > totalBudget
  const remaining = totalBudget - totalSpent

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Monthly Budget Overview</CardTitle>
        <CardDescription>Track your spending against your monthly budget</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Progress</span>
              <span className="text-sm font-medium">{percentageSpent.toFixed(0)}%</span>
            </div>
            <Progress value={percentageSpent} className={getStatusColor(percentageSpent)} />
            <div className="flex justify-between text-sm">
              <div>
                <span className="font-medium">Spent: </span>
                <span>${totalSpent.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium">Budget: </span>
                <span>${totalBudget.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  {isOverBudget ? (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Over Budget
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Under Budget
                    </Badge>
                  )}
                </div>
                <div className={`text-sm font-medium ${isOverBudget ? "text-red-500" : "text-green-500"}`}>
                  {isOverBudget ? `-$${Math.abs(remaining).toFixed(2)}` : `+$${remaining.toFixed(2)}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-red-50 p-2 rounded-md border border-red-100 flex flex-col items-center">
                  <div className="flex items-center text-red-600 mb-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span className="text-xs font-medium">Over Budget</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">{overBudgetCount}</span>
                  <span className="text-xs text-red-500">Categories</span>
                </div>
                <div className="bg-green-50 p-2 rounded-md border border-green-100 flex flex-col items-center">
                  <div className="flex items-center text-green-600 mb-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span className="text-xs font-medium">Under Budget</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{underBudgetCount}</span>
                  <span className="text-xs text-green-500">Categories</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
