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
  const [debugInfo, setDebugInfo] = useState<{
    stripeLoaded?: boolean;
    paymentRequestCreated?: boolean;
    paymentMethodTriggered?: boolean;
    canMakePaymentResult?: any;
    canMakePaymentBool?: boolean;
    applePay?: boolean;
    googlePay?: boolean;
    link?: boolean;
    userAgent?: string;
    priceId?: string;
    canMakePaymentError?: string;
    requestBody?: any;
    apiResponse?: any;
  }>({})
  const [applePayError, setApplePayError] = useState<string | null>(null)
  const [applePayStatus, setApplePayStatus] = useState<string>("")
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (stripe) {
      setDebugInfo(prev => ({ ...prev, stripeLoaded: true }))
      
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Basic Plan",
          amount: 599,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      setDebugInfo(prev => ({ ...prev, paymentRequestCreated: true }))

      // Handle Apple Pay/Google Pay payment
      pr.on('paymentmethod', async (ev) => {
        setApplePayStatus("Starting Apple Pay payment...")
        setApplePayError(null)
        setDebugInfo(prev => ({ ...prev, paymentMethodTriggered: true }))
        setIsLoading(true)
        setCardError(null)

        try {
          setApplePayStatus("Sending payment to server...")
          
          const requestBody = {
            paymentMethodId: ev.paymentMethod.id,
            priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
            email,
          }
          
          setDebugInfo(prev => ({ ...prev, requestBody }))

          const response = await fetch("/api/stripe/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          })

          setApplePayStatus("Received response from server...")
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          setDebugInfo(prev => ({ ...prev, apiResponse: data }))

          if (!data.success) {
            setApplePayError(`API Error: ${data.error}`)
            ev.complete('fail')
            setIsLoading(false)
            return
          }

          setApplePayStatus("Payment successful! Creating account...")
          ev.complete('success')

          try {
            const user = await signUp(email, password, name)
            await initializeUserData(user.uid, { name, email, plan: "basic" })

            toast({
              title: "Account created!",
              description: "Please check your email to verify your account before logging in.",
            })

            router.push("/verification?email=" + encodeURIComponent(email))
          } catch (authError: any) {
            setApplePayError(`Account creation error: ${authError.message}`)
            console.error("Sign up error:", authError)
          }
        } catch (error: any) {
          setApplePayError(`Payment error: ${error.message}`)
          setApplePayStatus("Payment failed")
          ev.complete('fail')
        } finally {
          setIsLoading(false)
        }
      })

      pr.canMakePayment().then((result: any) => {
        setDebugInfo(prev => ({ 
          ...prev, 
          canMakePaymentResult: result,
          canMakePaymentBool: !!result,
          applePay: result?.applePay || false,
          googlePay: result?.googlePay || false,
          link: result?.link || false,
          userAgent: navigator.userAgent,
          priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID
        }))
        
        if (result) {
          setPaymentRequest(pr)
          setCanMakePayment(true)
        }
      }).catch((error: any) => {
        setDebugInfo(prev => ({ 
          ...prev, 
          canMakePaymentError: error.message || error 
        }))
      })
    } else {
      setDebugInfo(prev => ({ ...prev, stripeLoaded: false }))
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
    <div className="space-y-6">
      {/* DEBUG INFO */}
      <div className="p-3 bg-gray-100 text-xs rounded border">
        <div className="font-bold mb-2">Debug Info:</div>
        <div>Stripe Loaded: {debugInfo.stripeLoaded ? '✅' : '❌'}</div>
        <div>Payment Request Created: {debugInfo.paymentRequestCreated ? '✅' : '❌'}</div>
        <div>Can Make Payment: {debugInfo.canMakePaymentBool ? '✅' : '❌'}</div>
        <div>Apple Pay Available: {debugInfo.applePay ? '✅' : '❌'}</div>
        <div>Google Pay Available: {debugInfo.googlePay ? '✅' : '❌'}</div>
        <div>Link Available: {debugInfo.link ? '✅' : '❌'}</div>
        <div>Price ID: {debugInfo.priceId || 'MISSING'}</div>
        
        {applePayStatus && (
          <div className="mt-2 p-2 bg-blue-100 rounded">
            <div className="font-bold">Apple Pay Status:</div>
            <div>{applePayStatus}</div>
          </div>
        )}
        
        {applePayError && (
          <div className="mt-2 p-2 bg-red-100 rounded">
            <div className="font-bold text-red-600">Apple Pay Error:</div>
            <div className="text-red-600">{applePayError}</div>
          </div>
        )}
        
        {debugInfo.requestBody && (
          <div className="mt-2 p-2 bg-yellow-100 rounded">
            <div className="font-bold">Request Sent:</div>
            <div className="text-xs break-words">
              {JSON.stringify(debugInfo.requestBody, null, 2)}
            </div>
          </div>
        )}
        
        {debugInfo.apiResponse && (
          <div className="mt-2 p-2 bg-green-100 rounded">
            <div className="font-bold">API Response:</div>
            <div className="text-xs break-words">
              {JSON.stringify(debugInfo.apiResponse, null, 2)}
            </div>
          </div>
        )}
      </div>

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
    </div>
  )
}