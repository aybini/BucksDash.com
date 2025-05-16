import Stripe from "stripe"
import { NextResponse } from "next/server"
import crypto from "crypto"

// Update the API version to match the expected version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil", // Updated to the version expected by your Stripe library
})

export async function POST(request: Request) {
  const { paymentMethodId, priceId, email } = await request.json()

  const idempotencyKey = crypto
    .createHash("sha256")
    .update(paymentMethodId + email)
    .digest("hex")

  try {
    // Fix: Add the https:// protocol to the return_url
    const returnUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/verification?email=${email}`
      : `https://www.bucksdash.com/verification?email=${email}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: 599,
        currency: "usd",
        payment_method: paymentMethodId,
        automatic_payment_methods: {
          enabled: true,
        },
        confirm: true,
        receipt_email: email,
        return_url: returnUrl, // Use the properly formatted URL
      },
      {
        idempotencyKey,
      },
    )

    if (paymentIntent.status === "succeeded") {
      return NextResponse.json({ success: true, paymentIntent })
    } else {
      return NextResponse.json({ success: false, error: "Payment confirmation failed" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}