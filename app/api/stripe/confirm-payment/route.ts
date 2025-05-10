import Stripe from "stripe"
import { NextResponse } from "next/server"
import crypto from "crypto"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  const { paymentMethodId, priceId, email } = await request.json()

  const idempotencyKey = crypto
    .createHash("sha256")
    .update(paymentMethodId + email)
    .digest("hex")

  try {
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
        return_url: `${process.env.VERCEL_URL}/verification?email=${email}`,
      },
      {
        idempotencyKey, // 👈 prevents duplicate PaymentIntent creation
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
