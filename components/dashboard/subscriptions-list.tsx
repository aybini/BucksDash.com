"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, doc, deleteDoc } from "firebase/firestore"
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
import { format } from "date-fns"
import { SubscriptionForm } from "@/components/forms/subscription-form"
import { useMobile } from "@/hooks/use-mobile"

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

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const q = query(collection(db, "users", user.uid, "subscriptions"))
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
      default:
        return cycle
    }
  }

  const getNextBillingDate = (subscription: any) => {
    try {
      if (subscription.nextBillingDate) {
        const date = subscription.nextBillingDate.toDate()
        return format(date, "MMM d, yyyy")
      }
      return "Not set"
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Subscriptions</h2>
          <p className="text-muted-foreground">Manage your recurring payments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto" aria-label="Add subscription">
            <Plus className="mr-2 h-4 w-4" /> Add Subscription
          </Button>
          <Button
            variant="outline"
            onClick={fetchSubscriptions}
            className="w-full sm:w-auto"
            aria-label="Refresh subscriptions"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Yearly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalYearly)}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="mb-4 text-center text-muted-foreground">No subscriptions found</p>
            <Button onClick={() => setIsAddOpen(true)}>Add Your First Subscription</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{subscription.name}</CardTitle>
                    <CardDescription>{subscription.description || "No description"}</CardDescription>
                  </div>
                  <Badge>{getBillingCycleLabel(subscription.billingCycle)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{formatCurrency(subscription.amount)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Next: {getNextBillingDate(subscription)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSubscription(subscription)
                    setIsEditOpen(true)
                  }}
                  aria-label={`Edit ${subscription.name}`}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setSelectedSubscription(subscription)
                    setIsDeleteOpen(true)
                  }}
                  aria-label={`Delete ${subscription.name}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Subscription Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-lg p-4 rounded-lg" : ""}>
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
            <DialogDescription>Add a new subscription to track your recurring payments</DialogDescription>
          </DialogHeader>

          <SubscriptionForm
            userId={user?.uid || ""}
            onSuccess={() => {
              setIsAddOpen(false)
              fetchSubscriptions()
              toast({
                title: "Subscription Added",
                description: "Your subscription has been added successfully",
              })
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-lg p-4 rounded-lg" : ""}>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>Update your subscription details</DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <SubscriptionForm
              userId={user?.uid || ""}
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
        </DialogContent>
      </Dialog>

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
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
