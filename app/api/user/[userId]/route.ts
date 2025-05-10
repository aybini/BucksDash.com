import { type NextRequest, NextResponse } from "next/server"
import { getUserData } from "@/lib/firebase-service"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user data from Firebase
    const userData = await getUserData(userId)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: userId,
      name: userData.name,
      challenges: userData.challenges || { active: [], completed: [], badges: [] },
      budgets: userData.budgets || {},
      // Add other non-sensitive fields as needed
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
