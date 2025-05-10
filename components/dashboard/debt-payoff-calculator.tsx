"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalculatorIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the DebtAccount interface
interface DebtAccount {
  id?: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  type: string
  userId?: string
}

interface DebtPayoffCalculatorProps {
  accounts: DebtAccount[]
  isLoading: boolean
}

export function DebtPayoffCalculator({ accounts, isLoading }: DebtPayoffCalculatorProps) {
  const [strategy, setStrategy] = useState("avalanche")
  const [extraPayment, setExtraPayment] = useState("100")
  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  // Update selected account when accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      // If the currently selected account still exists, keep it selected
      if (selectedAccountId && accounts.some((account) => account.id === selectedAccountId)) {
        // Keep the current selection
      } else {
        // Otherwise select the first account
        setSelectedAccountId(accounts[0].id || "")
      }
    } else {
      setSelectedAccountId("")
    }
  }, [accounts, selectedAccountId])

  const handleCalculate = () => {
    setIsCalculating(true)
    setError(null)

    // Find the selected account
    const selectedAccount = accounts.find((account) => account.id === selectedAccountId)

    if (!selectedAccount) {
      setError("Please select a debt account to calculate payoff.")
      setIsCalculating(false)
      return
    }

    // Get values for calculation
    const balance = selectedAccount.balance
    const interestRate = selectedAccount.interestRate
    const minimumPayment = selectedAccount.minimumPayment
    const extraPaymentAmount = Number.parseFloat(extraPayment) || 0
    const totalMonthlyPayment = minimumPayment + extraPaymentAmount

    // Simple calculation for months to payoff
    // This is a simplified calculation - a real one would be more complex
    try {
      // Convert annual interest rate to monthly
      const monthlyInterestRate = interestRate / 100 / 12

      // Calculate months to payoff using the formula for a loan with fixed payment
      let months = 0
      let totalInterest = 0
      let remainingBalance = balance

      // Simulate month-by-month payoff
      while (remainingBalance > 0 && months < 1200) {
        // Cap at 100 years to prevent infinite loops
        const interestThisMonth = remainingBalance * monthlyInterestRate
        totalInterest += interestThisMonth

        const principalThisMonth = Math.min(totalMonthlyPayment - interestThisMonth, remainingBalance)
        remainingBalance -= principalThisMonth

        months++
      }

      // Calculate comparison to minimum payments only
      let minMonths = 0
      let minTotalInterest = 0
      let minRemainingBalance = balance

      while (minRemainingBalance > 0 && minMonths < 1200) {
        const interestThisMonth = minRemainingBalance * monthlyInterestRate
        minTotalInterest += interestThisMonth

        const principalThisMonth = Math.min(minimumPayment - interestThisMonth, minRemainingBalance)
        minRemainingBalance -= principalThisMonth

        minMonths++
      }

      // Calculate money saved
      const moneySaved = minTotalInterest - totalInterest

      // Calculate payoff date
      const payoffDate = new Date()
      payoffDate.setMonth(payoffDate.getMonth() + months)

      // Set results
      setResults({
        totalMonths: months,
        totalInterest: totalInterest,
        totalPaid: balance + totalInterest,
        moneySaved: moneySaved,
        payoffDate: payoffDate,
        accountName: selectedAccount.name,
      })
    } catch (error) {
      console.error("Error calculating payoff:", error)
      setError("An error occurred during calculation. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Payoff Calculator</CardTitle>
        <CardDescription>Calculate how quickly you can pay off your debt</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center py-4">
                <p>Loading debt accounts...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-4">
                <p>You need to add debt accounts before using the calculator.</p>
                <Button onClick={() => (window.location.href = "#debt-accounts")} variant="outline" className="mt-2">
                  Add Debt Account
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="account">Select Debt Account</Label>
                  <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id || ""}>
                          {account.name} (${account.balance.toFixed(2)} at {account.interestRate}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy">Payoff Strategy</Label>
                  <Select value={strategy} onValueChange={setStrategy}>
                    <SelectTrigger id="strategy">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">Debt Avalanche (Highest Interest First)</SelectItem>
                      <SelectItem value="snowball">Debt Snowball (Smallest Balance First)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {strategy === "avalanche"
                      ? "Avalanche method pays off highest interest debts first, saving you the most money in interest."
                      : "Snowball method pays off smallest balances first, giving you quick wins for motivation."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extraPayment">Extra Monthly Payment ($)</Label>
                  <Input
                    id="extraPayment"
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Additional amount you can put toward debt each month beyond minimum payments.
                  </p>
                </div>

                <Button
                  onClick={handleCalculate}
                  className="w-full bg-rose-600 hover:bg-rose-700 mt-4 touch-manipulation active:scale-95"
                  disabled={isCalculating || !selectedAccountId}
                >
                  {isCalculating ? "Calculating..." : "Calculate Payoff Plan"}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="results" className="py-4">
            {results ? (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Selected Account</h3>
                  <p className="text-xl font-bold">{results.accountName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Time to Debt-Free</h3>
                    <p className="text-2xl font-bold">{results.totalMonths} months</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Payoff Date</h3>
                    <p className="text-2xl font-bold">
                      {results.payoffDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Interest Paid</h3>
                    <p className="text-2xl font-bold">${results.totalInterest.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Paid</h3>
                    <p className="text-2xl font-bold">${results.totalPaid.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="text-green-800 font-medium flex items-center">
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Money Saved with {strategy === "avalanche" ? "Avalanche" : "Snowball"} Method
                  </h3>
                  <p className="text-green-800 text-2xl font-bold mt-1">${results.moneySaved.toFixed(2)}</p>
                  <p className="text-green-700 text-sm mt-1">Compared to making only minimum payments</p>
                </div>

                <Button
                  onClick={() => setResults(null)}
                  variant="outline"
                  className="w-full touch-manipulation active:scale-95"
                >
                  Reset Calculator
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Run the calculator to see your debt payoff results.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
