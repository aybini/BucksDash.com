import { NextResponse } from "next/server"
import { db } from "@/lib/firebase-init"
import { doc, getDoc } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId parameter" }, { status: 400 })
    }

    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    const plaidItems = userData.plaidItems || {}
    const plaidAccounts = userData.plaidAccounts || []

    const itemArray = Object.values(plaidItems ?? {})

    const hasConnection = itemArray.length > 0 || plaidAccounts.length > 0

    const institutions = [
      ...new Set([
        ...itemArray.map((item: any) => item?.institutionName).filter(Boolean),
        ...plaidAccounts.map((account: any) => account?.institutionName).filter(Boolean),
      ]),
    ]

    return NextResponse.json({
      success: true,
      connected: hasConnection,
      accountsCount: itemArray.length + plaidAccounts.length,
      institutions,
      lastSync: userData?.plaidLastSync?.toDate?.() || null,
    })
  } catch (error: any) {
    console.error("Error checking Plaid connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unexpected server error while checking Plaid connection",
      },
      { status: 500 }
    )
  }
}
