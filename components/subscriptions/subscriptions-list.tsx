"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, doc, deleteDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Edit, Calendar, DollarSign, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format, addWeeks, addMonths, addYears } from "date-fns"
import { SubscriptionForm } from "@/components/forms/subscription-form"
import { useMobile } from "@/hooks/use-mobile"
import { isSameDay } from "date-fns"

// Types for our component
interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  category: string
  type: "income" | "expense"
  accountId: string
}

interface Subscription {
  id: string
  name: string
  amount: number
  billingCycle: "monthly" | "yearly" | "weekly"
  category: string
  nextBillingDate: Date
  logo?: string
  source: "detected" | "manual"
  transactionIds?: string[] // For detected subscriptions
}

// Mock transaction data (in a real app, this would come from an API)
const mockTransactions: Transaction[] = [
  {
    id: "t1",
    date: new Date(new Date().setDate(new Date().getDate() - 30)),
    description: "Netflix",
    amount: 15.99,
    category: "Entertainment",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t2",
    date: new Date(new Date().setDate(new Date().getDate() - 60)),
    description: "Netflix",
    amount: 15.99,
    category: "Entertainment",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t3",
    date: new Date(new Date().setDate(new Date().getDate() - 90)),
    description: "Netflix",
    amount: 15.99,
    category: "Entertainment",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t4",
    date: new Date(new Date().setDate(new Date().getDate() - 28)),
    description: "Spotify",
    amount: 9.99,
    category: "Music",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t5",
    date: new Date(new Date().setDate(new Date().getDate() - 58)),
    description: "Spotify",
    amount: 9.99,
    category: "Music",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t6",
    date: new Date(new Date().setDate(new Date().getDate() - 88)),
    description: "Spotify",
    amount: 9.99,
    category: "Music",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t7",
    date: new Date(new Date().setDate(new Date().getDate() - 30)),
    description: "Adobe Creative Cloud",
    amount: 52.99,
    category: "Productivity",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t8",
    date: new Date(new Date().setDate(new Date().getDate() - 60)),
    description: "Adobe Creative Cloud",
    amount: 52.99,
    category: "Productivity",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t9",
    date: new Date(new Date().setDate(new Date().getDate() - 90)),
    description: "Adobe Creative Cloud",
    amount: 52.99,
    category: "Productivity",
    type: "expense",
    accountId: "acc1",
  },
  {
    id: "t10",
    date: new Date(new Date().setDate(new Date().getDate() - 365)),
    description: "Amazon Prime",
    amount: 139,
    category: "Shopping",
    type: "expense",
    accountId: "acc1",
  },
]

export function SubscriptionsList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [totalMonthly, setTotalMonthly] = useState(0)
  const [totalYearly, setTotalYearly] = useState(0)
  const isMobile = useMobile()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("list")

  // Form state for adding a new subscription
  const [newSubscription, setNewSubscription] = useState<Omit<Subscription, "id" | "source">>({
    name: "",
    amount: 0,
    billingCycle: "monthly",
    category: "",
    nextBillingDate: new Date(),
    logo: "/placeholder.svg?height=40&width=40",
  })

  // Detect subscriptions from transaction history
  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const q = query(collection(db, "users", user.uid, "subscriptions"), orderBy("nextBillingDate", "asc"))
      const querySnapshot = await getDocs(q)

      const subs: any[] = []
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() })
      })

      setSubscriptions(subs)

      // Calculate totals
      let monthly = 0
      let yearly = 0

      subs.forEach((sub) => {
        if (sub.billingCycle === "monthly") {
          monthly += sub.amount
          yearly += sub.amount * 12
        } else if (sub.billingCycle === "yearly") {
          yearly += sub.amount
          monthly += sub.amount / 12
        } else if (sub.billingCycle === "weekly") {
          monthly += sub.amount * 4.33 // Average weeks in a month
          yearly += sub.amount * 52
        } else if (sub.billingCycle === "quarterly") {
          monthly += sub.amount / 3
          yearly += sub.amount * 4
        }
      })

      setTotalMonthly(monthly)
      setTotalYearly(yearly)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to detect recurring transactions as subscriptions
  const detectSubscriptions = (transactions: Transaction[]): Subscription[] => {
    const merchantGroups: Record<string, Transaction[]> = {}

    // Group transactions by merchant name
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        if (!merchantGroups[transaction.description]) {
          merchantGroups[transaction.description] = []
        }
        merchantGroups[transaction.description].push(transaction)
      }
    })

    const subscriptions: Subscription[] = []

    // Analyze each merchant group for recurring patterns
    Object.entries(merchantGroups).forEach(([merchant, transactions]) => {
      if (transactions.length >= 2) {
        // Sort transactions by date (newest first)
        const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime())

        // Check if amounts are consistent
        const amounts = sortedTransactions.map((t) => t.amount)
        const isConsistentAmount = amounts.every((amount) => amount === amounts[0])

        if (isConsistentAmount) {
          // Calculate average interval between transactions
          let totalDays = 0
          for (let i = 0; i < sortedTransactions.length - 1; i++) {
            const daysDiff = Math.round(
              (sortedTransactions[i].date.getTime() - sortedTransactions[i + 1].date.getTime()) / (1000 * 60 * 60 * 24),
            )
            totalDays += daysDiff
          }

          const avgInterval = totalDays / (sortedTransactions.length - 1)

          // Determine billing cycle
          let billingCycle: "monthly" | "yearly" | "weekly" = "monthly"
          if (avgInterval >= 350 && avgInterval <= 380) {
            billingCycle = "yearly"
          } else if (avgInterval >= 25 && avgInterval <= 35) {
            billingCycle = "monthly"
          } else if (avgInterval >= 6 && avgInterval <= 8) {
            billingCycle = "weekly"
          } else {
            // Skip if we can't determine a clear billing cycle
            return
          }

          // Calculate next billing date based on most recent transaction and billing cycle
          const lastDate = sortedTransactions[0].date
          let nextBillingDate: Date

          if (billingCycle === "monthly") {
            nextBillingDate = addMonths(lastDate, 1)
          } else if (billingCycle === "yearly") {
            nextBillingDate = addYears(lastDate, 1)
          } else {
            nextBillingDate = addWeeks(lastDate, 1)
          }

          // Create subscription object
          subscriptions.push({
            id: `sub-${merchant.toLowerCase().replace(/\s+/g, "-")}`,
            name: merchant,
            amount: sortedTransactions[0].amount,
            billingCycle,
            category: sortedTransactions[0].category,
            nextBillingDate,
            logo: "/placeholder.svg?height=40&width=40",
            source: "detected",
            transactionIds: sortedTransactions.map((t) => t.id),
          })
        }
      }
    })

    return subscriptions
  }

  const handleDelete = async () => {
    if (!user?.uid || !selectedSubscription) return

    try {
      await deleteDoc(doc(db, "users", user.uid, "subscriptions", selectedSubscription.id))

      toast({
        title: "Subscription Deleted",
        description: `${selectedSubscription.name} has been removed`,
      })

      fetchSubscriptions()
    } catch (error) {
      console.error("Error deleting subscription:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      })
    } finally {
      setIsDeleteOpen(false)
      setSelectedSubscription(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "Monthly"
      case "yearly":
        return "Yearly"
      case "weekly":
        return "Weekly"
      case "quarterly":
        return "Quarterly"
      default:
        return cycle.charAt(0).toUpperCase() + cycle.slice(1)
    }
  }

  const getNextBillingDate = (subscription: any) => {
    try {
      if (subscription.nextBillingDate) {
        // Handle Firestore Timestamp
        const date = subscription.nextBillingDate.toDate
          ? subscription.nextBillingDate.toDate()
          : new Date(subscription.nextBillingDate)
        return format(date, "MMM d, yyyy")
      }
      return "Not set"
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid date"
    }
  }

  const calculateNextBillingDate = (subscription: any) => {
    try {
      if (!subscription.nextBillingDate) return null

      const currentDate = subscription.nextBillingDate.toDate
        ? subscription.nextBillingDate.toDate()
        : new Date(subscription.nextBillingDate)

      switch (subscription.billingCycle) {
        case "weekly":
          return addWeeks(currentDate, 1)
        case "monthly":
          return addMonths(currentDate, 1)
        case "quarterly":
          return addMonths(currentDate, 3)
        case "yearly":
          return addYears(currentDate, 1)
        default:
          return addMonths(currentDate, 1)
      }
    } catch (error) {
      console.error("Error calculating next billing date:", error)
      return null
    }
  }

  // Calculate total monthly cost
  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === "monthly") {
        return total + sub.amount
      } else if (sub.billingCycle === "yearly") {
        return total + sub.amount / 12
      } else if (sub.billingCycle === "weekly") {
        return total + sub.amount * 4.33 // Average weeks in a month
      }
      return total
    }, 0)
  }

  // Calculate total yearly cost
  const calculateYearlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === "monthly") {
        return total + sub.amount * 12
      } else if (sub.billingCycle === "yearly") {
        return total + sub.amount
      } else if (sub.billingCycle === "weekly") {
        return total + sub.amount * 52
      }
      return total
    }, 0)
  }

  // Format date to show days remaining
  const formatDaysRemaining = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Tomorrow"
    } else {
      return `${diffDays} days`
    }
  }

  // Handle deleting a subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id))
    toast({
      title: "Subscription deleted",
      description: "The subscription has been removed from your list.",
    })
  }

  // Handle editing a subscription (placeholder for now)
  const handleEditSubscription = (id: string) => {
    toast({
      title: "Edit subscription",
      description: "This would open the edit form for the subscription.",
    })
  }

  // Handle adding a new subscription
  const handleAddSubscription = () => {
    if (!newSubscription.name || newSubscription.amount <= 0 || !newSubscription.category) {
      toast({
        title: "Invalid subscription",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const subscription: Subscription = {
      ...newSubscription,
      id: `manual-${Date.now()}`,
      source: "manual",
    }

    setSubscriptions([...subscriptions, subscription])
    setIsAddDialogOpen(false)

    // Reset form
    setNewSubscription({
      name: "",
      amount: 0,
      billingCycle: "monthly",
      category: "",
      nextBillingDate: new Date(),
      logo: "/placeholder.svg?height=40&width=40",
    })

    toast({
      title: "Subscription added",
      description: "Your new subscription has been added successfully.",
    })
  }

  // Get subscriptions for the selected date
  const getSubscriptionsForDate = (date: Date | undefined) => {
    if (!date) return []

    return subscriptions.filter((sub) => {
      // Check if this subscription occurs on the selected date
      const subDate = new Date(sub.nextBillingDate)

      // For monthly subscriptions, check if the day of month matches
      if (sub.billingCycle === "monthly" && subDate.getDate() === date.getDate()) {
        return true
      }

      // For yearly subscriptions, check if month and day match
      if (
        sub.billingCycle === "yearly" &&
        subDate.getDate() === date.getDate() &&
        subDate.getMonth() === date.getMonth()
      ) {
        return true
      }

      // For weekly subscriptions, check if day of week matches
      if (sub.billingCycle === "weekly" && subDate.getDay() === date.getDay()) {
        return true
      }

      // Also include exact matches for next billing date
      return isSameDay(subDate, date)
    })
  }

  // Check if a date has any subscriptions
  const hasSubscriptionsOnDate = (date: Date | undefined) => {
    if (!date) return false
    return getSubscriptionsForDate(date).length > 0
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div>
          <h2 className="text-xl font-semibold">Subscriptions</h2>
          <p className="text-sm text-muted-foreground">Manage your recurring payments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
            aria-label="Add subscription"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
            className="w-full sm:w-auto touch-manipulation active:scale-95"
            aria-label="Refresh subscriptions"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-xl font-semibold">{formatCurrency(totalMonthly)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Yearly Spending</CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <p className="text-xl font-semibold">{formatCurrency(totalYearly)}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-4 px-4">
            <p className="mb-3 text-sm text-center text-muted-foreground">No subscriptions found</p>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
            >
              Add Your First Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="flex flex-col h-full shadow-sm">
              <CardHeader className="py-3 px-4 pb-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-semibold">{subscription.name}</CardTitle>
                    {subscription.description && (
                      <CardDescription className="text-xs">{subscription.description}</CardDescription>
                    )}
                  </div>
                  <Badge className="text-xs px-1.5 py-0.5">{getBillingCycleLabel(subscription.billingCycle)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow py-2 px-4">
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatCurrency(subscription.amount)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-xs">Next: {getNextBillingDate(subscription)}</span>
                  </div>
                  {subscription.category && (
                    <div className="mt-1.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {subscription.category}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-2 px-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSubscription(subscription)
                    setIsEditOpen(true)
                  }}
                  className="h-7 px-2 text-xs touch-manipulation active:scale-95"
                  aria-label={`Edit ${subscription.name}`}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive touch-manipulation active:scale-95"
                  onClick={() => {
                    setSelectedSubscription(subscription)
                    setIsDeleteOpen(true)
                  }}
                  aria-label={`Delete ${subscription.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Subscription Dialog */}
      <SubscriptionForm
        userId={user?.uid || ""}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false)
          fetchSubscriptions()
          toast({
            title: "Subscription Added",
            description: "Your subscription has been added successfully",
          })
        }}
      />

      {/* Edit Subscription Dialog */}
      {selectedSubscription && (
        <SubscriptionForm
          userId={user?.uid || ""}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setSelectedSubscription(null)
          }}
          subscription={selectedSubscription}
          onSuccess={() => {
            setIsEditOpen(false)
            fetchSubscriptions()
            toast({
              title: "Subscription Updated",
              description: "Your subscription has been updated successfully",
            })
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-md p-4 rounded-lg" : ""}>
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="touch-manipulation active:scale-95"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="touch-manipulation active:scale-95">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
