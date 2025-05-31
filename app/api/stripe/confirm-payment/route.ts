import Stripe from "stripe"
import { NextResponse } from "next/server"
import crypto from "crypto"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentMethodId, priceId, email } = body

    if (!paymentMethodId || !email) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    const idempotencyKey = crypto
      .createHash("sha256")
      .update(paymentMethodId + email)
      .digest("hex")

    const amount = priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ? 599 : 999

const paymentIntent = await stripe.paymentIntents.create(
  {
    amount,
    currency: "usd",
    payment_method: paymentMethodId,
    confirm: true,
    payment_method_types: ['card'], // ✅ This tells Stripe exactly what you're using
    automatic_payment_methods: {
      enabled: false, // ✅ This disables the redirect-based methods
    },
    receipt_email: email,
    description: `BucksDash ${amount === 599 ? 'Basic' : 'Premium'} Plan`,
    metadata: {
      email,
      priceId,
      plan: amount === 599 ? 'basic' : 'premium',
    },
  },
  { idempotencyKey }
)



    if (paymentIntent.status === "succeeded") {
      return NextResponse.json({ success: true, paymentIntent })
    } else {
      return NextResponse.json({ success: false, error: "Payment confirmation failed" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Full Stripe error:", JSON.stringify(error, null, 2))

    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error" 
    }, { status: 400 })
  }
}
