"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, TrendingUp, AlertCircle, Coffee, ShoppingBag, Utensils, Home, Car, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import type { Transaction } from "@/lib/firebase-service"
import { subMonths } from "date-fns"
import { Progress } from "@/components/ui/progress"

// Define the recommendation type
interface Recommendation {
  id: string
  category: string
  title: string
  description: string
  potentialSavings: number
  severity: "low" | "medium" | "high"
  icon: React.ReactNode
  color: string
}

// Categories and their associated icons
const categoryIcons = {
  Food: <Utensils className="h-4 w-4" />,
  Coffee: <Coffee className="h-4 w-4" />,
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Housing: <Home className="h-4 w-4" />,
  Transportation: <Car className="h-4 w-4" />,
  Dining: <Utensils className="h-4 w-4" />,
  Groceries: <ShoppingBag className="h-4 w-4" />,
  Entertainment: <ShoppingBag className="h-4 w-4" />,
  default: <AlertCircle className="h-4 w-4" />,
}

// Get icon for a category
const getIconForCategory = (category: string) => {
  return categoryIcons[category] || categoryIcons.default
}

// Get color for severity
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-600"
    case "medium":
      return "bg-amber-100 text-amber-600"
    case "low":
      return "bg-green-100 text-green-600"
    default:
      return "bg-blue-100 text-blue-600"
  }
}

export function SpendingRecommendations() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [implementedCount, setImplementedCount] = useState(0)
  const [potentialSavings, setPotentialSavings] = useState(0)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get transactions from the last 3 months
        const threeMonthsAgo = subMonths(new Date(), 3)

        const transactionsRef = collection(db, `users/${user.uid}/transactions`)
        const q = query(transactionsRef, where("date", ">=", threeMonthsAgo), orderBy("date", "desc"))

        const snapshot = await getDocs(q)
        const fetchedTransactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[]

        setTransactions(fetchedTransactions)

        // Generate recommendations based on transactions
        const generatedRecommendations = analyzeTransactionsAndGenerateRecommendations(fetchedTransactions)
        setRecommendations(generatedRecommendations)

        // Calculate potential savings
        const totalPotentialSavings = generatedRecommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0)
        setPotentialSavings(totalPotentialSavings)

        // Set a random number of implemented recommendations for demo purposes
        // In a real app, this would be tracked in the user's profile
        setImplementedCount(Math.floor(Math.random() * 3))
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user])

  // Algorithm to analyze transactions and generate personalized recommendations
  const analyzeTransactionsAndGenerateRecommendations = (transactions: Transaction[]): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Skip if no transactions
    if (!transactions.length) return recommendations

    // Group transactions by category
    const categorizedTransactions: Record<string, Transaction[]> = {}
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category || "Uncategorized"
        if (!categorizedTransactions[category]) {
          categorizedTransactions[category] = []
        }
        categorizedTransactions[category].push(transaction)
      }
    })

    // Calculate monthly averages by category
    const monthlyAverages: Record<string, number> = {}
    Object.entries(categorizedTransactions).forEach(([category, txs]) => {
      const total = txs.reduce((sum, tx) => sum + tx.amount, 0)
      monthlyAverages[category] = total / 3 // Assuming 3 months of data
    })

    // Check for high coffee/cafe spending
    if (monthlyAverages["Coffee"] > 100 || monthlyAverages["Cafe"] > 100) {
      const coffeeSpending = monthlyAverages["Coffee"] || 0
      const cafeSpending = monthlyAverages["Cafe"] || 0
      const totalCoffeeSpending = coffeeSpending + cafeSpending

      if (totalCoffeeSpending > 150) {
        recommendations.push({
          id: "coffee-spending",
          category: "Coffee",
          title: "Reduce coffee shop spending",
          description: `You're spending about $${totalCoffeeSpending.toFixed(0)} monthly on coffee shops. Try brewing at home a few days a week to save around $${(totalCoffeeSpending * 0.4).toFixed(0)} per month.`,
          potentialSavings: totalCoffeeSpending * 0.4,
          severity: "medium",
          icon: <Coffee className="h-4 w-4" />,
          color: "bg-amber-100 text-amber-600",
        })
      }
    }

    // Check for high dining out expenses
    if (monthlyAverages["Dining"] > 400 || monthlyAverages["Restaurants"] > 400) {
      const diningSpending = monthlyAverages["Dining"] || 0
      const restaurantSpending = monthlyAverages["Restaurants"] || 0
      const totalDiningSpending = diningSpending + restaurantSpending

      if (totalDiningSpending > 500) {
        recommendations.push({
          id: "dining-spending",
          category: "Dining",
          title: "Reduce restaurant expenses",
          description: `Your monthly restaurant spending of $${totalDiningSpending.toFixed(0)} is higher than average. Cooking at home one more day per week could save you approximately $${(totalDiningSpending * 0.25).toFixed(0)} monthly.`,
          potentialSavings: totalDiningSpending * 0.25,
          severity: "high",
          icon: <Utensils className="h-4 w-4" />,
          color: "bg-red-100 text-red-600",
        })
      }
    }

    // Check for high shopping expenses
    if (monthlyAverages["Shopping"] > 300) {
      recommendations.push({
        id: "shopping-spending",
        category: "Shopping",
        title: "Optimize shopping habits",
        description: `You spend about $${monthlyAverages["Shopping"].toFixed(0)} monthly on shopping. Consider implementing a 24-hour rule before purchases to reduce impulse buying and save around $${(monthlyAverages["Shopping"] * 0.2).toFixed(0)} per month.`,
        potentialSavings: monthlyAverages["Shopping"] * 0.2,
        severity: "medium",
        icon: <ShoppingBag className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
      })
    }

    // Check for high entertainment expenses
    if (monthlyAverages["Entertainment"] > 200) {
      recommendations.push({
        id: "entertainment-spending",
        category: "Entertainment",
        title: "Reduce entertainment costs",
        description: `Your entertainment spending of $${monthlyAverages["Entertainment"].toFixed(0)} monthly could be optimized. Look for free or discounted activities to potentially save $${(monthlyAverages["Entertainment"] * 0.3).toFixed(0)} per month.`,
        potentialSavings: monthlyAverages["Entertainment"] * 0.3,
        severity: "low",
        icon: <ShoppingBag className="h-4 w-4" />,
        color: "bg-green-100 text-green-600",
      })
    }

    // Check for high transportation costs
    if (monthlyAverages["Transportation"] > 300) {
      recommendations.push({
        id: "transportation-spending",
        category: "Transportation",
        title: "Optimize transportation costs",
        description: `You're spending $${monthlyAverages["Transportation"].toFixed(0)} monthly on transportation. Consider carpooling, public transit, or combining trips to save approximately $${(monthlyAverages["Transportation"] * 0.15).toFixed(0)} per month.`,
        potentialSavings: monthlyAverages["Transportation"] * 0.15,
        severity: "low",
        icon: <Car className="h-4 w-4" />,
        color: "bg-green-100 text-green-600",
      })
    }

    // Check for recurring subscriptions that might be unused
    const subscriptionCategories = ["Subscriptions", "Software", "Streaming"]
    let totalSubscriptionSpending = 0

    subscriptionCategories.forEach((category) => {
      totalSubscriptionSpending += monthlyAverages[category] || 0
    })

    if (totalSubscriptionSpending > 100) {
      recommendations.push({
        id: "subscription-audit",
        category: "Subscriptions",
        title: "Audit your subscriptions",
        description: `You're spending $${totalSubscriptionSpending.toFixed(0)} monthly on subscriptions. Review your recurring services and consider canceling unused ones to save approximately $${(totalSubscriptionSpending * 0.3).toFixed(0)} per month.`,
        potentialSavings: totalSubscriptionSpending * 0.3,
        severity: "medium",
        icon: <AlertCircle className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
      })
    }

    // If we don't have enough recommendations, add a generic one
    if (recommendations.length < 3) {
      // Find the highest spending category
      let highestCategory = ""
      let highestAmount = 0

      Object.entries(monthlyAverages).forEach(([category, amount]) => {
        if (amount > highestAmount && !["Income", "Transfer", "Payment"].includes(category)) {
          highestCategory = category
          highestAmount = amount
        }
      })

      if (highestCategory && highestAmount > 0) {
        recommendations.push({
          id: "general-spending",
          category: highestCategory,
          title: `Reduce ${highestCategory.toLowerCase()} expenses`,
          description: `Your highest spending category is ${highestCategory} at $${highestAmount.toFixed(0)} monthly. Try to reduce this by 10% to save approximately $${(highestAmount * 0.1).toFixed(0)} per month.`,
          potentialSavings: highestAmount * 0.1,
          severity: "low",
          icon: getIconForCategory(highestCategory),
          color: "bg-green-100 text-green-600",
        })
      }
    }

    return recommendations
  }

  // Filter recommendations based on active tab
  const filteredRecommendations =
    activeTab === "all" ? recommendations : recommendations.filter((rec) => rec.severity === activeTab)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-rose-600" />
            Personalized Spending Recommendations
          </CardTitle>
          <CardDescription>AI-powered analysis of your spending patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-rose-600" />
            Personalized Spending Recommendations
          </CardTitle>
          <CardDescription>AI-powered analysis of your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="text-sm">Please log in to see your personalized spending recommendations.</p>
            <Button onClick={() => router.push("/login")} className="mt-4 bg-rose-600 hover:bg-rose-700">
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-rose-600" />
                Personalized Spending Recommendations
              </CardTitle>
              <CardDescription>AI-powered analysis of your spending patterns</CardDescription>
            </div>
            <Badge className="bg-rose-600">
              <Sparkles className="mr-1 h-3 w-3" /> Premium
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="text-sm">
              We need more transaction data to generate personalized recommendations. Add transactions or connect your
              bank account.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={() => router.push("/dashboard/transactions")} className="bg-rose-600 hover:bg-rose-700">
                Add Transactions
              </Button>
              <Button onClick={() => router.push("/dashboard/connect-accounts")} variant="outline">
                Connect Bank Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-rose-600" />
              Personalized Spending Recommendations
            </CardTitle>
            <CardDescription>AI-powered analysis of your spending patterns</CardDescription>
          </div>
          <Badge className="bg-rose-600">
            <Sparkles className="mr-1 h-3 w-3" /> Premium
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">Recommendations</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
                <p className="text-xs text-muted-foreground">Based on your last 3 months of transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">Potential Monthly Savings</p>
                <p className="text-2xl font-bold text-green-600">${potentialSavings.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">That's ${(potentialSavings * 12).toFixed(2)} per year!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-muted-foreground">Implemented</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {implementedCount}/{recommendations.length}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    ({((implementedCount / Math.max(recommendations.length, 1)) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress value={(implementedCount / Math.max(recommendations.length, 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="high" className="text-red-600">
              High Impact
            </TabsTrigger>
            <TabsTrigger value="medium" className="text-amber-600">
              Medium Impact
            </TabsTrigger>
            <TabsTrigger value="low" className="text-green-600">
              Low Impact
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-4">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full ${getSeverityColor(recommendation.severity)} p-2`}>
                            {recommendation.icon}
                          </div>
                          <h3 className="font-medium">{recommendation.title}</h3>
                        </div>
                        <Badge variant="outline">{recommendation.category}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{recommendation.description}</p>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-green-600 font-medium">
                          Potential savings: ${recommendation.potentialSavings.toFixed(2)}/month
                        </p>

                        <Button variant="outline" size="sm">
                          Implement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recommendations in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2 shrink-0">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">How This Works</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Our algorithm analyzes your spending patterns over the last 3 months to identify areas where you could
                potentially save money. These recommendations are personalized based on your unique financial habits and
                updated as your spending changes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
