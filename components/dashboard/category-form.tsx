"use client"

import { useState } from "react"
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
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"], {
    required_error: "Please select a category type",
  }),
})

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  category?: BudgetCategory
  onSuccess?: (categories: BudgetCategory[]) => void
}

export function CategoryForm({ isOpen, onClose, category, onSuccess }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      amount: category?.amount || 0,
      type: category?.type || "expense",
    },
  })

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto text-sm h-10">
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-sm h-10"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {category ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{category ? "Update" : "Add"} Budget Category</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { CategoryForm as BudgetCategoryForm }
