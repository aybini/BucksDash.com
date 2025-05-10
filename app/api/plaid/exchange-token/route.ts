import { NextResponse } from "next/server"
import { exchangePublicToken } from "@/lib/plaid-client"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { publicToken, userId, metadata } = body

    // Validate the request
    if (!publicToken || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: publicToken, userId" },
        { status: 400 },
      )
    }

    console.log(`Exchanging public token for user ${userId}`)

    // Exchange the public token for an access token
    const result = await exchangePublicToken(userId, publicToken, metadata)

    // Return the result
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error exchanging public token:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while exchanging the public token",
      },
      { status: 500 },
    )
  }
}
