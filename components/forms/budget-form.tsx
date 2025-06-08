"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc, Timestamp, getDocs, query } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Target, DollarSign, Calendar, FileText, Tag, PiggyBank, Star } from "lucide-react"
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

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export function BudgetForm({ userId, isOpen, onClose, budget, onSuccess }: BudgetFormProps) {
  const [loading, setLoading] = useState(false)
  const isMobile = useMobile()
  const { toast } = useToast()
  const [transactionCategories, setTransactionCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(budget?.month || new Date().toISOString().substring(0, 7))
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

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
      month: budget?.month || new Date().toISOString().substring(0, 7),
    },
  })

  useEffect(() => {
    console.log("BudgetForm isOpen changed:", isOpen); // Debug log
    if (isOpen) {
      // Generate particles only when dialog opens
      const generatedParticles = [...Array(6)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3
      }))
      setParticles(generatedParticles)
      
      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsVisible(false)
      setParticles([])
    }
  }, [isOpen])

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

  console.log("BudgetForm rendering with isOpen:", isOpen); // Debug log

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open); // Debug log
        if (!open) onClose()
      }}
    >
      <DialogContent 
        className={`
          ${isMobile 
            ? "w-[95vw] max-w-lg p-4 rounded-3xl max-h-[90vh] overflow-y-auto" 
            : "max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto"
          } 
          bg-gradient-to-br from-white/95 via-emerald-50/90 to-white/95 
          dark:from-gray-900/95 dark:via-emerald-900/80 dark:to-gray-900/95 
          backdrop-blur-xl border border-gray-200/50 dark:border-white/20 
          shadow-2xl relative
          fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          z-[99999] !important
        `}
        style={{ zIndex: 99999 }}
      >
        
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-pulse shadow-xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 dark:bg-emerald-600/10 rounded-full blur-3xl animate-pulse shadow-xl" style={{ animationDelay: '2s' }} />
        </div>

        {/* Fixed Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse shadow-sm opacity-60"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            />
          ))}
        </div>

        <div className={`relative z-10 transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } ${isMobile ? 'pb-4' : ''}`}>
          
          {/* Enhanced Header */}
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-200/50 dark:border-white/20">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 bg-clip-text text-transparent drop-shadow-sm">
                  {budget?.id ? "Edit Budget" : "Create Budget"}
                </DialogTitle>
                <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <Target className="w-6 h-6 text-emerald-500 animate-pulse drop-shadow-lg" />
                </div>
                {/* Glow effect behind text */}
                <div className="absolute inset-0 text-3xl font-bold text-emerald-500/20 blur-lg animate-pulse">
                  {budget?.id ? "Edit Budget" : "Create Budget"}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-700/50">
                <PiggyBank className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Smart Planning</span>
              </div>
            </div>
            <DialogDescription className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
              <span>{budget?.id ? "Update your budget details and optimize your financial planning." : "Set up a new budget category to take control of your spending."}</span>
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 pt-6 ${isMobile ? 'space-y-4' : ''}`}>
            
            {/* Enhanced Budget Name Field */}
            <div className="space-y-3 group">
              <Label htmlFor="name" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Budget Name</span>
                <Star className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="Housing, Groceries, Entertainment..."
                  {...register("name", { required: "Name is required" })}
                  className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Tag className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {errors.name && <p className="text-sm text-red-500 flex items-center space-x-1">
                <span>{errors.name.message as string}</span>
              </p>}
            </div>

            {/* Enhanced Description Field */}
            <div className="space-y-3 group">
              <Label htmlFor="description" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Description</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
                <FileText className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </Label>
              <div className="relative">
                <Textarea 
                  id="description" 
                  placeholder="Detailed budget information and goals..." 
                  {...register("description")} 
                  className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl shadow-sm hover:shadow-md resize-none"
                  rows={3}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Enhanced Amount and Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Enhanced Amount Field */}
              <div className="space-y-3 group">
                <Label htmlFor="amount" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Monthly Amount</span>
                  <DollarSign className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                    placeholder="0.00"
                    {...register("amount", {
                      required: "Amount is required",
                      min: { value: 0.01, message: "Amount must be greater than 0" },
                    })}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message as string}</p>}
              </div>

              {/* Enhanced Category Field */}
              <div className="space-y-3 group">
                <Label htmlFor="category" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Category</span>
                  <Tag className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-6" />
                </Label>
                <div className="relative">
                  <Select defaultValue={category} onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger id="category" className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-xl shadow-2xl z-[99999]">
                      {/* Show transaction categories first */}
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled className="text-gray-500">
                          Loading categories...
                        </SelectItem>
                      ) : transactionCategories.length > 0 ? (
                        transactionCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">
                            {cat}
                          </SelectItem>
                        ))
                      ) : null}

                      {/* Default categories as fallback */}
                      <SelectItem value="housing" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Housing</SelectItem>
                      <SelectItem value="transportation" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Transportation</SelectItem>
                      <SelectItem value="food" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Food & Dining</SelectItem>
                      <SelectItem value="utilities" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Utilities</SelectItem>
                      <SelectItem value="entertainment" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Entertainment</SelectItem>
                      <SelectItem value="health" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Health & Fitness</SelectItem>
                      <SelectItem value="shopping" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Shopping</SelectItem>
                      <SelectItem value="personal" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Personal Care</SelectItem>
                      <SelectItem value="debt" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Debt Payments</SelectItem>
                      <SelectItem value="savings" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Savings</SelectItem>
                      <SelectItem value="other" className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Enhanced Month Selector */}
            <div className="space-y-3 group">
              <Label htmlFor="budget-month" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Budget Month</span>
                <Calendar className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <select
                  id="budget-month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12 pr-4"
                >
                  {months.map((month) => (
                    <option key={month} value={month} className="bg-white dark:bg-gray-800">
                      {formatMonthDisplay(month)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              {/* Hidden input to include in form data */}
              <input type="hidden" {...register("month", { required: "Month is required" })} />
              {errors.month && <p className="text-sm text-red-500">{errors.month.message as string}</p>}
            </div>

            {/* Enhanced Notes Field */}
            <div className="space-y-3 group">
              <Label htmlFor="notes" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Notes</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
                <FileText className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </Label>
              <div className="relative">
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes, reminders, or goals..." 
                  {...register("notes")} 
                  className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-emerald-500 focus:ring-emerald-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl shadow-sm hover:shadow-md resize-none"
                  rows={3}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-white/20">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="relative w-full sm:w-auto bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105 h-12 px-8 text-base font-medium rounded-xl shadow-lg"
                >
                  <span className="flex items-center space-x-2">
                    <span>Cancel</span>
                  </span>
                </Button>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                <Button
                  type="submit"
                  disabled={loading}
                  className="relative w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:via-emerald-700 hover:to-emerald-800 text-white font-semibold h-12 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center space-x-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{budget ? "Updating..." : "Creating..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{budget ? "Update Budget" : "Create Budget"}</span>
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </DialogFooter>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}