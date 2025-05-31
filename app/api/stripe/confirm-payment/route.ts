import Stripe from "stripe"
import { NextResponse } from "next/server"
import crypto from "crypto"

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received payment data:', body)
    
    const { paymentMethodId, priceId, email } = body
    console.log('Parsed values:', { paymentMethodId, priceId, email })
    console.log('Environment BASIC_PRICE_ID:', process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID)

    if (!paymentMethodId || !email) {
      console.log('Missing required parameters - paymentMethodId:', !!paymentMethodId, 'email:', !!email)
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    const idempotencyKey = crypto
      .createHash("sha256")
      .update(paymentMethodId + email)
      .digest("hex")

    // Fixed: Use consistent pricing with your get-price-info API
    const amount = priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID ? 599 : 999; // $5.99 for basic, $9.99 for premium
    console.log('Calculated amount:', amount, 'for priceId:', priceId)

const paymentIntent = await stripe.paymentIntents.create(
  {
    amount,
    currency: "usd",
    payment_method: paymentMethodId,
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


    console.log('Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status)

    if (paymentIntent.status === "succeeded") {
      return NextResponse.json({ success: true, paymentIntent })
    } else {
      return NextResponse.json({ success: false, error: "Payment confirmation failed" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error confirming payment:", error.message || error)
    console.error("Full error object:", error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Your card was declined" 
      }, { status: 400 })
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      console.error("Invalid request error details:", error.message)
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