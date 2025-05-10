import type { Transaction } from "./firebase-service"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Type definitions for recommendations
interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  confidence: "High" | "Medium" | "Low"
  applied: boolean
  dismissed: boolean
  createdAt: number
}

interface RecommendationsByCategory {
  spending: Recommendation[]
  subscriptions: Recommendation[]
  savings: Recommendation[]
  debt: Recommendation[]
  lastUpdated: number
  nextUpdate: number
}

// Generate AI recommendations using OpenAI
export async function generateAIRecommendations(
  transactions: Transaction[],
  userId: string,
): Promise<RecommendationsByCategory> {
  try {
    // Analyze transactions
    const totalSpending = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    // Group transactions by category
    const spendingByCategory: Record<string, number> = {}
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category || "Uncategorized"
        spendingByCategory[category] = (spendingByCategory[category] || 0) + transaction.amount
      }
    })

    // Sort categories by spending amount
    const sortedCategories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([category, amount]) => ({ category, amount }))

    // Find potential subscription transactions
    const subscriptionKeywords = [
      "netflix",
      "spotify",
      "hulu",
      "disney",
      "apple",
      "google",
      "amazon prime",
      "gym",
      "membership",
      "subscription",
    ]
    const potentialSubscriptions = transactions.filter((transaction) => {
      const name = (transaction.description || "").toLowerCase()
      return subscriptionKeywords.some((keyword) => name.includes(keyword))
    })

    // Find recurring transactions (potential savings opportunities)
    const recurringTransactions = findRecurringTransactions(transactions)

    // Find high-interest debt opportunities
    const debtTransactions = transactions.filter(
      (t) =>
        t.category?.toLowerCase().includes("debt") ||
        t.category?.toLowerCase().includes("loan") ||
        t.category?.toLowerCase().includes("credit"),
    )

    // Generate AI-enhanced recommendations for each category
    const [spendingRecs, subscriptionRecs, savingsRecs, debtRecs] = await Promise.all([
      generateEnhancedRecommendations("spending", sortedCategories, totalSpending),
      generateEnhancedRecommendations("subscriptions", potentialSubscriptions, totalSpending),
      generateEnhancedRecommendations("savings", recurringTransactions, totalSpending),
      generateEnhancedRecommendations("debt", debtTransactions, totalSpending),
    ])

    const now = Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000

    return {
      spending: spendingRecs,
      subscriptions: subscriptionRecs,
      savings: savingsRecs,
      debt: debtRecs,
      lastUpdated: now,
      nextUpdate: now + oneDayInMs,
    }
  } catch (error) {
    console.error("Error in AI recommendation generation:", error)
    // Return empty recommendations if there's an error
    return {
      spending: [],
      subscriptions: [],
      savings: [],
      debt: [],
      lastUpdated: Date.now(),
      nextUpdate: Date.now() + 24 * 60 * 60 * 1000,
    }
  }
}

// Helper function to find recurring transactions
function findRecurringTransactions(transactions: Transaction[]) {
  const merchantFrequency: Record<string, Transaction[]> = {}

  transactions.forEach((transaction) => {
    const merchant = transaction.description || "Unknown"
    if (!merchantFrequency[merchant]) {
      merchantFrequency[merchant] = []
    }
    merchantFrequency[merchant].push(transaction)
  })

  // Filter for merchants with multiple transactions (potentially recurring)
  return Object.entries(merchantFrequency)
    .filter(([, txs]) => (txs as Transaction[]).length > 1)
    .map(([merchant, txs]) => ({
      merchant,
      transactions: txs,
      frequency: (txs as Transaction[]).length,
      totalSpent: (txs as Transaction[]).reduce((sum, t) => sum + t.amount, 0),
    }))
}

// Generate enhanced recommendations using OpenAI
async function generateEnhancedRecommendations(
  category: string,
  data: any,
  totalSpending: number,
): Promise<Recommendation[]> {
  // First generate base recommendations
  let baseRecommendations: Recommendation[] = []

  switch (category) {
    case "spending":
      baseRecommendations = generateSpendingRecommendations(data, totalSpending)
      break
    case "subscriptions":
      baseRecommendations = generateSubscriptionRecommendations(data)
      break
    case "savings":
      baseRecommendations = generateSavingsRecommendations(data, totalSpending)
      break
    case "debt":
      baseRecommendations = generateDebtRecommendations(data)
      break
  }

  // If we have OpenAI access, enhance the recommendations
  try {
    if (baseRecommendations.length > 0) {
      const enhancedRecommendations = await enhanceRecommendationsWithAI(
        category,
        baseRecommendations,
        data,
        totalSpending,
      )
      return enhancedRecommendations
    }
  } catch (error) {
    console.error("Error enhancing recommendations with AI:", error)
    // Fall back to base recommendations if AI enhancement fails
  }

  return baseRecommendations
}

// Enhance recommendations using OpenAI
async function enhanceRecommendationsWithAI(
  category: string,
  baseRecommendations: Recommendation[],
  data: any,
  totalSpending: number,
): Promise<Recommendation[]> {
  try {
    // Only proceed if we have an OpenAI API key in environment variables
    if (!process.env.OPENAI_API_KEY) {
      return baseRecommendations
    }

    // Prepare the data for the AI prompt
    const dataContext = JSON.stringify({
      category,
      totalSpending,
      data: data.slice(0, 5), // Limit data to avoid token limits
      baseRecommendations: baseRecommendations.map((rec) => ({
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
      })),
    })

    // Create the prompt for OpenAI
    const prompt = `
      You are a financial advisor AI for a personal finance app called Rose Finance.
      Based on the following financial data and base recommendations, provide 2-3 improved, personalized financial recommendations.
      
      DATA:
      ${dataContext}
      
      For each recommendation, provide:
      1. A concise, actionable title (max 50 chars)
      2. A helpful description with specific advice (max 200 chars)
      3. The potential impact (e.g., "$X/month savings")
      4. A confidence level (High, Medium, or Low)
      
      Format your response as a valid JSON array of recommendations with these fields: title, description, impact, confidence
    `

    // Call OpenAI API using the AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse the response
    try {
      const aiRecommendations = JSON.parse(text)

      // Validate and format the AI recommendations
      if (Array.isArray(aiRecommendations) && aiRecommendations.length > 0) {
        return aiRecommendations.map((rec) => ({
          id: `ai-${category}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          confidence: rec.confidence as "High" | "Medium" | "Low",
          applied: false,
          dismissed: false,
          createdAt: Date.now(),
        }))
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
    }

    // Fall back to base recommendations if parsing fails
    return baseRecommendations
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    return baseRecommendations
  }
}

// Generate spending recommendations
function generateSpendingRecommendations(categories: any[], totalSpending: number): Recommendation[] {
  const recommendations: Recommendation[] = []
  const now = Date.now()

  // Only process if we have categories
  if (categories.length === 0) return recommendations

  // Top spending category recommendation
  if (categories.length > 0) {
    const topCategory = categories[0]
    const percentOfTotal = (topCategory.amount / totalSpending) * 100

    if (percentOfTotal > 30) {
      recommendations.push({
        id: `spending-top-category-${now}`,
        title: `Reduce Your ${topCategory.category} Expenses`,
        description: `You're spending ${percentOfTotal.toFixed(0)}% of your budget on ${topCategory.category}. Try to reduce this to 25% by finding alternatives or cutting back.`,
        impact: `Save $${(topCategory.amount * 0.2).toFixed(0)}/month`,
        confidence: "High",
        applied: false,
        dismissed: false,
        createdAt: now,
      })
    }
  }

  // Dining out recommendation if applicable
  const diningCategory = categories.find(
    (c) =>
      c.category.toLowerCase().includes("dining") ||
      c.category.toLowerCase().includes("restaurant") ||
      c.category.toLowerCase().includes("food"),
  )

  if (diningCategory && diningCategory.amount > 200) {
    recommendations.push({
      id: `spending-dining-${now}`,
      title: "Optimize Dining Expenses",
      description: `You spent $${diningCategory.amount.toFixed(0)} on dining out. Cooking at home 2 more days per week could save you approximately $${(diningCategory.amount * 0.3).toFixed(0)} per month.`,
      impact: `$${(diningCategory.amount * 0.3).toFixed(0)}/month savings`,
      confidence: "Medium",
      applied: false,
      dismissed: false,
      createdAt: now,
    })
  }

  return recommendations
}

// Generate subscription recommendations
function generateSubscriptionRecommendations(subscriptions: any[]): Recommendation[] {
  const recommendations: Recommendation[] = []
  const now = Date.now()

  if (subscriptions.length === 0) return recommendations

  // Calculate total subscription spending
  const totalSubscriptionSpending = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)

  if (subscriptions.length > 3) {
    recommendations.push({
      id: `subscription-audit-${now}`,
      title: "Subscription Audit Recommended",
      description: `You have ${subscriptions.length} active subscriptions totaling $${totalSubscriptionSpending.toFixed(0)}/month. Consider reviewing and canceling unused services.`,
      impact: `Save up to $${(totalSubscriptionSpending * 0.3).toFixed(0)}/month`,
      confidence: "High",
      applied: false,
      dismissed: false,
      createdAt: now,
    })
  }

  return recommendations
}

// Generate savings recommendations
function generateSavingsRecommendations(recurringTransactions: any[], totalSpending: number): Recommendation[] {
  const recommendations: Recommendation[] = []
  const now = Date.now()

  // Emergency fund recommendation
  const recommendedEmergencyFund = totalSpending * 3 // 3 months of expenses

  recommendations.push({
    id: `savings-emergency-${now}`,
    title: "Build Your Emergency Fund",
    description: `Based on your spending patterns, aim for an emergency fund of $${recommendedEmergencyFund.toFixed(0)} (3 months of expenses). Start by setting aside 5-10% of your income each month.`,
    impact: "Financial security during unexpected events",
    confidence: "High",
    applied: false,
    dismissed: false,
    createdAt: now,
  })

  return recommendations
}

// Generate debt recommendations
function generateDebtRecommendations(debtTransactions: any[]): Recommendation[] {
  const recommendations: Recommendation[] = []
  const now = Date.now()

  if (debtTransactions.length === 0) return recommendations

  // Calculate total debt payments
  const totalDebtPayments = debtTransactions.reduce((sum, tx) => sum + tx.amount, 0)

  // High-interest debt recommendation
  recommendations.push({
    id: `debt-high-interest-${now}`,
    title: "Focus on High-Interest Debt First",
    description:
      "Prioritize paying off high-interest debt like credit cards before lower-interest loans. This 'debt avalanche' method will save you the most money in interest.",
    impact: `Potential interest savings of $${(totalDebtPayments * 0.15).toFixed(0)} or more`,
    confidence: "High",
    applied: false,
    dismissed: false,
    createdAt: now,
  })

  return recommendations
}
