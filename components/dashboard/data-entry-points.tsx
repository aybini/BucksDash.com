"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, PieChart, Target, Calendar, CreditCard, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionForm } from "@/components/forms/transaction-form"
import { IncomeSourceForm } from "@/components/forms/income-source-form"
import { GoalForm } from "@/components/forms/goal-form"
import { BudgetCategoryForm } from "@/components/forms/category-form"
import { SubscriptionForm } from "@/components/forms/subscription-form"

export function DataEntryPoints() {
  const router = useRouter()
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false)
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false)
  const [isSubscriptionFormOpen, setIsSubscriptionFormOpen] = useState(false)

  const entryPoints = [
    {
      title: "Add Transaction",
      description: "Record your expenses and income",
      icon: CreditCard,
      color: "bg-blue-100 text-blue-700",
      action: () => setIsTransactionFormOpen(true),
      path: "/dashboard/transactions",
    },
    {
      title: "Income Sources",
      description: "Track your earnings and income",
      icon: Wallet,
      color: "bg-green-100 text-green-700",
      action: () => setIsIncomeFormOpen(true),
      path: "/dashboard/income",
    },
    {
      title: "Budget Categories",
      description: "Set spending limits by category",
      icon: PieChart,
      color: "bg-purple-100 text-purple-700",
      action: () => setIsBudgetFormOpen(true),
      path: "/dashboard/budgets",
    },
    {
      title: "Savings Goals",
      description: "Create and track savings targets",
      icon: Target,
      color: "bg-amber-100 text-amber-700",
      action: () => setIsGoalFormOpen(true),
      path: "/dashboard/goals",
    },
    {
      title: "Recurring Bills",
      description: "Manage subscriptions and bills",
      icon: Calendar,
      color: "bg-rose-100 text-rose-700",
      action: () => setIsSubscriptionFormOpen(true),
      path: "/dashboard/subscriptions",
    },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entryPoints.map((entry, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${entry.color}`}>
                  <entry.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{entry.title}</CardTitle>
              </div>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm">
                Quickly add or manage your {entry.title.toLowerCase()} to keep your financial data up to date.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button
                variant="ghost"
                className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm sm:text-base font-medium touch-manipulation active:scale-95"
                onClick={() => router.push(entry.path)}
              >
                View All
              </Button>
              <Button
                onClick={entry.action}
                className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto px-4 py-3 sm:py-2 text-sm sm:text-base font-medium touch-manipulation active:scale-95"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <TransactionForm isOpen={isTransactionFormOpen} onClose={() => setIsTransactionFormOpen(false)} />

      <IncomeSourceForm isOpen={isIncomeFormOpen} onClose={() => setIsIncomeFormOpen(false)} />

      <BudgetCategoryForm isOpen={isBudgetFormOpen} onClose={() => setIsBudgetFormOpen(false)} />

      <GoalForm isOpen={isGoalFormOpen} onClose={() => setIsGoalFormOpen(false)} />

      <SubscriptionForm isOpen={isSubscriptionFormOpen} onClose={() => setIsSubscriptionFormOpen(false)} />
    </>
  )
}
