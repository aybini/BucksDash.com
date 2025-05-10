"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RetirementAccountEditor } from "./retirement-account-editor"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, DollarSign, PiggyBank, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Mock data for initial accounts
const initialAccounts = {
  "401k": {
    accountName: "Company 401(k)",
    accountNumber: "1234",
    institution: "Fidelity",
    balance: "45000",
    contributionType: "traditional" as const,
    contributionAmount: "500",
    contributionFrequency: "biweekly" as const,
    yearToDateContribution: "6000",
    employerMatch: "3000",
    yearToDateTotal: "9000",
    annualLimit: "22500",
    catchUpEligible: false,
  },
  ira: {
    accountName: "Personal Roth IRA",
    accountNumber: "5678",
    institution: "Vanguard",
    balance: "28500",
    contributionType: "roth" as const,
    contributionAmount: "500",
    contributionFrequency: "monthly" as const,
    yearToDateContribution: "2000",
    annualLimit: "6500",
    catchUpEligible: false,
  },
}

export function RetirementAccounts() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [activeTab, setActiveTab] = useState<"401k" | "ira">("401k")
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (editSuccess) {
      const timer = setTimeout(() => {
        setEditSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [editSuccess])

  // Handler for saving 401k account updates
  const handle401kSave = (data: any) => {
    // Make a copy of the current state to avoid direct mutation
    const updated401k = {
      ...accounts["401k"],
      ...data,
      // Ensure these values are preserved if not included in the form data
      yearToDateContribution: accounts["401k"].yearToDateContribution,
      employerMatch: accounts["401k"].employerMatch,
      yearToDateTotal: accounts["401k"].yearToDateTotal,
      annualLimit: accounts["401k"].annualLimit,
      catchUpEligible: accounts["401k"].catchUpEligible,
    }

    // Calculate yearToDateTotal in case contribution amounts changed
    updated401k.yearToDateTotal = (
      Number.parseInt(updated401k.yearToDateContribution) + Number.parseInt(updated401k.employerMatch)
    ).toString()

    // Update state with the new values
    setAccounts((prev) => ({
      ...prev,
      "401k": updated401k,
    }))

    // Show success message
    setEditSuccess("401k")
    toast({
      title: "401(k) account updated",
      description: "Your 401(k) account information has been updated successfully.",
    })
  }

  // Handler for saving IRA account updates
  const handleIraSave = (data: any) => {
    setAccounts((prev) => ({
      ...prev,
      ira: {
        ...prev["ira"],
        ...data,
        // Ensure these values are preserved
        yearToDateContribution: prev["ira"].yearToDateContribution,
        annualLimit: prev["ira"].annualLimit,
        catchUpEligible: prev["ira"].catchUpEligible,
      },
    }))

    // Show success message
    setEditSuccess("ira")
    toast({
      title: "Roth IRA account updated",
      description: "Your Roth IRA account information has been updated successfully.",
    })
  }

  // Calculate remaining contribution room
  const get401kRemaining = () => {
    const limit = Number.parseInt(accounts["401k"].annualLimit)
    const ytd = Number.parseInt(accounts["401k"].yearToDateTotal)
    return Math.max(0, limit - ytd).toLocaleString()
  }

  const getIraRemaining = () => {
    const limit = Number.parseInt(accounts["ira"].annualLimit)
    const ytd = Number.parseInt(accounts["ira"].yearToDateContribution)
    return Math.max(0, limit - ytd).toLocaleString()
  }

  const handleEditDetails = (accountType: "401k" | "ira") => {
    const editor = document.querySelector(`[data-account-type="${accountType}"]`) as HTMLButtonElement
    if (editor) editor.click()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Retirement Accounts</CardTitle>
            <CardDescription>Manage your 401(k) and IRA accounts</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-700">
              Your {editSuccess === "401k" ? "401(k)" : "Roth IRA"} account has been updated successfully.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="401k" className="w-full" onValueChange={(value) => setActiveTab(value as "401k" | "ira")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="401k">401(k)</TabsTrigger>
            <TabsTrigger value="ira">Roth IRA</TabsTrigger>
          </TabsList>

          {/* 401(k) Tab Content */}
          <TabsContent value="401k">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="text-lg font-medium">{accounts["401k"].accountName}</h3>
                <RetirementAccountEditor
                  accountType="401k"
                  initialData={accounts["401k"]}
                  onSave={handle401kSave}
                  buttonText="Edit 401(k) Account"
                  buttonIcon={<Edit className="h-4 w-4 mr-2" />}
                  buttonVariant="default"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        ${Number.parseInt(accounts["401k"].balance).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">At {accounts["401k"].institution}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">YTD Contributions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <ArrowUpRight className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        ${Number.parseInt(accounts["401k"].yearToDateTotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        You: ${Number.parseInt(accounts["401k"].yearToDateContribution).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Employer: ${Number.parseInt(accounts["401k"].employerMatch).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Limit</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <PiggyBank className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">${get401kRemaining()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of ${Number.parseInt(accounts["401k"].annualLimit).toLocaleString()} annual limit
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Contribution Details</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleEditDetails("401k")}
                    aria-label="Edit 401(k) contribution details"
                  >
                    Edit Details
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">Contribution Type</span>
                    <Badge variant={accounts["401k"].contributionType === "roth" ? "default" : "outline"}>
                      {accounts["401k"].contributionType === "roth" ? "Roth (After-tax)" : "Traditional (Pre-tax)"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">Contribution</span>
                    <span className="font-medium">
                      ${accounts["401k"].contributionAmount} {accounts["401k"].contributionFrequency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Roth IRA Tab Content */}
          <TabsContent value="ira">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h3 className="text-lg font-medium">{accounts["ira"].accountName}</h3>
                <RetirementAccountEditor
                  accountType="ira"
                  initialData={accounts["ira"]}
                  onSave={handleIraSave}
                  buttonText="Edit Roth IRA Account"
                  buttonIcon={<Edit className="h-4 w-4 mr-2" />}
                  buttonVariant="default"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        ${Number.parseInt(accounts["ira"].balance).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">At {accounts["ira"].institution}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">YTD Contributions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <ArrowUpRight className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        ${Number.parseInt(accounts["ira"].yearToDateContribution).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Tax-free growth with Roth IRA</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Limit</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center">
                      <PiggyBank className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold">${getIraRemaining()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of ${Number.parseInt(accounts["ira"].annualLimit).toLocaleString()} annual limit
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Contribution Details</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleEditDetails("ira")}
                    aria-label="Edit Roth IRA contribution details"
                  >
                    Edit Details
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">Tax Treatment</span>
                    <Badge>Roth (Tax-free withdrawals)</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-sm">Contribution</span>
                    <span className="font-medium">
                      ${accounts["ira"].contributionAmount} {accounts["ira"].contributionFrequency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="w-full max-w-md"
            onClick={() => handleEditDetails(activeTab)}
            aria-label={`Edit ${activeTab === "401k" ? "401(k)" : "Roth IRA"} account`}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit {activeTab === "401k" ? "401(k)" : "Roth IRA"} Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
