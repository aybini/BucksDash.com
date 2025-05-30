import Stripe from "stripe"
import { NextResponse } from "next/server"
import crypto from "crypto"

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
})

export async function POST(request: Request) {
  try {
    const { paymentMethodId, priceId, email } = await request.json()

    if (!paymentMethodId || !email) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    const idempotencyKey = crypto
      .createHash("sha256")
      .update(paymentMethodId + email)
      .digest("hex")

    // Fixed: Use consistent pricing with your get-price-info API
    const amount = priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ? 599 : 999; // $5.99 for basic, $9.99 for premium

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",
        payment_method: paymentMethodId,
        automatic_payment_methods: {
          enabled: true,
        },
        confirm: true,
        receipt_email: email,
        description: `BucksDash ${priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ? 'Basic' : 'Premium'} Plan`,
        metadata: {
          email,
          priceId,
          plan: priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ? 'basic' : 'premium',
        },
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
    console.error("Error confirming payment:", error.message || error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Your card was declined" 
      }, { status: 400 })
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid payment information" 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error" 
    }, { status: 500 })
  }
}