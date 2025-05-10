import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { transactions, userId } = await request.json()

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Invalid transactions data" }, { status: 400 })
    }

    // Prepare the data for the AI prompt
    const totalSpending = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    // Group transactions by category
    const spendingByCategory: Record<string, number> = {}
    transactions.forEach((transaction: any) => {
      if (transaction.type === "expense") {
        const category = transaction.category || "Uncategorized"
        spendingByCategory[category] = (spendingByCategory[category] || 0) + transaction.amount
      }
    })

    // Create a simplified data structure for the AI
    const dataContext = {
      totalSpending,
      categories: Object.entries(spendingByCategory)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5) // Top 5 categories
        .map(([category, amount]) => ({ category, amount })),
      transactionSample: transactions.slice(0, 10), // Sample of transactions
    }

    // Create the prompt for OpenAI
    const prompt = `
      You are a financial advisor AI for a personal finance app called Rose Finance.
      Based on the following financial data, provide 3-4 personalized financial recommendations.
      
      DATA:
      ${JSON.stringify(dataContext, null, 2)}
      
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

      // Format and return the recommendations
      const now = Date.now()
      const formattedRecommendations = aiRecommendations.map((rec: any) => ({
        id: `ai-rec-${now}-${Math.random().toString(36).substring(2, 9)}`,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        confidence: rec.confidence,
        applied: false,
        dismissed: false,
        createdAt: now,
      }))

      return NextResponse.json({
        recommendations: formattedRecommendations,
        lastUpdated: now,
        nextUpdate: now + 24 * 60 * 60 * 1000, // 24 hours
      })
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse AI recommendations" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating AI recommendations:", error)
    return NextResponse.json({ error: "Failed to generate AI recommendations" }, { status: 500 })
  }
}
