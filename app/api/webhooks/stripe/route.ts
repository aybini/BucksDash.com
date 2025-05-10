import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { updateSubscriptionStatus } from "@/lib/firebase-service"
import { db } from "@/lib/firebase-init"
import { collection, query, where, getDocs } from "firebase/firestore"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get("stripe-signature") || ""

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret!)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find the user with this Stripe customer ID
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("subscription.customerId", "==", customerId))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userId = querySnapshot.docs[0].id
          await updateSubscriptionStatus(userId, subscription.status)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find the user with this Stripe customer ID
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("subscription.customerId", "==", customerId))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userId = querySnapshot.docs[0].id
          await updateSubscriptionStatus(userId, "past_due")
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }
}
