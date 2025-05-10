"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Check, X, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { deleteBudgetCategory } from "@/lib/firebase-service"
import { BudgetForm } from "@/components/forms/budget-form"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BudgetCategoriesProps {
  categories: any[]
  transactions: any[]
  isLoading: boolean
  onCategoriesChange?: (categories: any[]) => void
}

export function BudgetCategories({ categories, transactions, isLoading, onCategoriesChange }: BudgetCategoriesProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [quickEditId, setQuickEditId] = useState<string | null>(null)
  const [quickEditAmount, setQuickEditAmount] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState<"all" | "over" | "under">("all")
  const quickEditInputRef = useRef<HTMLInputElement>(null)

  // Calculate spending for each category
  const getCategorySpending = (categoryName: string) => {
    return transactions
      .filter((transaction) => transaction.category === categoryName && transaction.type === "expense")
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
  }

  // Calculate percentage spent for a category
  const getPercentageSpent = (spent: number, budget: number) => {
    return budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  }

  // Determine status color based on percentage spent
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Filter categories based on active filter
  const filteredCategories = useMemo(() => {
    if (activeFilter === "all") return categories

    return categories.filter((category) => {
      const spent = getCategorySpending(category.name)
      if (activeFilter === "over") return spent > category.amount
      if (activeFilter === "under") return spent <= category.amount
      return true
    })
  }, [categories, transactions, activeFilter])

  // Get counts for filter badges
  const overBudgetCount = useMemo(() => {
    return categories.filter((category) => {
      const spent = getCategorySpending(category.name)
      return spent > category.amount
    }).length
  }, [categories, transactions])

  const underBudgetCount = useMemo(() => {
    return categories.filter((category) => {
      const spent = getCategorySpending(category.name)
      return spent <= category.amount
    }).length
  }, [categories, transactions])

  // Start quick edit mode
  const startQuickEdit = (category: any) => {
    setQuickEditId(category.id)
    setQuickEditAmount(category.amount.toString())
    // Focus the input after it renders
    setTimeout(() => {
      if (quickEditInputRef.current) {
        quickEditInputRef.current.focus()
        quickEditInputRef.current.select()
      }
    }, 10)
  }

  // Cancel quick edit mode
  const cancelQuickEdit = () => {
    setQuickEditId(null)
    setQuickEditAmount("")
  }

  // Save quick edit changes
  const saveQuickEdit = async () => {
    if (!user || !quickEditId) return

    const amount = Number.parseFloat(quickEditAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      })
      return
    }

    try {
      const categoryToUpdate = categories.find((cat) => cat.id === quickEditId)
      if (!categoryToUpdate) return

      // Update directly using Firestore API to ensure we're using the correct collection
      const categoryRef = doc(db, "users", user.uid, "budgetCategories", quickEditId)
      await updateDoc(categoryRef, {
        amount: amount,
        updatedAt: new Date(),
      })

      // Update the local state
      const updatedCategories = categories.map((cat) => (cat.id === quickEditId ? { ...cat, amount: amount } : cat))

      if (onCategoriesChange) {
        onCategoriesChange(updatedCategories)
      }

      toast({
        title: "Budget updated",
        description: "Budget amount has been updated successfully.",
      })

      // Exit quick edit mode
      setQuickEditId(null)
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle keyboard events for quick edit
  const handleQuickEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveQuickEdit()
    } else if (e.key === "Escape") {
      cancelQuickEdit()
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!user) return

    try {
      // Use the correct collection path
      const categoryRef = doc(db, "users", user.uid, "budgetCategories", categoryId)
      await deleteBudgetCategory(user.uid, categoryId)

      // Update the categories list
      const updatedCategories = categories.filter((cat) => cat.id !== categoryId)
      if (onCategoriesChange) {
        onCategoriesChange(updatedCategories)
      }

      toast({
        title: "Category deleted",
        description: "Budget category has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>Track spending by category</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as "all" | "over" | "under")}>
                <TabsList className="grid grid-cols-3 h-8">
                  <TabsTrigger value="all" className="text-xs px-2">
                    All ({categories.length})
                  </TabsTrigger>
                  <TabsTrigger value="over" className="text-xs px-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                      Over ({overBudgetCount})
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="under" className="text-xs px-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Under ({underBudgetCount})
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {activeFilter === "all"
                ? "No budget categories found. Add a budget to get started."
                : activeFilter === "over"
                  ? "No categories are over budget. Great job!"
                  : "No categories are under budget."}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category) => {
                const spent = getCategorySpending(category.name)
                const percentage = getPercentageSpent(spent, category.amount)
                const isOverBudget = spent > category.amount

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{category.name}</span>
                        {isOverBudget ? (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1">
                            Over Budget
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-[10px] h-5 px-1"
                          >
                            Under Budget
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEdit(category)}
                            title="Edit all details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDelete(category.id)}
                            title="Delete budget"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>

                      {quickEditId === category.id ? (
                        <div className="flex items-center space-x-1">
                          <div className="relative">
                            <DollarSign className="h-3.5 w-3.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              ref={quickEditInputRef}
                              type="number"
                              value={quickEditAmount}
                              onChange={(e) => setQuickEditAmount(e.target.value)}
                              onKeyDown={handleQuickEditKeyDown}
                              className="w-24 h-8 pl-7 pr-2 py-1 text-sm"
                              step="0.01"
                              min="0.01"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600"
                            onClick={saveQuickEdit}
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Save</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={cancelQuickEdit}
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`text-sm flex items-center space-x-1 cursor-pointer hover:underline ${isOverBudget ? "text-red-500 font-medium" : ""}`}
                          onClick={() => startQuickEdit(category)}
                          title="Click to edit amount"
                        >
                          <span>
                            ${spent.toFixed(2)} / ${category.amount?.toFixed(2)}
                          </span>
                          {isOverBudget && <span className="text-xs font-bold">(Over!)</span>}
                        </div>
                      )}
                    </div>
                    <Progress value={percentage} className={getStatusColor(percentage)} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {user && editingCategory && (
        <BudgetForm
          userId={user.uid}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingCategory(null)
          }}
          budget={editingCategory}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  )
}
