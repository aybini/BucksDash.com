"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts"
import { Briefcase, TrendingUp, Calculator } from "lucide-react"
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
const retirementAccounts = [
  {
    id: 1,
    name: "401(k)",
    balance: 45000,
    contribution: 500,
    employerMatch: 250,
    matchLimit: "6% of salary",
    yearlyReturn: 7.2,
    fees: 0.4,
  },
  {
    id: 2,
    name: "Roth IRA",
    balance: 28500,
    contribution: 300,
    employerMatch: 0,
    matchLimit: "N/A",
    yearlyReturn: 8.1,
    fees: 0.2,
  },
]

// Sample projection data
const projectionData = [
  { age: 30, standard: 73500, optimized: 73500 },
  { age: 35, standard: 150000, optimized: 175000 },
  { age: 40, standard: 250000, optimized: 320000 },
  { age: 45, standard: 400000, optimized: 520000 },
  { age: 50, standard: 600000, optimized: 780000 },
  { age: 55, standard: 850000, optimized: 1100000 },
  { age: 60, standard: 1200000, optimized: 1550000 },
  { age: 65, standard: 1600000, optimized: 2100000 },
]

export function RetirementOptimizer() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false)
  const [contributionPercent, setContributionPercent] = useState(8)
  const { toast } = useToast()

  const totalBalance = retirementAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalMonthlyContribution = retirementAccounts.reduce((sum, account) => sum + account.contribution, 0)
  const totalEmployerMatch = retirementAccounts.reduce((sum, account) => sum + account.employerMatch, 0)

  const handleOptimize = () => {
    toast({
      title: "Retirement Plan Optimized",
      description: `Your contribution has been updated to ${contributionPercent}% of your salary.`,
    })
    setIsOptimizeOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-green-500" />
                401(k) Optimizer
              </CardTitle>
              <CardDescription>Maximize employer matches and visualize retirement growth</CardDescription>
            </div>
            <Badge className="bg-green-500">Professional Feature</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">My Accounts</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Across {retirementAccounts.length} accounts</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">Monthly Contribution</p>
                      <p className="text-2xl font-bold">${totalMonthlyContribution}</p>
                      <p className="text-xs text-muted-foreground">Your contribution</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">Employer Match</p>
                      <p className="text-2xl font-bold">${totalEmployerMatch}</p>
                      <p className="text-xs text-green-600 font-medium">Free money!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Contribution Optimizer</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsOptimizeOpen(true)}>
                      <Calculator className="h-3 w-3 mr-1" /> Optimize
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-amber-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      You're not maximizing your employer match!
                    </p>
                    <p className="text-muted-foreground">
                      Increasing your contribution by 2% would get you an additional $150/month in employer match.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              {retirementAccounts.map((account) => (
                <Card key={account.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{account.name}</h3>
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          {account.yearlyReturn}% avg. return
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Balance</p>
                          <p className="font-medium">${account.balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Your Contribution</p>
                          <p className="font-medium">${account.contribution}/mo</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Employer Match</p>
                          <p className="font-medium">${account.employerMatch}/mo</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Match Limit</p>
                          <p className="font-medium">{account.matchLimit}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Annual fees: {account.fees}%</span>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          Edit Account
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
                  <h3 className="font-medium mb-4">Retirement Balance Projections</h3>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value.toLocaleString()}`, "Balance"]}
                          labelFormatter={(label) => `Age: ${label}`}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="standard"
                          name="Current Plan"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="optimized"
                          name="Optimized Plan"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Current Plan:</span> Continuing with your current contribution rate
                    </p>
                    <p>
                      <span className="font-medium">Optimized Plan:</span> Maximizing employer match and optimizing
                      allocation
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Retirement Readiness</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your current savings rate and projected expenses
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span>Income replacement</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Target: 85% of pre-retirement income</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span>Retirement age</span>
                        <span className="font-medium">67</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Optimized plan could enable retirement at age 64
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Optimize Dialog */}
      <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimize Your Retirement</DialogTitle>
            <DialogDescription>Adjust your contribution to maximize employer match and growth</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="contribution">Contribution (% of salary)</Label>
                <span className="text-sm font-medium">{contributionPercent}%</span>
              </div>
              <Slider
                id="contribution"
                min={1}
                max={15}
                step={1}
                value={[contributionPercent]}
                onValueChange={(value) => setContributionPercent(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>Recommended: 10%</span>
                <span>15%</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Contribution:</span>
                  <span className="text-sm font-medium">${(contributionPercent * 80).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Employer Match:</span>
                  <span className="text-sm font-medium">
                    ${contributionPercent >= 6 ? 400 : (contributionPercent * 66.67).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Additional Retirement:</span>
                  <span className="text-sm font-medium">
                    ${((contributionPercent >= 6 ? 400 : contributionPercent * 66.67) * 12 * 30).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOptimizeOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleOptimize}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
