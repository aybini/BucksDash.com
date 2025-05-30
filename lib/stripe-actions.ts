"use server"

import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Type guard to check if the latest_invoice is an object
function isInvoiceObject(invoice: string | Stripe.Invoice): invoice is Stripe.Invoice {
  return typeof invoice !== "string";
}

// Create a new customer in Stripe
export async function createStripeCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return { success: true, customerId: customer.id };
  } catch (error: any) {
    console.error("Error creating Stripe customer:", error.message);
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

// Create a subscription for the customer with Apple Pay and Google Pay support
// Create a subscription for the customer with Apple Pay and Google Pay support
export async function createSubscription(customerId: string, paymentMethodId: string) {
  try {
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription with 'card' as the payment method type
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
    });

    // Safely access the client secret from the expanded latest_invoice
    const latestInvoice = subscription.latest_invoice;

    let clientSecret: string | null = null;

    if (latestInvoice && typeof latestInvoice === "object" && "payment_intent" in latestInvoice) {
      const paymentIntent = latestInvoice.payment_intent;
      
      // Check if the payment_intent itself is an object
      if (paymentIntent && typeof paymentIntent === "object" && "client_secret" in paymentIntent) {
        clientSecret = (paymentIntent as Stripe.PaymentIntent).client_secret || null;
      }
    }

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
    };
  } catch (error: any) {
    console.error("Error creating subscription:", error.message);
    return { success: false, error: error.message || "Failed to create subscription" };
  }
}


// Create a setup intent for the customer
export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"], // Use 'card' to support Apple Pay/Google Pay
      usage: "off_session",
    });

    return { success: true, clientSecret: setupIntent.client_secret };
  } catch (error: any) {
    console.error("Error creating setup intent:", error.message);
    return { success: false, error: error.message || "Failed to create setup intent" };
  }
}
