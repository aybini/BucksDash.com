"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  addTransaction,
  updateTransaction,
  type Transaction,
  getBudgetCategories,
  getIncomeSources,
  addBudgetCategory,
} from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction
  onSuccess?: () => void
}

export function TransactionForm({ isOpen, onClose, transaction, onSuccess }: TransactionFormProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<Transaction["type"]>("expense")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [incomeSources, setIncomeSources] = useState<string[]>([])
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newCategoryAmount, setNewCategoryAmount] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)

  // Load categories when the component mounts or when the user changes
  useEffect(() => {
    const loadCategories = async () => {
      if (user) {
        try {
          const budgetCategories = await getBudgetCategories(user.uid)
          const categoryNames = budgetCategories.map((cat) => cat.name)
          setCategories(categoryNames)

          // Set default category if available and none is selected
          if (categoryNames.length > 0 && !category && !transaction) {
            setCategory(categoryNames[0])
          }
        } catch (error) {
          console.error("Error loading categories:", error)
        }
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [user, isOpen])

  // Load income sources when the component mounts or when the user changes
  useEffect(() => {
    const loadIncomeSources = async () => {
      if (user) {
        try {
          const sources = await getIncomeSources(user.uid)
          const sourceNames = sources.map((source) => source.name)
          setIncomeSources(sourceNames)
        } catch (error) {
          console.error("Error loading income sources:", error)
        }
      }
    }

    if (isOpen) {
      loadIncomeSources()
    }
  }, [user, isOpen])

  // Initialize form with transaction data when editing
  useEffect(() => {
    if (transaction && isOpen) {
      // Handle date conversion from Firestore
      if (transaction.date) {
        const dateValue = transaction.date
        if (typeof dateValue === "object" && "toDate" in dateValue) {
          setDate(dateValue.toDate())
        } else {
          setDate(new Date(dateValue as any))
        }
      } else {
        setDate(new Date())
      }

      setDescription(transaction.description || "")
      setAmount(transaction.amount?.toString() || "")
      setCategory(transaction.category || "")
      setType(transaction.type || "expense")
      setNotes(transaction.notes || "")
    } else if (!transaction && isOpen) {
      // Reset form for new transaction
      setDate(new Date())
      setDescription("")
      setAmount("")
      setCategory("")
      setType("expense")
      setNotes("")
    }
  }, [transaction, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a transaction.",
        variant: "destructive",
      })
      return
    }

    if (!description || !amount || !category || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the base transaction data
      const transactionData: Partial<Transaction> = {
        description,
        amount: Number.parseFloat(amount),
        category,
        type,
      }

      // Only add date if it's defined
      if (date) {
        transactionData.date = date
      } else {
        transactionData.date = new Date() // Default to current date if undefined
      }

      // Only add notes if it's defined and not empty
      if (notes && notes.trim()) {
        transactionData.notes = notes.trim()
      }

      if (transaction?.id) {
        // Update existing transaction
        await updateTransaction(user.uid, transaction.id, transactionData as Transaction)
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully.",
        })
      } else {
        // Add new transaction
        await addTransaction(user.uid, transactionData as Transaction)
        toast({
          title: "Transaction added",
          description: "Your transaction has been added successfully.",
        })
      }

      // Reset form and close modal
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date())
      setType("expense")
      setNotes("")

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCategory = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a category.",
        variant: "destructive",
      })
      return
    }

    if (!newCategory) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      })
      return
    }

    const amount = newCategoryAmount ? Number.parseFloat(newCategoryAmount) : 0

    setAddingCategory(true)

    try {
      // Add the new category to the user's budget categories
      await addBudgetCategory(user.uid, {
        name: newCategory,
        amount: amount,
      })

      // Update the categories list
      setCategories([...categories, newCategory])

      // Set the new category as the selected category
      setCategory(newCategory)

      // Close the dialog and reset the form
      setIsAddCategoryOpen(false)
      setNewCategory("")
      setNewCategoryAmount("")

      toast({
        title: "Category added",
        description: "Your new category has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingCategory(false)
    }
  }

  return (
    <>
      <Modal
        title={transaction?.id ? "Edit Transaction" : "Add Transaction"}
        description={transaction?.id ? "Update your transaction details." : "Add a new transaction to your account."}
        isOpen={isOpen}
        onClose={onClose}
      >
        <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as Transaction["type"])}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="category">Category</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddCategoryOpen(true)}
                className="h-8 px-2 text-xs"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add New
              </Button>
            </div>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {type === "income" ? (
                  incomeSources.length > 0 ? (
                    incomeSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="gift">Gift</SelectItem>
                      <SelectItem value="other">Other Income</SelectItem>
                    </>
                  )
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about this transaction"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {transaction ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{transaction ? "Update" : "Add"} Transaction</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add New Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for your transactions and budgets.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-category">Category Name</Label>
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Groceries, Rent, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-category-amount">Monthly Budget Amount (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="new-category-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  value={newCategoryAmount}
                  onChange={(e) => setNewCategoryAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Set a monthly budget limit for this category (you can change this later).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={addingCategory} className="bg-rose-600 hover:bg-rose-700">
              {addingCategory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
