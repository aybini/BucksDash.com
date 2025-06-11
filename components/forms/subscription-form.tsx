"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, CreditCard, DollarSign, FileText, Target, Sparkles, Clock, Zap } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface SubscriptionFormProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  subscription?: any
  onSuccess?: () => void
}

export function SubscriptionForm({ userId, isOpen, onClose, subscription, onSuccess }: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
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

  // Generate particles and trigger entrance animation
  useEffect(() => {
    if (isOpen) {
      const generatedParticles = [...Array(8)].map((_, i) => ({
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
    }
  }, [isOpen])

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

  const getBillingCycleIcon = (cycle: string) => {
    switch (cycle) {
      case "weekly":
        return <Clock className="w-4 h-4" />
      case "monthly":
        return <Calendar className="w-4 h-4" />
      case "quarterly":
        return <Target className="w-4 h-4" />
      case "yearly":
        return <Sparkles className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "entertainment":
        return <Sparkles className="w-4 h-4" />
      case "utilities":
        return <Zap className="w-4 h-4" />
      case "software":
        return <Target className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className={`${isMobile ? "w-[95vw] max-w-lg" : ""} p-0 border-none bg-transparent shadow-none max-h-[90vh] overflow-hidden`}>
        <div className="relative bg-gradient-to-br from-gray-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900 rounded-3xl overflow-hidden">
          {/* Scrollable Container */}
          <div className="max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600 scrollbar-track-transparent hover:scrollbar-thumb-indigo-400 dark:hover:scrollbar-thumb-indigo-500 transition-colors duration-300">
          
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-300/10 dark:bg-indigo-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full animate-pulse shadow-lg opacity-40"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  animationDelay: `${particle.animationDelay}s`,
                  animationDuration: `${particle.animationDuration}s`
                }}
              />
            ))}
          </div>

          {/* Form Content */}
          <div className={`relative z-10 p-6 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Dialog Header */}
            <DialogHeader className="mb-6">
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 dark:from-indigo-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700/50">
                    {getBillingCycleIcon(billingCycle)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent drop-shadow-sm">
                      {subscription?.id ? "Update Subscription Details" : "Create New Subscription"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <span>Manage your recurring payments efficiently</span>
                      <CreditCard className="w-4 h-4 text-indigo-500 animate-pulse" />
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Subscription Name Field */}
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Subscription Name</span>
                  </Label>
                  <Input
                    id="name"
                    className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                    placeholder="Netflix, Spotify, etc."
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
                </div>
              </div>

              {/* Description Field */}
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-2">
                  <Label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span>Description (Optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300 min-h-[60px]"
                    placeholder="Subscription details..."
                    {...register("description")}
                  />
                </div>
              </div>

              {/* Amount and Billing Cycle Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount Field */}
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-2">
                    <Label htmlFor="amount" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>Amount</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-6 bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 transition-colors duration-300"
                        placeholder="0.00"
                        {...register("amount", {
                          required: "Amount is required",
                          min: { value: 0.01, message: "Amount must be greater than 0" },
                        })}
                      />
                    </div>
                    {errors.amount && <p className="text-xs text-red-500">{errors.amount.message as string}</p>}
                  </div>
                </div>

                {/* Billing Cycle Field */}
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-2">
                    <Label htmlFor="billingCycle" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Billing Cycle</span>
                    </Label>
                    <Select defaultValue={billingCycle} onValueChange={(value) => setValue("billingCycle", value)}>
                      <SelectTrigger id="billingCycle" className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 transition-colors duration-300">
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20">
                        <SelectItem value="weekly">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Weekly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="monthly">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Monthly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="quarterly">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>Quarterly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="yearly">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Yearly</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Category and Next Billing Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Field */}
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 dark:from-violet-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-2">
                    <Label htmlFor="category" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Target className="w-4 h-4 text-violet-500" />
                      <span>Category</span>
                    </Label>
                    <Select defaultValue={category} onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger id="category" className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 transition-colors duration-300">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20">
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="health">Health & Fitness</SelectItem>
                        <SelectItem value="food">Food & Dining</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Next Billing Date Field */}
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-2">
                    <Label htmlFor="nextBillingDate" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>Next Billing Date</span>
                    </Label>
                    <Input
                      id="nextBillingDate"
                      type="date"
                      className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 transition-colors duration-300"
                      {...register("nextBillingDate", { required: "Next billing date is required" })}
                    />
                    {errors.nextBillingDate && (
                      <p className="text-xs text-red-500">{errors.nextBillingDate.message as string}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5 dark:from-teal-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 space-y-2">
                  <Label htmlFor="notes" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4 text-teal-500" />
                    <span>Notes (Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-teal-500 dark:focus:border-teal-400 transition-colors duration-300 min-h-[60px]"
                    placeholder="Additional notes..."
                    {...register("notes")}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 dark:from-indigo-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:w-auto bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {subscription ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        {subscription ? "Update Subscription" : "Add Subscription"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}