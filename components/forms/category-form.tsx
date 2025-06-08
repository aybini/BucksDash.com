"use client"

import React, { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  addBudgetCategory,
  updateBudgetCategory,
  getBudgetCategories,
  type BudgetCategory,
} from "@/lib/firebase-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Target, DollarSign, Tag, TrendingUp, TrendingDown, Star, Shield, Folder } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"], {
    required_error: "Please select a category type",
  }),
  spent: z.coerce.number().optional(),
})

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  category?: BudgetCategory
  onSuccess?: (categories: BudgetCategory[]) => void
}

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export function CategoryForm({ isOpen, onClose, category, onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      type: "expense" as const,
      spent: 0,
    },
  })

  useEffect(() => {
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

  // Initialize form with category data when editing
  useEffect(() => {
    if (category && isOpen) {
      form.reset({
        name: category.name || "",
        amount: category.amount || 0,
        type: (category as any).type || "expense", // Type assertion to handle missing type property
        spent: (category as any).spent || 0,
      })
    } else if (!category && isOpen) {
      form.reset({
        name: "",
        amount: 0,
        type: "expense",
        spent: 0,
      })
    }
  }, [category, isOpen, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return

    setIsSubmitting(true)
    try {
      if (category?.id) {
        // Update existing category
        await updateBudgetCategory(user.uid, category.id, {
          ...values,
          userId: user.uid,
        })
        toast({
          title: "Category updated",
          description: "Budget category has been updated successfully.",
        })
      } else {
        // Add new category
        await addBudgetCategory(user.uid, {
          ...values,
          userId: user.uid,
        })
        toast({
          title: "Category added",
          description: "New budget category has been added successfully.",
        })
      }

      // Fetch updated categories
      const updatedCategories = await getBudgetCategories(user.uid)

      // Call onSuccess with updated categories
      if (onSuccess) {
        onSuccess(updatedCategories)
      }

      // Close the form
      onClose()
      form.reset()
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`
          ${isMobile 
            ? "w-[95vw] max-w-lg p-4 rounded-3xl max-h-[90vh] overflow-y-auto" 
            : "max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto"
          } 
          bg-gradient-to-br from-white/95 via-teal-50/90 to-white/95 
          dark:from-gray-900/95 dark:via-teal-900/80 dark:to-gray-900/95 
          backdrop-blur-xl border border-gray-200/50 dark:border-white/20 
          shadow-2xl relative
          fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          z-[99999] !important
        `}
        style={{ zIndex: 99999 }}
      >
        
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse shadow-xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 dark:bg-teal-600/10 rounded-full blur-3xl animate-pulse shadow-xl" style={{ animationDelay: '2s' }} />
        </div>

        {/* Fixed Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-pulse shadow-sm opacity-60"
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
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 bg-clip-text text-transparent drop-shadow-sm">
                  {category ? "Edit Category" : "Create Category"}
                </DialogTitle>
                <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <Folder className="w-6 h-6 text-teal-500 animate-pulse drop-shadow-lg" />
                </div>
                {/* Glow effect behind text */}
                <div className="absolute inset-0 text-3xl font-bold text-teal-500/20 blur-lg animate-pulse">
                  {category ? "Edit Category" : "Create Category"}
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-700/50">
                <Target className="w-4 h-4 text-teal-500 animate-pulse" />
                <span className="text-xs font-medium text-teal-700 dark:text-teal-300">Budget Control</span>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
              <span>{category ? "Update your budget category details and optimize your spending control." : "Set up a new budget category to organize your financial tracking."}</span>
              <Sparkles className="w-4 h-4 text-teal-500 animate-pulse" />
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 pt-6 ${isMobile ? 'space-y-4' : ''}`}>
              
              {/* Enhanced Category Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-3 group">
                    <FormLabel className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                      <span>Category Name</span>
                      <Star className="w-4 h-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Housing, Groceries, Entertainment..." 
                          {...field} 
                          className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <Tag className="w-5 h-5 text-teal-500" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enhanced Category Type Field */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3 group">
                    <FormLabel className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                      <span>Category Type</span>
                      <Shield className="w-4 h-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                    </FormLabel>
                    <div className="relative">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-teal-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12">
                            <SelectValue placeholder="Select category type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-xl shadow-2xl z-[99999]">
                          <SelectItem value="expense" className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <TrendingDown className="w-4 h-4 text-red-500" />
                              <span>Expense</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="income" className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span>Income</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {field.value === "income" ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enhanced Budget Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-3 group">
                    <FormLabel className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                      <span>Budget Amount</span>
                      <DollarSign className="w-4 h-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00"
                          {...field} 
                          className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-teal-500 focus:ring-teal-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <DollarSign className="w-5 h-5 text-teal-500" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enhanced Amount Spent Field (only when editing) */}
              {category?.id && (
                <FormField
                  control={form.control}
                  name="spent"
                  render={({ field }) => (
                    <FormItem className="space-y-3 group">
                      <FormLabel className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                        <span>Amount Spent</span>
                        <TrendingDown className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="0.00"
                            {...field} 
                            className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <DollarSign className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-white/20">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="relative w-full sm:w-auto bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105 h-12 px-8 text-base font-medium rounded-xl shadow-lg"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <Button
                    type="submit"
                    className="relative w-full sm:w-auto bg-gradient-to-r from-teal-600 via-teal-600 to-teal-700 hover:from-teal-700 hover:via-teal-700 hover:to-teal-800 text-white font-semibold h-12 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base overflow-hidden group"
                    disabled={isSubmitting}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center space-x-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{category ? "Updating..." : "Creating..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{category ? "Update" : "Create"} Category</span>
                          <Sparkles className="h-4 w-4 animate-pulse" />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </div>

            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { CategoryForm as BudgetCategoryForm }