"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, CheckCircle2, Sparkles, ArrowRight, Loader2, Plus, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSubscriptionDetails, cancelSubscription, deleteUserAccount } from "@/lib/firebase-service"
import { signOut } from "@/lib/firebase-auth"
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

export default function BillingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // Payment method state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isAddingCard, setIsAddingCard] = useState(false)

  // Subscription state
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  // Confirmation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // If not loading and no user, redirect to login
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    if (user) {
      const fetchSubscriptionData = async () => {
        try {
          const data = await getSubscriptionDetails(user.uid)
          console.log("Subscription data:", data)
          setSubscriptionData(data)
        } catch (error) {
          console.error("Error fetching subscription:", error)
          toast({
            title: "Error",
            description: "Failed to load subscription information",
            variant: "destructive",
          })
        } finally {
          setIsLoadingSubscription(false)
        }
      }

      fetchSubscriptionData()
    }
  }, [user, toast])

  // Show loading state or nothing during SSR
  if (loading || !isClient) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </DashboardShell>
    )
  }

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingCard(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      })

      // Reset form
      setCardNumber("")
      setCardName("")
      setExpiryDate("")
      setCvv("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingCard(false)
    }
  }

  const handleUpgradeSubscription = async () => {
    setIsUpgrading(true)

    try {
      // Redirect to subscription page
      router.push(
        `/subscribe?email=${encodeURIComponent(user?.email || "")}&name=${encodeURIComponent(user?.displayName || "")}&password=placeholder`,
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      })
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Cancel the subscription in Firebase
      await cancelSubscription(user.uid)

      // Delete the user account
      await deleteUserAccount(user.uid)

      // Sign out the user
      await signOut()

      toast({
        title: "Account Deleted",
        description: "Your subscription has been cancelled and your account has been deleted.",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
        </div>

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="history">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSubscription ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
                  </div>
                ) : (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Badge className={`mr-2 ${subscriptionData ? "bg-rose-600" : ""}`}>
                          {subscriptionData ? "Premium" : "Basic"}
                        </Badge>
                        <h3 className="font-semibold">{subscriptionData ? "Premium Plan" : "Basic Plan"}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          subscriptionData?.status === "active"
                            ? "text-green-600"
                            : subscriptionData?.status === "canceled"
                              ? "text-amber-600"
                              : "text-blue-600"
                        }`}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {subscriptionData?.status === "active"
                          ? "Active"
                          : subscriptionData?.status === "canceled"
                            ? "Canceling"
                            : "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {subscriptionData
                        ? "You're on the Premium plan with access to all features."
                        : "Basic features with limited functionality. soon you will be able to Upgrade to Premium for full access to all features."}
                    </p>
                    <div className="flex justify-end">
                      {subscriptionData ? (
                        subscriptionData.status === "canceled" ? (
                          <Button variant="outline" className="text-rose-600 border-rose-600" disabled>
                            Cancellation Pending
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="text-rose-600 border-rose-600"
                            onClick={() => setShowCancelDialog(true)}
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              "Cancel Subscription"
                            )}
                          </Button>
                        )
                      ) : (
                        // Commented out "Upgrade to Premium" button
                        /*
                        <Button
                          className="bg-rose-600 hover:bg-rose-700"
                          onClick={handleUpgradeSubscription}
                          disabled={isUpgrading}
                        >
                          {isUpgrading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Upgrading...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Upgrade to Premium
                            </>
                              
                          )}
                        </Button>
                        */
                        <></>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium Plan coming soon</CardTitle>
                <CardDescription>Unlock all features with our Premium plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-rose-50 p-4 dark:bg-rose-950/20">
                  <div className="flex items-center mb-4">
                    <Badge className="mr-2 bg-rose-600">
                      <Sparkles className="mr-1 h-3 w-3" /> Premium
                    </Badge>
                    <h3 className="font-semibold">$9.99/month</h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm">Unlimited transaction tracking</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm">Advanced budgeting tools</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm">AI-powered financial insights</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm">Unlimited savings goals</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm">Premium features for your demographic</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {!subscriptionData ? (
                      // Commented out "Get Premium" button
                      /*
                      <Button
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={handleUpgradeSubscription}
                        disabled={isUpgrading}
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Upgrading...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Get Premium
                          </>
                        )}
                      </Button>
                      */
                      <></>
                    ) : (
                      <Badge className="py-2 px-3 bg-green-600">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Current Plan
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscriptionData ? (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">•••• •••• •••• {Math.floor(1000 + Math.random() * 9000)}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires {Math.floor(1 + Math.random() * 12)}/{Math.floor(24 + Math.random() * 5)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Default
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">You don't have any payment methods yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("add-payment-form")?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card id="add-payment-form">
              <CardHeader>
                <CardTitle>Add Payment Method</CardTitle>
                <CardDescription>Add a new credit or debit card</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddPaymentMethod}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ml-auto bg-rose-600 hover:bg-rose-700" disabled={isAddingCard}>
                    {isAddingCard ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Card
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Premium Subscription</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">$7.99</p>
                        <Badge variant="outline" className="text-green-600">
                          Paid
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">You don't have any billing history yet.</p>
                    <p className="text-xs text-muted-foreground">
                      Your invoices and payment receipts will appear here once you upgrade to a paid plan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel Subscription & Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel your premium subscription and permanently delete your account. All your data will
              be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep My Account</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}