"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createSubscription } from "@/lib/stripe-actions"
import { Loader2 } from "lucide-react"

interface PaymentFormProps {
  customerId: string
  email: string
  password: string
  name: string
  onSuccess: (subscriptionId: string) => void
}

export function PaymentForm({ customerId, email, password, name, onSuccess }: PaymentFormProps) {
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

      // Create the subscription
      const result = await createSubscription(customerId, paymentMethod.id)

      if (!result.success) {
        toast({
          title: "Subscription Error",
          description: result.error || "Failed to create subscription",
          variant: "destructive",
        })
        return
      }

      // Call the onSuccess callback with the subscription ID
      onSuccess(result.subscriptionId)

      toast({
        title: "Subscription Created",
        description: "Your premium subscription has been activated!",
      })
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
          "Subscribe Now"
        )}
      </Button>
    </form>
  )
}
