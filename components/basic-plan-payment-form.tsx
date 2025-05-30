"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  CardElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
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
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Basic Plan",
          amount: 599, // Fixed to match your API (599 cents = $5.99)
        },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      // Handle Apple Pay/Google Pay payment
      pr.on('paymentmethod', async (ev) => {
        console.log('Apple Pay event data:', ev)
        console.log('Payment method:', ev.paymentMethod)
        console.log('Payment method ID:', ev.paymentMethod.id)
        
        setIsLoading(true)
        setCardError(null)

        try {
          // ADD DEBUG LOGGING HERE
          console.log('About to send to API:', {
            paymentMethodId: ev.paymentMethod.id,
            priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
            email: email
          })
          console.log('Environment check:', {
            priceIdExists: !!process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
            priceIdValue: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID
          })

          // Confirm payment with Stripe
          const response = await fetch("/api/stripe/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentMethodId: ev.paymentMethod.id,
              priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
              email,
            }),
          })

          console.log('API response status:', response.status)
          const data = await response.json()
          console.log('API response data:', data)

          if (!data.success) {
            ev.complete('fail')
            setCardError(data.error || "Failed to confirm payment")
            setIsLoading(false)
            return
          }

          // Complete the payment
          ev.complete('success')

          // Create Firebase user account
          try {
            const user = await signUp(email, password, name)
            await initializeUserData(user.uid, { name, email, plan: "basic" })

            toast({
              title: "Account created!",
              description: "Please check your email to verify your account before logging in.",
            })

            router.push("/verification?email=" + encodeURIComponent(email))
          } catch (authError: any) {
            console.error("Sign up error:", authError)
            let errorMessage = "There was an error creating your account. Please try again."

            if (authError.code === "auth/email-already-in-use") {
              errorMessage = "This email is already registered. Please log in instead."
            } else if (authError.code === "auth/invalid-email") {
              errorMessage = "The email address is not valid."
            } else if (authError.code === "auth/weak-password") {
              errorMessage = "The password is too weak. Please choose a stronger password."
            }

            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Payment error:", error)
          ev.complete('fail')
          toast({
            title: "Payment Error",
            description: "There was a problem processing your payment",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      })

      pr.canMakePayment().then((result: any) => {
        console.log('Payment request can make payment result:', result)
        if (result) {
          setPaymentRequest(pr)
          setCanMakePayment(true)
        }
      })
    }
  }, [stripe, email, name, password, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setCardError("Stripe has not loaded yet.")
      return
    }

    setIsLoading(true)
    setCardError(null)

    try {
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
        setIsLoading(false)
        return
      }

      // Debug logging for card payments too
      console.log('Card payment - About to send to API:', {
        paymentMethodId: paymentMethod.id,
        priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
        email: email
      })

      const response = await fetch("/api/stripe/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
          email,
        }),
      })

      const data = await response.json()
      console.log('Card payment API response:', data)

      if (!data.success) {
        setCardError(data.error || "Failed to confirm payment")
        setIsLoading(false)
        return
      }

      try {
        const user = await signUp(email, password, name)
        await initializeUserData(user.uid, { name, email, plan: "basic" })

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before logging in.",
        })

        router.push("/verification?email=" + encodeURIComponent(email))
      } catch (authError: any) {
        console.error("Sign up error:", authError)
        let errorMessage = "There was an error creating your account. Please try again."

        if (authError.code === "auth/email-already-in-use") {
          errorMessage = "This email is already registered. Please log in instead."
        } else if (authError.code === "auth/invalid-email") {
          errorMessage = "The email address is not valid."
        } else if (authError.code === "auth/weak-password") {
          errorMessage = "The password is too weak. Please choose a stronger password."
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
      {canMakePayment && paymentRequest && (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Pay</div>
            <PaymentRequestButtonElement
              options={{ 
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    theme: 'dark',
                    height: '48px',
                  },
                }
              }}
              className="w-full"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or pay with card</span>
            </div>
          </div>
        </div>
      )}

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

      <Button 
        type="submit" 
        className="w-full bg-rose-600 hover:bg-rose-700" 
        disabled={isLoading || !stripe}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Purchase Basic Plan - $5.99"
        )}
      </Button>
    </form>
  )
}