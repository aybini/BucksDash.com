"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SubscriptionFormProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  subscription?: any
  onSuccess?: () => void
}

export function SubscriptionForm({ userId, isOpen, onClose, subscription, onSuccess }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const isMobile = useMobile()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: subscription?.name || "",
      description: subscription?.description || "",
      amount: subscription?.amount || "",
      billingCycle: subscription?.billingCycle || "monthly",
      category: subscription?.category || "entertainment",
      nextBillingDate: subscription?.nextBillingDate
        ? new Date(subscription.nextBillingDate.toDate?.() || subscription.nextBillingDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: subscription?.notes || "",
    },
  })

  const billingCycle = watch("billingCycle")
  const category = watch("category")

  const onSubmit = async (data: any) => {
    if (!userId) {
      console.error("No user ID provided")
      return
    }

    setLoading(true)
    try {
      const subscriptionData = {
        ...data,
        amount: Number.parseFloat(data.amount),
        nextBillingDate: Timestamp.fromDate(new Date(data.nextBillingDate)),
        createdAt: subscription ? subscription.createdAt : Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: userId, // Ensure userId is stored with the subscription
      }

      if (subscription?.id) {
        // Update existing subscription
        await updateDoc(doc(db, "users", userId, "subscriptions", subscription.id), subscriptionData)
      } else {
        // Add new subscription
        await addDoc(collection(db, "users", userId, "subscriptions"), subscriptionData)
      }

      reset() // Reset form after successful submission
      onSuccess?.()
    } catch (error) {
      console.error("Error saving subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className={isMobile ? "w-[95vw] max-w-lg p-3 rounded-lg" : "p-4"}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">{subscription?.id ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
          <DialogDescription className="text-sm">
            {subscription?.id ? "Update your subscription details." : "Add a new subscription or recurring bill."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">
              Subscription Name
            </Label>
            <Input
              id="name"
              className="h-8 text-sm"
              placeholder="Netflix, Spotify, etc."
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              className="text-sm min-h-[60px]"
              placeholder="Subscription details..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-sm">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-6 h-8 text-sm"
                  placeholder="0.00"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be greater than 0" },
                  })}
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billingCycle" className="text-sm">
                Billing Cycle
              </Label>
              <Select defaultValue={billingCycle} onValueChange={(value) => setValue("billingCycle", value)}>
                <SelectTrigger id="billingCycle" className="h-8 text-sm">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly" className="text-sm">
                    Weekly
                  </SelectItem>
                  <SelectItem value="monthly" className="text-sm">
                    Monthly
                  </SelectItem>
                  <SelectItem value="quarterly" className="text-sm">
                    Quarterly
                  </SelectItem>
                  <SelectItem value="yearly" className="text-sm">
                    Yearly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm">
                Category
              </Label>
              <Select defaultValue={category} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category" className="h-8 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entertainment" className="text-sm">
                    Entertainment
                  </SelectItem>
                  <SelectItem value="utilities" className="text-sm">
                    Utilities
                  </SelectItem>
                  <SelectItem value="software" className="text-sm">
                    Software
                  </SelectItem>
                  <SelectItem value="health" className="text-sm">
                    Health & Fitness
                  </SelectItem>
                  <SelectItem value="food" className="text-sm">
                    Food & Dining
                  </SelectItem>
                  <SelectItem value="shopping" className="text-sm">
                    Shopping
                  </SelectItem>
                  <SelectItem value="other" className="text-sm">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nextBillingDate" className="text-sm">
                Next Billing Date
              </Label>
              <Input
                id="nextBillingDate"
                type="date"
                className="h-8 text-sm"
                {...register("nextBillingDate", { required: "Next billing date is required" })}
              />
              {errors.nextBillingDate && (
                <p className="text-xs text-destructive">{errors.nextBillingDate.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              className="text-sm min-h-[60px]"
              placeholder="Additional notes..."
              {...register("notes")}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto touch-manipulation active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {subscription ? "Updating..." : "Adding..."}
                </>
              ) : subscription ? (
                "Update Subscription"
              ) : (
                "Add Subscription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
