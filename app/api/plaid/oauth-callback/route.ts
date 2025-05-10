import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams
    const oauthStateId = searchParams.get("state")
    const linkSessionId = searchParams.get("link_session_id")

    // Log the OAuth callback
    console.log("Received Plaid OAuth callback:", {
      state: oauthStateId,
      linkSessionId,
    })

    // Decode the state parameter to get the user ID
    let userId = null
    try {
      if (oauthStateId) {
        const decodedState = JSON.parse(Buffer.from(oauthStateId, "base64").toString())
        userId = decodedState.userId
        console.log("Decoded user ID from state:", userId)
      }
    } catch (error) {
      console.error("Error decoding state parameter:", error)
    }

    // Redirect to the appropriate page
    // If we have a userId, redirect to the dashboard with a success parameter
    if (userId) {
      return NextResponse.redirect(new URL(`/dashboard?plaid_oauth=success&userId=${userId}`, request.url))
    }

    // Otherwise, redirect to the dashboard with an error parameter
    return NextResponse.redirect(new URL("/dashboard?plaid_oauth=error", request.url))
  } catch (error) {
    console.error("Error handling Plaid OAuth callback:", error)
    return NextResponse.redirect(new URL("/dashboard?plaid_oauth=error", request.url))
  }
}
