"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { PaymentForm } from "@/components/forms/payment-form"
import { createStripeCustomer } from "@/lib/stripe-actions"
import { signUp, signIn } from "@/lib/firebase-auth"
import { initializeUserData, getUserByEmail, updateUserSubscription } from "@/lib/firebase-service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function SubscribePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [existingUser, setExistingUser] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get user details from URL params
  const email = searchParams.get("email")
  const name = searchParams.get("name")
  const password = searchParams.get("password")

  // Use a ref to track whether the useEffect has run
  const useEffectRan = useRef(false)

  useEffect(() => {
    // Only run this effect once
    if (useEffectRan.current) {
      return
    }
    useEffectRan.current = true

    // Validate that we have all required parameters
    if (!email || !name || !password) {
      toast({
        title: "Missing Information",
        description: "Required information is missing. Please go back to the registration page.",
        variant: "destructive",
      })
      router.push("/register")
      return
    }

    // Check if user already exists and create a Stripe customer
    const setupCustomer = async () => {
      try {
        // Check if user already exists
        const userExists = await getUserByEmail(email)
        setExistingUser(!!userExists)

        // Create a Stripe customer
        const result = await createStripeCustomer(email, name)

        if (result.success) {
          setCustomerId(result.customerId)
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error("Error setting up customer:", error)
        toast({
          title: "Setup Error",
          description: "There was a problem setting up your subscription. Please try again.",
          variant: "destructive",
        })
        router.push("/register")
      } finally {
        setIsLoading(false)
      }
    }

    setupCustomer()
  }, [email, name, password, router, toast])

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    try {
      if (existingUser) {
        // If user exists, sign them in and update their subscription
        const user = await signIn(email!, password!)
        await updateUserSubscription(user.uid, {
          customerId: customerId!,
          subscriptionId: subscriptionId,
          status: "active",
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        // Create new user account
        const user = await signUp(email!, password!, name!)

        // Initialize user data with subscription info
        await initializeUserData(user.uid, {
          name: name!,
          email: email!,
          plan: "premium",
          stripeCustomerId: customerId!,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: "active",
        })

        // Redirect to verification page
        router.push("/verification?email=" + encodeURIComponent(email!))
      }
    } catch (error: any) {
      console.error("Error creating user account:", error)

      // Handle specific errors
      let errorMessage = "There was a problem creating your account. Please contact support."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please sign in instead."
        // Redirect to login page
        setTimeout(() => {
          router.push("/login?email=" + encodeURIComponent(email!))
        }, 3000)
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid password. Please try again with the correct password."
      }

      toast({
        title: "Account Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-600" />
          <h2 className="text-xl">Setting up your subscription...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-rose-600">Rose</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Complete Your Premium Subscription</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your payment details to activate your premium account
          </p>
          {existingUser && (
            <div className="mt-2 rounded-md bg-blue-50 p-2 text-sm text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              We noticed you already have an account. Your subscription will be added to your existing account.
            </div>
          )}
        </div>

        {customerId && (
          <Elements stripe={stripePromise}>
            <PaymentForm
              customerId={customerId}
              email={email!}
              password={password!}
              name={name!}
              onSuccess={handleSubscriptionSuccess}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
