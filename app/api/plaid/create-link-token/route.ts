import { NextResponse } from "next/server"
import { createLinkToken } from "@/lib/plaid-client"

export async function POST(request: Request) {
  try {
    // Add timeout for the request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    // Parse the request body
    const body = await request.json()
    const { userId, isUpdate, itemId, redirectUri } = body

    // Validate config
    if (
      !process.env.PLAID_CLIENT_ID ||
      !process.env.PLAID_SECRET ||
      process.env.PLAID_CLIENT_ID.length < 10 ||
      process.env.PLAID_SECRET.length < 10
    ) {
      console.error("❌ Missing or invalid Plaid credentials in environment")
      console.log("Client ID length:", process.env.PLAID_CLIENT_ID ? process.env.PLAID_CLIENT_ID.length : 0)
      console.log("Secret length:", process.env.PLAID_SECRET ? process.env.PLAID_SECRET.length : 0)

      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid Plaid credentials",
        },
        { status: 500 },
      )
    }

    // Clear the timeout
    clearTimeout(timeoutId)

    // Validate the request
    if (!userId) {
      console.error("Missing required parameter: userId")
      return NextResponse.json({ success: false, error: "Missing required parameter: userId" }, { status: 400 })
    }

    console.log(`Creating link token for user ${userId}, update: ${isUpdate || false}, itemId: ${itemId || "none"}`)
    console.log(`🔑 Creating link token with Plaid environment: ${process.env.PLAID_ENV || "production"}`)

    // Create the link token
    const result = await createLinkToken(userId, isUpdate, itemId)

    // Log the result without accessing potentially undefined properties
    console.log("Link token creation result:", {
      success: result.success,
      hasToken: !!result.linkToken,
    })

    // Return the result
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error creating link token:", error)

    // Check if it's an abort error (timeout)
    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "Request timed out. The Plaid API may be experiencing issues.",
        },
        { status: 408 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An error occurred while creating the link token",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST method to create a link token" })
}
