"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { GraduationCap, TrendingDown, Calculator, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

// Mock data - in a real app, this would come from your backend
const studentLoans = [
  {
    id: 1,
    name: "Federal Subsidized Loan",
    balance: 12500,
    interestRate: 4.5,
    minimumPayment: 150,
    paymentsMade: 12,
    totalPayments: 120,
    provider: "Department of Education",
    type: "federal",
  },
  {
    id: 2,
    name: "Private Student Loan",
    balance: 8750,
    interestRate: 6.8,
    minimumPayment: 120,
    paymentsMade: 8,
    totalPayments: 84,
    provider: "SallieMae",
    type: "private",
  },
]

// Sample projection data
const projectionData = [
  { month: "Current", standard: 21250, accelerated: 21250 },
  { month: "6 mo", standard: 20100, accelerated: 19200 },
  { month: "1 yr", standard: 18950, accelerated: 16800 },
  { month: "2 yr", standard: 16650, accelerated: 12000 },
  { month: "3 yr", standard: 14350, accelerated: 7200 },
  { month: "4 yr", standard: 12050, accelerated: 2400 },
  { month: "5 yr", standard: 9750, accelerated: 0 },
  { month: "6 yr", standard: 7450, accelerated: 0 },
  { month: "7 yr", standard: 5150, accelerated: 0 },
  { month: "8 yr", standard: 2850, accelerated: 0 },
  { month: "9 yr", standard: 550, accelerated: 0 },
  { month: "10 yr", standard: 0, accelerated: 0 },
]

export function StudentLoanTracker() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false)
  const [isPaymentSimulatorOpen, setIsPaymentSimulatorOpen] = useState(false)
  const [extraPayment, setExtraPayment] = useState(100)
  const { toast } = useToast()

  const totalBalance = studentLoans.reduce((sum, loan) => sum + loan.balance, 0)
  const averageInterestRate =
    studentLoans.reduce((sum, loan) => sum + loan.interestRate * loan.balance, 0) / totalBalance
  const totalMinimumPayment = studentLoans.reduce((sum, loan) => sum + loan.minimumPayment, 0)

  const handleAddLoan = () => {
    toast({
      title: "Loan Added",
      description: "Your new student loan has been added to your account.",
    })
    setIsAddLoanOpen(false)
  }

  const handleSimulatePayment = () => {
    toast({
      title: "Simulation Updated",
      description: `Your payment simulation with an extra $${extraPayment} monthly has been updated.`,
    })
    setIsPaymentSimulatorOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
                Student Loan Tracker
              </CardTitle>
              <CardDescription>Monitor your loans and see the impact of early payments</CardDescription>
            </div>
            <Badge className="bg-blue-500">Student Feature</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="loans">My Loans</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Across {studentLoans.length} loans</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">Average Interest Rate</p>
                      <p className="text-2xl font-bold">{averageInterestRate.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">Weighted by loan balance</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="text-2xl font-bold">${totalMinimumPayment}</p>
                      <p className="text-xs text-muted-foreground">Minimum required</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Payment Impact Calculator</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsPaymentSimulatorOpen(true)}>
                      <Calculator className="h-3 w-3 mr-1" /> Simulate
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-green-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Paying an extra $100/month could save you $3,245 in interest
                    </p>
                    <p className="text-muted-foreground">You could be debt-free 4 years and 2 months sooner!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loans" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsAddLoanOpen(true)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Loan
                </Button>
              </div>

              {studentLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{loan.name}</h3>
                        <Badge variant={loan.type === "federal" ? "default" : "outline"}>
                          {loan.type === "federal" ? "Federal" : "Private"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Balance</p>
                          <p className="font-medium">${loan.balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Interest Rate</p>
                          <p className="font-medium">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Payment</p>
                          <p className="font-medium">${loan.minimumPayment}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Progress</p>
                          <p className="font-medium">
                            {loan.paymentsMade} of {loan.totalPayments} payments
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(loan.paymentsMade / loan.totalPayments) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="projections" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">Loan Balance Projections</h3>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value.toLocaleString()}`, "Balance"]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="standard"
                          name="Standard Payments"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="accelerated"
                          name="With Extra Payments"
                          stroke="#82ca9d"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Standard Plan:</span> Making minimum payments only
                    </p>
                    <p>
                      <span className="font-medium">Accelerated Plan:</span> Adding $100/month extra payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Loan Dialog */}
      <Dialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student Loan</DialogTitle>
            <DialogDescription>Enter the details of your student loan to track it</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loan-name">Loan Name</Label>
                <Input id="loan-name" placeholder="e.g., Federal Subsidized Loan" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan-balance">Current Balance ($)</Label>
                  <Input id="loan-balance" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input id="interest-rate" type="number" placeholder="0.0" step="0.1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-payment">Monthly Payment ($)</Label>
                  <Input id="monthly-payment" type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan-term">Loan Term (months)</Label>
                  <Input id="loan-term" type="number" placeholder="120" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-provider">Loan Provider</Label>
                <Input id="loan-provider" placeholder="e.g., Department of Education" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLoanOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleAddLoan}>
              Add Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Simulator Dialog */}
      <Dialog open={isPaymentSimulatorOpen} onOpenChange={setIsPaymentSimulatorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Impact Simulator</DialogTitle>
            <DialogDescription>See how extra payments can save you money and time</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="extra-payment">Extra Monthly Payment ($)</Label>
              <Input
                id="extra-payment"
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                min="0"
                step="25"
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Interest Saved:</span>
                  <span className="text-sm font-medium">${(extraPayment * 32.45).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Time Saved:</span>
                  <span className="text-sm font-medium">
                    {Math.floor(extraPayment / 25)} years, {Math.floor((extraPayment % 25) / 2)} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">New Payoff Date:</span>
                  <span className="text-sm font-medium">
                    {new Date(
                      Date.now() + 1000 * 60 * 60 * 24 * 30 * (120 - (extraPayment / 25) * 12),
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentSimulatorOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSimulatePayment}>
              Update Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
