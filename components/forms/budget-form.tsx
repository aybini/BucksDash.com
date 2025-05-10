"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc, Timestamp, getDocs, query } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BudgetFormProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  budget?: any
  onSuccess?: () => void
}

export function BudgetForm({ userId, isOpen, onClose, budget, onSuccess }: BudgetFormProps) {
  const [loading, setLoading] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()
  const [transactionCategories, setTransactionCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(budget?.month || new Date().toISOString().substring(0, 7))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: budget?.name || "",
      amount: budget?.amount || "",
      category: budget?.category || "",
      description: budget?.description || "",
      notes: budget?.notes || "",
      // We'll handle the month separately
    },
  })

  // Update the form value when selectedMonth changes
  useEffect(() => {
    setValue("month", selectedMonth)
  }, [selectedMonth, setValue])

  const category = watch("category")

  // Fetch transaction categories to populate the dropdown
  useEffect(() => {
    const fetchTransactionCategories = async () => {
      if (!userId) return

      setLoadingCategories(true)
      try {
        // Get unique categories from transactions
        const transactionsRef = collection(db, "users", userId, "transactions")
        const transactionsSnapshot = await getDocs(query(transactionsRef))

        const uniqueCategories = new Set<string>()

        transactionsSnapshot.forEach((doc) => {
          const transaction = doc.data()
          if (transaction.category && transaction.type === "expense") {
            uniqueCategories.add(transaction.category)
          }
        })

        setTransactionCategories(Array.from(uniqueCategories).sort())
      } catch (error) {
        console.error("Error fetching transaction categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      fetchTransactionCategories()
    }
  }, [userId, isOpen])

  const onSubmit = async (data: any) => {
    if (!userId) {
      console.error("No user ID provided")
      return
    }

    setLoading(true)
    try {
      const budgetData = {
        ...data,
        month: selectedMonth, // Use the state value
        amount: Number.parseFloat(data.amount),
        createdAt: budget ? budget.createdAt : Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: userId, // Ensure userId is stored with the budget
      }

      // Use budgetCategories collection instead of budgets
      if (budget?.id) {
        // Update existing budget
        await updateDoc(doc(db, "users", userId, "budgetCategories", budget.id), budgetData)
        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully.",
        })
      } else {
        // Add new budget
        await addDoc(collection(db, "users", userId, "budgetCategories"), budgetData)
        toast({
          title: "Budget added",
          description: "Your budget has been added successfully.",
        })
      }

      reset() // Reset form after successful submission
      onSuccess?.()
    } catch (error) {
      console.error("Error saving budget:", error)
      toast({
        title: "Error",
        description: "Failed to save budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className={isMobile ? "w-[95vw] max-w-lg p-4 rounded-lg" : ""}>
        <DialogHeader>
          <DialogTitle>{budget?.id ? "Edit Budget" : "Add Budget"}</DialogTitle>
          <DialogDescription>
            {budget?.id ? "Update your budget details." : "Add a new budget category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              placeholder="Housing, Groceries, etc."
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" placeholder="Budget details..." {...register("description")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monthly Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="0.00"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be greater than 0" },
                  })}
                />
              </div>
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={category} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Show transaction categories first */}
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : transactionCategories.length > 0 ? (
                    transactionCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))
                  ) : null}

                  {/* Default categories as fallback */}
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="health">Health & Fitness</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="personal">Personal Care</SelectItem>
                  <SelectItem value="debt">Debt Payments</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-month">Budget Month</Label>
            <select
              id="budget-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {formatMonthDisplay(month)}
                </option>
              ))}
            </select>
            {/* Hidden input to include in form data */}
            <input type="hidden" {...register("month", { required: "Month is required" })} />
            {errors.month && <p className="text-sm text-destructive">{errors.month.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Additional notes..." {...register("notes")} />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto touch-manipulation active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {budget ? "Updating..." : "Adding..."}
                </>
              ) : budget ? (
                "Update Budget"
              ) : (
                "Add Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
