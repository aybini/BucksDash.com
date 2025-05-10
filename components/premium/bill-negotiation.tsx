"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles, TrendingDown, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-init"

// Mock data structure - in a real app, this would come from your backend
const mockBillOpportunities = [
  {
    id: "bill-1",
    provider: "Internet Service",
    currentBill: 89.99,
    potentialSavings: 25,
    confidence: "High",
    status: "ready",
    description: "We found a promotion with your current provider that could save you $25/month.",
  },
  {
    id: "bill-2",
    provider: "Cell Phone Plan",
    currentBill: 120,
    potentialSavings: 35,
    confidence: "Medium",
    status: "ready",
    description: "Switching to a different plan with the same provider could save you $35/month.",
  },
  {
    id: "bill-3",
    provider: "Streaming Services",
    currentBill: 45.97,
    potentialSavings: 15.99,
    confidence: "High",
    status: "ready",
    description: "You have overlapping services. Consolidating could save you $15.99/month.",
  },
  {
    id: "bill-4",
    provider: "Insurance",
    currentBill: 175,
    potentialSavings: 40,
    confidence: "Medium",
    status: "in_progress",
    progress: 65,
    description: "Our negotiation team is working with your insurance provider to lower your rate.",
  },
  {
    id: "bill-5",
    provider: "Gym Membership",
    currentBill: 49.99,
    potentialSavings: 10,
    confidence: "Low",
    status: "completed",
    savedAmount: 10,
    description: "We successfully negotiated a loyalty discount on your gym membership.",
  },
]

export function BillNegotiation() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [billOpportunities, setBillOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchBillOpportunities()
    }
  }, [user])

  const fetchBillOpportunities = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      // Check if user has bill opportunities stored
      const userBillsRef = doc(db, "users", user.uid, "premium", "billNegotiation")
      const docSnap = await getDoc(userBillsRef)

      if (docSnap.exists()) {
        // User has existing bill opportunities
        const userData = docSnap.data()
        setBillOpportunities(userData.opportunities || mockBillOpportunities)
      } else {
        // First time - initialize with mock data and store in Firestore
        await setDoc(userBillsRef, {
          opportunities: mockBillOpportunities,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setBillOpportunities(mockBillOpportunities)
      }
    } catch (error) {
      console.error("Error fetching bill opportunities:", error)
      // Fall back to mock data if there's an error
      setBillOpportunities(mockBillOpportunities)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (bill) => {
    setSelectedBill(bill)
    setIsDetailsOpen(true)
  }

  const handleStartNegotiation = async () => {
    if (!user?.uid || !selectedBill) return

    try {
      // Update the bill status in state
      const updatedBills = billOpportunities.map((bill) => {
        if (bill.id === selectedBill.id) {
          return {
            ...bill,
            status: "in_progress",
            progress: 10, // Start at 10% progress
            startedAt: new Date().toISOString(),
          }
        }
        return bill
      })

      setBillOpportunities(updatedBills)

      // Update in Firestore
      const userBillsRef = doc(db, "users", user.uid, "premium", "billNegotiation")
      await updateDoc(userBillsRef, {
        opportunities: updatedBills,
        updatedAt: serverTimestamp(),
      })

      // Log the action in user's activity
      await addDoc(collection(db, "users", user.uid, "activity"), {
        type: "billNegotiation",
        action: "started",
        billId: selectedBill.id,
        provider: selectedBill.provider,
        timestamp: serverTimestamp(),
      })

      toast({
        title: "Negotiation Started",
        description: "Our team will begin working on lowering your bill.",
      })
      setIsDetailsOpen(false)
    } catch (error) {
      console.error("Error starting negotiation:", error)
      toast({
        title: "Error",
        description: "Failed to start negotiation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalPotentialSavings = billOpportunities
    .filter((bill) => bill.status === "ready")
    .reduce((sum, bill) => sum + bill.potentialSavings, 0)

  const totalSaved = billOpportunities
    .filter((bill) => bill.status === "completed")
    .reduce((sum, bill) => sum + bill.savedAmount, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bill Negotiation Assistant</CardTitle>
          <CardDescription>Loading your bill opportunities...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingDown className="mr-2 h-5 w-5 text-rose-600" />
                Bill Negotiation Assistant
              </CardTitle>
              <CardDescription>Tools to help lower your recurring bills and subscriptions</CardDescription>
            </div>
            <Badge className="bg-rose-600">
              <Sparkles className="mr-1 h-3 w-3" /> Premium
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">Potential Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-600">${totalPotentialSavings.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    From {billOpportunities.filter((b) => b.status === "ready").length} opportunities
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">Total Saved So Far</p>
                  <p className="text-2xl font-bold text-green-600">${totalSaved.toFixed(2)}/mo</p>
                  <p className="text-xs text-muted-foreground">That's ${(totalSaved * 12).toFixed(2)} per year!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h3 className="font-medium text-lg">Savings Opportunities</h3>

          {billOpportunities.map((bill) => (
            <Card key={bill.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{bill.provider}</h3>
                    <Badge
                      variant={
                        bill.status === "completed"
                          ? "default"
                          : bill.status === "in_progress"
                            ? "outline"
                            : "secondary"
                      }
                      className={bill.status === "completed" ? "bg-green-500" : ""}
                    >
                      {bill.status === "completed"
                        ? "Completed"
                        : bill.status === "in_progress"
                          ? "In Progress"
                          : "Ready to Start"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{bill.description}</p>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">
                        Current bill: <span className="font-medium">${bill.currentBill}/mo</span>
                      </p>
                      {bill.status === "completed" ? (
                        <p className="text-sm text-green-600">Saved: ${bill.savedAmount}/mo</p>
                      ) : (
                        <p className="text-sm">
                          Potential savings:{" "}
                          <span className="font-medium text-green-600">${bill.potentialSavings}/mo</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {bill.status === "in_progress" && (
                        <div className="w-24">
                          <Progress value={bill.progress} className="h-2" />
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(bill)}
                        className="touch-manipulation active:scale-95"
                      >
                        Details
                      </Button>
                    </div>
                  </div>

                  {bill.status === "in_progress" && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Our team is working on this</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Bill Details Dialog */}
      {selectedBill && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBill.provider} Details</DialogTitle>
              <DialogDescription>
                {selectedBill.status === "ready"
                  ? "Review details and start negotiation"
                  : selectedBill.status === "in_progress"
                    ? "Negotiation in progress"
                    : "Negotiation completed"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Monthly Bill</p>
                  <p className="text-lg font-medium">${selectedBill.currentBill}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {selectedBill.status === "completed" ? "Actual Savings" : "Potential Savings"}
                  </p>
                  <p className="text-lg font-medium text-green-600">
                    ${selectedBill.status === "completed" ? selectedBill.savedAmount : selectedBill.potentialSavings}/mo
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">How This Works</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedBill.status === "ready"
                        ? "Our team of expert negotiators will contact your service provider on your behalf to secure a better rate. We'll need your authorization to speak with them."
                        : selectedBill.status === "in_progress"
                          ? "Our negotiation team is actively working with your provider. We'll update you when we have news."
                          : "We successfully negotiated a lower rate with your provider. The savings will be reflected in your next bill."}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBill.status === "in_progress" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Negotiation Progress</span>
                    <span>{selectedBill.progress}%</span>
                  </div>
                  <Progress value={selectedBill.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Estimated completion: {new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedBill.status === "completed" && (
                <div className="rounded-lg bg-green-50 p-4 text-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Negotiation Successful!</h4>
                      <p className="text-sm mt-1">
                        We successfully negotiated a lower rate for your {selectedBill.provider} bill. You're now saving
                        ${selectedBill.savedAmount} every month, which is ${selectedBill.savedAmount * 12} per year!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedBill.status === "ready" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                    className="touch-manipulation active:scale-95"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
                    onClick={handleStartNegotiation}
                  >
                    Start Negotiation
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsDetailsOpen(false)} className="touch-manipulation active:scale-95">
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
