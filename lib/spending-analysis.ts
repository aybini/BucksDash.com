import type { Transaction } from "./firebase-service"
import { subMonths, isAfter } from "date-fns"

// Define the recommendation type
export interface SpendingRecommendation {
  id: string
  category: string
  title: string
  description: string
  potentialSavings: number
  severity: "low" | "medium" | "high"
  implementationSteps?: string[]
}

/**
 * Analyzes user transactions and generates personalized spending recommendations
 * @param transactions User transactions to analyze
 * @returns Array of spending recommendations
 */
export function analyzeSpendingPatterns(transactions: Transaction[]): SpendingRecommendation[] {
  const recommendations: SpendingRecommendation[] = []

  // Skip if no transactions
  if (!transactions.length) return recommendations

  // Get transactions from the last 3 months
  const threeMonthsAgo = subMonths(new Date(), 3)
  const recentTransactions = transactions.filter((tx) => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
    return isAfter(txDate, threeMonthsAgo)
  })

  // Group transactions by category
  const categorizedTransactions: Record<string, Transaction[]> = {}
  recentTransactions.forEach((transaction) => {
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
        implementationSteps: [
          "Invest in a quality coffee maker for home use",
          "Limit coffee shop visits to 1-2 times per week",
          "Use a travel mug for homemade coffee on the go",
        ],
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
        implementationSteps: [
          "Plan meals for the week in advance",
          "Cook in batches and freeze portions for busy days",
          "Limit eating out to weekends only",
        ],
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
      implementationSteps: [
        "Wait 24 hours before making non-essential purchases",
        "Create a shopping list and stick to it",
        "Unsubscribe from retailer emails to avoid temptation",
      ],
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
      implementationSteps: [
        "Research free events in your area",
        "Use library services for books, movies, and games",
        "Look for discount days at theaters and venues",
      ],
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
      implementationSteps: [
        "List all your current subscriptions and their costs",
        "Identify services you haven't used in the last month",
        "Consider sharing subscription costs with family or friends",
      ],
    })
  }

  return recommendations
}

/**
 * Calculates the total potential savings from a list of recommendations
 * @param recommendations List of spending recommendations
 * @returns Total potential monthly savings
 */
export function calculateTotalPotentialSavings(recommendations: SpendingRecommendation[]): number {
  return recommendations.reduce((total, rec) => total + rec.potentialSavings, 0)
}

/**
 * Identifies the top spending categories from a list of transactions
 * @param transactions User transactions to analyze
 * @param count Number of top categories to return
 * @returns Array of top spending categories with amounts
 */
export function getTopSpendingCategories(
  transactions: Transaction[],
  count = 5,
): { category: string; amount: number }[] {
  // Group transactions by category
  const categorizedTransactions: Record<string, number> = {}

  transactions.forEach((transaction) => {
    if (transaction.type === "expense") {
      const category = transaction.category || "Uncategorized"
      if (!categorizedTransactions[category]) {
        categorizedTransactions[category] = 0
      }
      categorizedTransactions[category] += transaction.amount
    }
  })

  // Sort categories by amount and return top ones
  return Object.entries(categorizedTransactions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([category, amount]) => ({ category, amount }))
}

/**
 * Detects unusual spending patterns compared to user's history
 * @param transactions User transactions to analyze
 * @returns Array of categories with unusual spending
 */
export function detectUnusualSpending(
  transactions: Transaction[],
): { category: string; amount: number; percentIncrease: number }[] {
  const unusualSpending = []

  // Get transactions from the last 3 months
  const threeMonthsAgo = subMonths(new Date(), 3)
  const oneMonthAgo = subMonths(new Date(), 1)

  // Filter transactions for previous two months and current month
  const previousMonthsTransactions = transactions.filter((tx) => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
    return isAfter(txDate, threeMonthsAgo) && !isAfter(txDate, oneMonthAgo)
  })

  const currentMonthTransactions = transactions.filter((tx) => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
    return isAfter(txDate, oneMonthAgo)
  })

  // Calculate spending by category for previous months (average)
  const previousSpending: Record<string, number> = {}
  previousMonthsTransactions.forEach((tx) => {
    if (tx.type === "expense") {
      const category = tx.category || "Uncategorized"
      if (!previousSpending[category]) {
        previousSpending[category] = 0
      }
      previousSpending[category] += tx.amount
    }
  })

  // Divide by 2 to get monthly average
  Object.keys(previousSpending).forEach((category) => {
    previousSpending[category] /= 2
  })

  // Calculate spending by category for current month
  const currentSpending: Record<string, number> = {}
  currentMonthTransactions.forEach((tx) => {
    if (tx.type === "expense") {
      const category = tx.category || "Uncategorized"
      if (!currentSpending[category]) {
        currentSpending[category] = 0
      }
      currentSpending[category] += tx.amount
    }
  })

  // Compare and find unusual increases
  Object.keys(currentSpending).forEach((category) => {
    const current = currentSpending[category]
    const previous = previousSpending[category] || 0

    // Skip categories with very small previous spending to avoid division by zero issues
    if (previous < 10) return

    const percentIncrease = ((current - previous) / previous) * 100

    // If spending increased by more than 50%, consider it unusual
    if (percentIncrease > 50 && current - previous > 50) {
      unusualSpending.push({
        category,
        amount: current,
        percentIncrease,
      })
    }
  })

  return unusualSpending.sort((a, b) => b.percentIncrease - a.percentIncrease)
}
