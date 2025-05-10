"use server"

import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function createStripeCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })

    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error("Error creating Stripe customer:", error)
    return { success: false, error: "Failed to create customer" }
  }
}

export async function createSubscription(customerId: string, paymentMethodId: string) {
  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    // Set the payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID }], // Premium plan price ID
      expand: ["latest_invoice.payment_intent"],
    })

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
    }
  } catch (error) {
    console.error("Error creating subscription:", error)
    return { success: false, error: "Failed to create subscription" }
  }
}

export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
    })

    return { success: true, clientSecret: setupIntent.client_secret }
  } catch (error) {
    console.error("Error creating setup intent:", error)
    return { success: false, error: "Failed to create setup intent" }
  }
}
