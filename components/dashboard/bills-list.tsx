"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus, Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { SubscriptionForm } from "@/components/forms/subscription-form"
import type { Subscription } from "@/lib/firebase-service"
import { format, addWeeks, addMonths, addQuarters, addYears } from "date-fns"
import { checkNetworkStatus } from "@/lib/firebase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BillsListProps {
  subscriptions: Subscription[]
  isLoading: boolean
  error?: string
  onRefresh?: () => void
  onDelete?: (id: string) => Promise<void>
  onEdit?: (subscription: Subscription) => void
}

export function BillsList({ subscriptions = [], isLoading, error, onRefresh, onDelete, onEdit }: BillsListProps) {
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [paidSubscriptions, setPaidSubscriptions] = useState<string[]>([])
  const [isOffline, setIsOffline] = useState(!checkNetworkStatus())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // Check network status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine)
    }

    window.addEventListener("online", handleOnlineStatusChange)
    window.addEventListener("offline", handleOnlineStatusChange)

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange)
      window.removeEventListener("offline", handleOnlineStatusChange)
    }
  }, [])

  // Load paid subscriptions from localStorage
  useEffect(() => {
    const savedPaidSubscriptions = localStorage.getItem("paidSubscriptions")
    if (savedPaidSubscriptions) {
      try {
        const parsed = JSON.parse(savedPaidSubscriptions)
        setPaidSubscriptions(parsed)
      } catch (e) {
        console.error("Error parsing paid subscriptions from localStorage", e)
      }
    }
  }, [])

  // Save paid subscriptions to localStorage when changed
  useEffect(() => {
    if (paidSubscriptions.length > 0) {
      localStorage.setItem("paidSubscriptions", JSON.stringify(paidSubscriptions))
    }
  }, [paidSubscriptions])

  const togglePaid = (id: string) => {
    if (paidSubscriptions.includes(id)) {
      setPaidSubscriptions(paidSubscriptions.filter((subId) => subId !== id))
    } else {
      setPaidSubscriptions([...paidSubscriptions, id])
    }
  }

  const openReminderDialog = (subscription: Subscription, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      })
      return
    }

    setSelectedSubscription(subscription)
    setIsReminderDialogOpen(true)
  }

  const handleEdit = (subscription: Subscription, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      })
      return
    }

    if (onEdit) {
      onEdit(subscription)
    } else {
      setSelectedSubscription(subscription)
      setIsFormOpen(true)
    }
  }

  const handleDelete = (subscription: Subscription, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOffline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      })
      return
    }

    setSubscriptionToDelete(subscription)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!subscriptionToDelete?.id) return

    setIsDeleting(true)

    try {
      if (onDelete) {
        await onDelete(subscriptionToDelete.id)
      }

      toast({
        title: "Subscription deleted",
        description: "The subscription has been deleted successfully.",
      })

      // Refresh the list
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error("Error deleting subscription:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setSubscriptionToDelete(null)
    }
  }

  const getNextBillingDate = (subscription: Subscription) => {
    try {
      const dateValue = subscription.nextBillingDate
      let dateObj

      // Handle Firestore Timestamp
      if (typeof dateValue === "object" && "toDate" in dateValue) {
        dateObj = dateValue.toDate()
      } else if (dateValue instanceof Date) {
        dateObj = dateValue
      } else if (typeof dateValue === "object" && "seconds" in dateValue) {
        // Handle Firestore Timestamp-like object without toDate method
        dateObj = new Date((dateValue as any).seconds * 1000)
      } else {
        // Try to parse it as a date string or number
        dateObj = new Date(dateValue as any)
      }

      return format(dateObj, "MMM d, yyyy")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown"
    }
  }

  const getDaysUntilDue = (subscription: Subscription) => {
    try {
      const dateValue = subscription.nextBillingDate
      let dateObj

      // Handle Firestore Timestamp
      if (typeof dateValue === "object" && "toDate" in dateValue) {
        dateObj = dateValue.toDate()
      } else if (dateValue instanceof Date) {
        dateObj = dateValue
      } else if (typeof dateValue === "object" && "seconds" in dateValue) {
        // Handle Firestore Timestamp-like object without toDate method
        dateObj = new Date((dateValue as any).seconds * 1000)
      } else {
        // Try to parse it as a date string or number
        dateObj = new Date(dateValue as any)
      }

      const today = new Date()
      const diffTime = dateObj.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      console.error("Error calculating days:", error)
      return 0
    }
  }

  const getBadgeColor = (subscription: Subscription, paid: boolean) => {
    if (paid) return "bg-green-500"

    const daysUntil = getDaysUntilDue(subscription)
    if (daysUntil < 0) return "bg-red-500"
    if (daysUntil <= 3) return "bg-amber-500"
    return "bg-blue-500"
  }

  const getBadgeText = (subscription: Subscription, paid: boolean) => {
    if (paid) return "Paid"

    const daysUntil = getDaysUntilDue(subscription)
    if (daysUntil < 0) return "Overdue"
    if (daysUntil === 0) return "Due Today"
    if (daysUntil === 1) return "Due Tomorrow"
    return `Due in ${daysUntil} days`
  }

  const getFollowingBillingDate = (subscription: Subscription) => {
    try {
      const dateValue = subscription.nextBillingDate
      let dateObj

      // Handle Firestore Timestamp
      if (typeof dateValue === "object" && "toDate" in dateValue) {
        dateObj = dateValue.toDate()
      } else if (dateValue instanceof Date) {
        dateObj = dateValue
      } else if (typeof dateValue === "object" && "seconds" in dateValue) {
        // Handle Firestore Timestamp-like object without toDate method
        dateObj = new Date((dateValue as any).seconds * 1000)
      } else {
        // Try to parse it as a date string or number
        dateObj = new Date(dateValue as any)
      }

      switch (subscription.billingCycle) {
        case "weekly":
          return format(addWeeks(dateObj, 1), "MMM d, yyyy")
        case "monthly":
          return format(addMonths(dateObj, 1), "MMM d, yyyy")
        case "quarterly":
          return format(addQuarters(dateObj, 1), "MMM d, yyyy")
        case "annually":
          return format(addYears(dateObj, 1), "MMM d, yyyy")
        default:
          return "Unknown"
      }
    } catch (error) {
      console.error("Error calculating next billing date:", error)
      return "Unknown"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg font-medium">Your Bills</h3>
          <Button
            className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto touch-manipulation active:scale-95"
            disabled={true}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg font-medium">Your Bills</h3>
          <Button
            className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto touch-manipulation active:scale-95"
            onClick={() => setIsFormOpen(true)}
            disabled={isOffline}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" className="w-full" disabled={isOffline}>
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg font-medium">Your Bills</h3>
        <Button
          className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto touch-manipulation active:scale-95"
          onClick={() => setIsFormOpen(true)}
          disabled={isOffline}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {isOffline && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Offline mode</AlertTitle>
          <AlertDescription>
            You're currently offline. Some features may be limited until your connection is restored.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm py-3 touch-manipulation">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="paid" className="text-xs sm:text-sm py-3 touch-manipulation">
            Paid
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm py-3 touch-manipulation">
            All Bills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <div className="space-y-3">
            {subscriptions
              .filter((sub) => !paidSubscriptions.includes(sub.id!))
              .map((subscription) => {
                const isPaid = paidSubscriptions.includes(subscription.id!)

                return (
                  <Card key={subscription.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isPaid}
                          onCheckedChange={() => togglePaid(subscription.id!)}
                          className="mt-1 h-5 w-5 touch-manipulation"
                          aria-label={`Mark ${subscription.name} as ${isPaid ? "unpaid" : "paid"}`}
                        />
                        <div className="max-w-[calc(100%-2rem)] sm:max-w-[70%]">
                          <h4 className="font-medium truncate">{subscription.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">{subscription.category}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Due: {getNextBillingDate(subscription)}
                            {` • ${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 self-end sm:self-center">
                        <p className="font-bold">${subscription.amount.toFixed(2)}</p>
                        <Badge className={getBadgeColor(subscription, isPaid)}>
                          {getBadgeText(subscription, isPaid)}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => openReminderDialog(subscription, e)}
                            className="h-10 w-10 touch-manipulation active:scale-95"
                            aria-label="Set reminder"
                          >
                            <Bell className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEdit(subscription, e)}
                            className="h-10 w-10 touch-manipulation active:scale-95"
                            aria-label="Edit subscription"
                          >
                            <Edit2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(subscription, e)}
                            className="h-10 w-10 touch-manipulation active:scale-95"
                            aria-label="Delete subscription"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            {subscriptions.filter((sub) => !paidSubscriptions.includes(sub.id!)).length === 0 && (
              <p className="text-center py-4 text-muted-foreground">No upcoming bills</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          <div className="space-y-3">
            {subscriptions
              .filter((sub) => paidSubscriptions.includes(sub.id!))
              .map((subscription) => {
                return (
                  <Card key={subscription.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => togglePaid(subscription.id!)}
                          className="mt-1 h-5 w-5 touch-manipulation"
                          aria-label={`Mark ${subscription.name} as unpaid`}
                        />
                        <div className="max-w-[calc(100%-2rem)] sm:max-w-[70%]">
                          <h4 className="font-medium line-through opacity-70 truncate">{subscription.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">{subscription.category}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Paid on: {format(new Date(), "MMM d, yyyy")}
                            {` • Next: ${getFollowingBillingDate(subscription)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 self-end sm:self-center">
                        <p className="font-bold opacity-70">${subscription.amount.toFixed(2)}</p>
                        <Badge className="bg-green-500">Paid</Badge>
                      </div>
                    </div>
                  </Card>
                )
              })}
            {subscriptions.filter((sub) => paidSubscriptions.includes(sub.id!)).length === 0 && (
              <p className="text-center py-4 text-muted-foreground">No paid bills</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const isPaid = paidSubscriptions.includes(subscription.id!)

              return (
                <Card key={subscription.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isPaid}
                        onCheckedChange={() => togglePaid(subscription.id!)}
                        className="mt-1 h-5 w-5 touch-manipulation"
                        aria-label={`Mark ${subscription.name} as ${isPaid ? "unpaid" : "paid"}`}
                      />
                      <div className="max-w-[calc(100%-2rem)] sm:max-w-[70%]">
                        <h4 className={`font-medium ${isPaid ? "line-through opacity-70" : ""} truncate`}>
                          {subscription.name}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">{subscription.category}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {isPaid ? "Paid on: " : "Due: "}
                          {isPaid ? format(new Date(), "MMM d, yyyy") : getNextBillingDate(subscription)}
                          {` • ${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 self-end sm:self-center">
                      <p className={`font-bold ${isPaid ? "opacity-70" : ""}`}>${subscription.amount.toFixed(2)}</p>
                      <Badge className={getBadgeColor(subscription, isPaid)}>
                        {getBadgeText(subscription, isPaid)}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => openReminderDialog(subscription, e)}
                          className="h-10 w-10 touch-manipulation active:scale-95"
                          aria-label="Set reminder"
                        >
                          <Bell className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEdit(subscription, e)}
                          className="h-10 w-10 touch-manipulation active:scale-95"
                          aria-label="Edit subscription"
                        >
                          <Edit2 className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(subscription, e)}
                          className="h-10 w-10 touch-manipulation active:scale-95"
                          aria-label="Delete subscription"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
            {subscriptions.length === 0 && <p className="text-center py-4 text-muted-foreground">No bills found</p>}
          </div>
        </TabsContent>
      </Tabs>

      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        subscription={selectedSubscription || undefined}
        onSuccess={onRefresh}
      />

      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bill Reminder Settings</DialogTitle>
            <DialogDescription>Configure when and how you want to be reminded about this bill.</DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="py-4">
              <h4 className="font-medium mb-4 truncate">
                {selectedSubscription.name} - ${selectedSubscription.amount.toFixed(2)}
              </h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>Enable Reminders</span>
                  </div>
                  <Switch checked={true} className="touch-manipulation" aria-label="Enable reminders" />
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Remind me:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="day-before" className="h-5 w-5 touch-manipulation" />
                      <label htmlFor="day-before" className="text-sm">
                        1 day before
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="three-days" className="h-5 w-5 touch-manipulation" />
                      <label htmlFor="three-days" className="text-sm">
                        3 days before
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="week-before" className="h-5 w-5 touch-manipulation" />
                      <label htmlFor="week-before" className="text-sm">
                        1 week before
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="on-due-date" defaultChecked className="h-5 w-5 touch-manipulation" />
                      <label htmlFor="on-due-date" className="text-sm">
                        On due date
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Notification method:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email-notify" defaultChecked className="h-5 w-5 touch-manipulation" />
                      <label htmlFor="email-notify" className="text-sm">
                        Email
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="push-notify" defaultChecked className="h-5 w-5 touch-manipulation" />
                      <label htmlFor="push-notify" className="text-sm">
                        Push notification
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setIsReminderDialogOpen(false)}
              className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto touch-manipulation active:scale-95"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subscription. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-2 sm:mt-0 touch-manipulation active:scale-95">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 touch-manipulation active:scale-95"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
