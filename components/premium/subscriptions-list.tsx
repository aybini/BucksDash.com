"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CreditCard, Calendar, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getUserSubscriptions, cancelSubscription } from "@/lib/firebase-service"
import { useMobile } from "@/hooks/use-mobile"

interface Subscription {
  id: string
  name: string
  description: string
  price: number
  billingCycle: "monthly" | "yearly"
  status: "active" | "canceled" | "past_due"
  startDate: number
  endDate: number
  nextBillingDate: number
  paymentMethod: {
    type: "card" | "paypal" | "bank"
    last4?: string
    expiryDate?: string
  }
}

export function SubscriptionsList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSubscriptions()
    }
  }, [user])

  const loadSubscriptions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userSubscriptions = await getUserSubscriptions(user.uid)
      setSubscriptions(userSubscriptions)
    } catch (error) {
      console.error("Error loading subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load your subscriptions. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!user) return

    try {
      await cancelSubscription(user.uid, subscriptionId)

      // Update local state
      setSubscriptions(subscriptions.map((sub) => (sub.id === subscriptionId ? { ...sub, status: "canceled" } : sub)))

      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled successfully.",
      })
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "canceled":
        return <Badge className="bg-gray-500">Canceled</Badge>
      case "past_due":
        return <Badge className="bg-red-500">Past Due</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
          <CardDescription>Loading subscriptions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Subscriptions</CardTitle>
        <CardDescription>Manage your active subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You don't have any active subscriptions.</p>
            <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/pricing")}>
              View Plans
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="overflow-hidden border-l-4 border-l-primary">
                <div
                  className={`p-4 ${isMobile ? "flex flex-col gap-2" : "flex justify-between items-center"} cursor-pointer`}
                  onClick={() => toggleExpand(subscription.id)}
                >
                  <div className={`${isMobile ? "w-full" : "flex-1"}`}>
                    <div className={`${isMobile ? "flex justify-between items-start" : "flex items-center gap-2"}`}>
                      <h3 className="font-medium">{subscription.name}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subscription.status)}
                        {isMobile &&
                          (expandedId === subscription.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{subscription.description}</p>
                  </div>

                  <div
                    className={`${isMobile ? "flex justify-between items-center w-full mt-2" : "flex items-center gap-4"}`}
                  >
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(subscription.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.billingCycle === "monthly" ? "per month" : "per year"}
                      </p>
                    </div>

                    {!isMobile &&
                      (expandedId === subscription.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ))}
                  </div>
                </div>

                {expandedId === subscription.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-6"} mt-4`}>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Subscription Details</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p>Started on {formatDate(subscription.startDate)}</p>
                              {subscription.status === "canceled" && <p>Ends on {formatDate(subscription.endDate)}</p>}
                            </div>
                          </li>
                          {subscription.status === "active" && (
                            <li className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <p>Next billing on {formatDate(subscription.nextBillingDate)}</p>
                              </div>
                            </li>
                          )}
                          <li className="flex items-start gap-2">
                            <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p>
                                {subscription.paymentMethod.type === "card"
                                  ? `Card ending in ${subscription.paymentMethod.last4}`
                                  : subscription.paymentMethod.type === "paypal"
                                    ? "PayPal"
                                    : "Bank Account"}
                              </p>
                              {subscription.paymentMethod.type === "card" && subscription.paymentMethod.expiryDate && (
                                <p className="text-xs text-muted-foreground">
                                  Expires {subscription.paymentMethod.expiryDate}
                                </p>
                              )}
                            </div>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Manage Subscription</h4>
                        <div className={`${isMobile ? "flex flex-col gap-2" : "space-y-2"}`}>
                          {subscription.status === "active" && (
                            <>
                              <Button
                                variant="outline"
                                size={isMobile ? "sm" : "default"}
                                className="w-full justify-between"
                                onClick={() => (window.location.href = `/account/billing/${subscription.id}`)}
                              >
                                <span>Update Payment Method</span>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size={isMobile ? "sm" : "default"}
                                className="w-full justify-between"
                                onClick={() => (window.location.href = `/account/billing/${subscription.id}`)}
                              >
                                <span>View Billing History</span>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size={isMobile ? "sm" : "default"}
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelSubscription(subscription.id)
                                }}
                              >
                                Cancel Subscription
                              </Button>
                            </>
                          )}
                          {subscription.status === "canceled" && (
                            <div className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <p>
                                Your subscription has been canceled and will end on {formatDate(subscription.endDate)}.
                                You can reactivate before this date.
                              </p>
                            </div>
                          )}
                          {subscription.status === "past_due" && (
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-sm">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-red-500" />
                                <p>
                                  Your payment is past due. Please update your payment method to avoid service
                                  interruption.
                                </p>
                              </div>
                              <Button
                                variant="default"
                                size={isMobile ? "sm" : "default"}
                                className="w-full"
                                onClick={() => (window.location.href = `/account/billing/${subscription.id}`)}
                              >
                                Update Payment Method
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
