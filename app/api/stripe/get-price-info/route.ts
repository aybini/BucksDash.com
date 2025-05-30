import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json({ success: false, error: "Missing price ID" }, { status: 400 });
    }

    // Mock price info (you can update it with real API calls if needed)
    const priceInfo = {
      amount: 599, // Example: $5.99
      currency: "usd",
    };

    return NextResponse.json({ success: true, ...priceInfo });
  } catch (error: any) {
    console.error("Error fetching price info:", error.message);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch price info" }, { status: 500 });
  }
}
