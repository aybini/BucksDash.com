"use client"

import type React from "react"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/firebase-auth"
import { initializeUserData } from "@/lib/firebase-service"

interface BasicPlanPaymentFormProps {
  email: string
  name: string
  password: string
  onSuccess: () => void
}

export function BasicPlanPaymentForm({ email, name, password, onSuccess }: BasicPlanPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return
    }

    setIsLoading(true)
    setCardError(null)

    try {
      // Create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
        billing_details: {
          name,
          email,
        },
      })

      if (error) {
        setCardError(error.message || "An error occurred with your card")
        return
      }

      // Confirm the payment intent on the server
      const response = await fetch("/api/stripe/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: process.env.STRIPE_BASIC_PRICE_ID,
          email: email,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setCardError(data.error || "Failed to confirm payment")
        return
      }

      // Sign up the user after successful payment
      try {
        const user = await signUp(email, password, name)

        // Initialize user data in Firestore
        await initializeUserData(user.uid, {
          name,
          email,
          plan: "basic",
        })

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before logging in.",
        })

        router.push("/verification?email=" + encodeURIComponent(email)) // Redirect to verification page
      } catch (authError: any) {
        console.error("Sign up error:", authError)
        console.error("Error code:", authError.code)
        console.error("Error message:", authError.message)

        let errorMessage = "There was an error creating your account. Please try again."
        if (authError.code === "auth/email-already-in-use") {
          errorMessage = "This email is already registered. Please log in instead."
          toast({
            title: "Account already exists",
            description: errorMessage,
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/login?email=${encodeURIComponent(email)}`)}
              >
                Go to Login
              </Button>
            ),
          })
        } else if (authError.code === "auth/invalid-email") {
          errorMessage = "The email address is not valid."
        } else if (authError.code === "auth/weak-password") {
          errorMessage = "The password is too weak. Please choose a stronger password."
        } else if (authError.code === "auth/network-request-failed") {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (authError.code === "auth/configuration-not-found") {
          errorMessage = "The application is not configured correctly. Please contact support."
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
        {cardError && <p className="text-sm text-red-500">{cardError}</p>}
      </div>

      <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading || !stripe}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Purchase Basic Plan"
        )}
      </Button>
    </form>
  )
}
