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
import { CalendarIcon, Loader2, PlusCircle, Sparkles, DollarSign } from "lucide-react"
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
      setType(transaction.type || "expense")
      setNotes(transaction.notes || "")
      
      // Handle category - ensure it's set properly
      const transactionCategory = transaction.category || ""
      
      if (transactionCategory) {
        // Always set the category, even if it's not in the loaded categories list
        setCategory(transactionCategory)
        
        // If the category isn't in our loaded categories, add it temporarily
        if (!categories.includes(transactionCategory)) {
          setCategories(prev => [...prev, transactionCategory].sort())
        }
      } else {
        // Set to first available category if no category exists
        if (categories.length > 0) {
          setCategory(categories[0])
        }
      }
    } else if (!transaction && isOpen) {
      // Reset form for new transaction
      setDate(new Date())
      setDescription("")
      setAmount("")
      setType("expense")
      setNotes("")
      
      // Set default category for new transactions
      if (categories.length > 0) {
        setCategory(categories[0])
      } else {
        setCategory("")
      }
    }
  }, [transaction, isOpen, categories])

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

    if (!description.trim() || !amount || !category || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the transaction data
      const transactionData = {
        description: description.trim(),
        amount: Number.parseFloat(amount),
        category,
        type,
        date: date || new Date(),
        ...(notes && notes.trim() && { notes: notes.trim() })
      }

      if (transaction?.id) {
        // Update existing transaction
        await updateTransaction(user.uid, transaction.id, transactionData)
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully.",
        })
      } else {
        // Add new transaction
        await addTransaction(user.uid, transactionData)
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
        description: `Failed to ${transaction?.id ? 'update' : 'save'} transaction. Please try again.`,
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

    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name.",
        variant: "destructive",
      })
      return
    }

    // Check if category already exists (case-insensitive)
    const categoryExists = categories.some(cat => 
      cat.toLowerCase() === newCategory.trim().toLowerCase()
    )
    
    if (categoryExists) {
      toast({
        title: "Category exists",
        description: "This category already exists. Please choose a different name.",
        variant: "destructive",
      })
      return
    }

    const amount = newCategoryAmount ? Number.parseFloat(newCategoryAmount) : 0
    const trimmedCategoryName = newCategory.trim()

    setAddingCategory(true)

    try {
      // Add the new category to the user's budget categories
      await addBudgetCategory(user.uid, {
        name: trimmedCategoryName,
        amount: amount,
      })

      // Update the categories list immediately - this ensures it shows in dropdown
      const updatedCategories = [...categories, trimmedCategoryName].sort()
      setCategories(updatedCategories)

      // Set the new category as the selected category
      setCategory(trimmedCategoryName)

      // Close the dialog and reset the form
      setIsAddCategoryOpen(false)
      setNewCategory("")
      setNewCategoryAmount("")

      toast({
        title: "Category added",
        description: `"${trimmedCategoryName}" has been added and selected for your transaction.`,
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
      {/* Enhanced Modal with Background Effects */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Background Overlay with Blur */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        
        {/* Background Gradient Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Modal Content */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className={`relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-white/20 shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 px-6 py-4 border-b border-gray-200/50 dark:border-white/20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <DollarSign className="w-6 h-6 text-blue-600 animate-pulse" />
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {transaction?.id ? "Edit Transaction" : "Add Transaction"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction?.id ? "Update your transaction details." : "Add a new transaction to your account."}
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-blue-500 animate-pulse ml-auto" />
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-blue-400 dark:hover:scrollbar-thumb-blue-500">
              <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Type</Label>
                      <Select value={type} onValueChange={(value) => setType(value as Transaction["type"])}>
                        <SelectTrigger id="type" className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20">
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-white/15 transition-all",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Grocery shopping"
                        required
                        className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          required
                          className="pl-7 bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddCategoryOpen(true)}
                          className="h-8 px-2 text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50 transition-all hover:scale-105"
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Add New
                        </Button>
                      </div>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger id="category" className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600">
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
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional details about this transaction"
                        className="min-h-[80px] bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with Enhanced Buttons - Now inside form */}
                <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 px-6 py-4 border-t border-gray-200/50 dark:border-white/20">
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onClose} 
                      className="w-full sm:w-auto bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/15 transition-all hover:scale-105"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white font-semibold transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden group" 
                      disabled={isSubmitting}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative flex items-center">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {transaction ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          <>
                            {transaction ? "Update" : "Add"} Transaction
                            <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Add New Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 -mx-6 -mt-6 px-6 py-4 border-b border-gray-200/50 dark:border-white/20">
            <DialogTitle className="flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Add New Category</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new category for your transactions and budgets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600">
            <div className="grid gap-2">
              <Label htmlFor="new-category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</Label>
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Groceries, Rent, etc."
                className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-category-amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Budget Amount (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="new-category-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7 bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  value={newCategoryAmount}
                  onChange={(e) => setNewCategoryAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set a monthly budget limit for this category (you can change this later).
              </p>
            </div>
          </div>
          <DialogFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200/50 dark:border-white/20">
            <Button 
              variant="outline" 
              onClick={() => setIsAddCategoryOpen(false)}
              className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/15 transition-all hover:scale-105"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory} 
              disabled={addingCategory} 
              className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white font-semibold transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center">
                {addingCategory ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Category
                    <Sparkles className="ml-2 h-4 w-4 animate-pulse" />
                  </>
                )}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}