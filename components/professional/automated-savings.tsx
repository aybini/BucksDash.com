"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Briefcase, Plus, Settings, Trash2, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data - in a real app, this would come from your backend
const savingsRules = [
  {
    id: 1,
    name: "Bonus Savings",
    description: "Save 30% of every bonus automatically",
    trigger: "bonus",
    percentage: 30,
    destination: "Emergency Fund",
    active: true,
    lastTriggered: "2023-11-15",
    amountSaved: 450,
  },
  {
    id: 2,
    name: "Payday Savings",
    description: "Save $200 from each paycheck",
    trigger: "paycheck",
    amount: 200,
    destination: "Vacation Fund",
    active: true,
    lastTriggered: "2023-12-01",
    amountSaved: 1200,
  },
  {
    id: 3,
    name: "Round-Up Savings",
    description: "Round up transactions to the nearest dollar",
    trigger: "transaction",
    roundUp: true,
    destination: "Investment Account",
    active: false,
    lastTriggered: "2023-10-28",
    amountSaved: 87.45,
  },
]

export function AutomatedSavings() {
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [isEditRuleOpen, setIsEditRuleOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState(null)
  const { toast } = useToast()

  const handleAddRule = () => {
    toast({
      title: "Savings Rule Added",
      description: "Your new automated savings rule has been created.",
    })
    setIsAddRuleOpen(false)
  }

  const handleEditRule = (rule) => {
    setSelectedRule(rule)
    setIsEditRuleOpen(true)
  }

  const handleUpdateRule = () => {
    toast({
      title: "Savings Rule Updated",
      description: "Your automated savings rule has been updated.",
    })
    setIsEditRuleOpen(false)
  }

  const handleToggleRule = (ruleId) => {
    toast({
      title: "Rule Status Changed",
      description: "Your savings rule status has been updated.",
    })
  }

  const totalSaved = savingsRules.reduce((sum, rule) => sum + rule.amountSaved, 0)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5 text-green-500" />
                Automated Savings Rules
              </CardTitle>
              <CardDescription>Set rules to save money automatically based on triggers</CardDescription>
            </div>
            <Badge className="bg-green-500">Professional Feature</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Your Savings Rules</h3>
              <p className="text-sm text-muted-foreground">Total saved through automation: ${totalSaved.toFixed(2)}</p>
            </div>
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => setIsAddRuleOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Rule
            </Button>
          </div>

          {savingsRules.map((rule) => (
            <Card key={rule.id} className={rule.active ? "" : "opacity-70"}>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{rule.name}</h3>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.active} onCheckedChange={() => handleToggleRule(rule.id)} />
                      <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{rule.description}</p>

                  <div className="flex items-center text-sm">
                    <Badge variant="outline" className="mr-2">
                      {rule.trigger === "bonus" ? "Bonus" : rule.trigger === "paycheck" ? "Paycheck" : "Transaction"}
                    </Badge>
                    <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground" />
                    <Badge variant="outline">{rule.destination}</Badge>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last triggered: {new Date(rule.lastTriggered).toLocaleDateString()}</span>
                    <span>Amount saved: ${rule.amountSaved.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Add Rule Dialog */}
      <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Savings Rule</DialogTitle>
            <DialogDescription>Set up an automated rule to save money based on specific triggers</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input id="rule-name" placeholder="e.g., Bonus Savings" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger-type">Trigger Type</Label>
              <Select defaultValue="bonus">
                <SelectTrigger id="trigger-type">
                  <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">Bonus Received</SelectItem>
                  <SelectItem value="paycheck">Paycheck Deposited</SelectItem>
                  <SelectItem value="transaction">Transaction Round-Up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount-type">Amount Type</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger id="amount-type">
                    <SelectValue placeholder="Select amount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex">
                  <span className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                    %
                  </span>
                  <Input id="amount" type="number" className="rounded-l-none" placeholder="30" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Select defaultValue="emergency">
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                  <SelectItem value="vacation">Vacation Fund</SelectItem>
                  <SelectItem value="investment">Investment Account</SelectItem>
                  <SelectItem value="retirement">Retirement Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleAddRule}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      {selectedRule && (
        <Dialog open={isEditRuleOpen} onOpenChange={setIsEditRuleOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Savings Rule</DialogTitle>
              <DialogDescription>Update your automated savings rule</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rule-name">Rule Name</Label>
                <Input id="edit-rule-name" defaultValue={selectedRule.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-trigger-type">Trigger Type</Label>
                <Select defaultValue={selectedRule.trigger}>
                  <SelectTrigger id="edit-trigger-type">
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus Received</SelectItem>
                    <SelectItem value="paycheck">Paycheck Deposited</SelectItem>
                    <SelectItem value="transaction">Transaction Round-Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount-type">Amount Type</Label>
                  <Select defaultValue={selectedRule.percentage ? "percentage" : "fixed"}>
                    <SelectTrigger id="edit-amount-type">
                      <SelectValue placeholder="Select amount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <div className="flex">
                    <span className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted">
                      {selectedRule.percentage ? "%" : "$"}
                    </span>
                    <Input
                      id="edit-amount"
                      type="number"
                      className="rounded-l-none"
                      defaultValue={selectedRule.percentage || selectedRule.amount}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-destination">Destination</Label>
                <Select defaultValue={selectedRule.destination.toLowerCase().replace(/\s+/g, "-")}>
                  <SelectTrigger id="edit-destination">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency-fund">Emergency Fund</SelectItem>
                    <SelectItem value="vacation-fund">Vacation Fund</SelectItem>
                    <SelectItem value="investment-account">Investment Account</SelectItem>
                    <SelectItem value="retirement-account">Retirement Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="edit-active" defaultChecked={selectedRule.active} />
                <Label htmlFor="edit-active">Rule Active</Label>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" /> Delete Rule
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsEditRuleOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-500 hover:bg-green-600" onClick={handleUpdateRule}>
                  Update Rule
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
