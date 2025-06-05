//just incase it does not work lol

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { signUp } from "@/lib/firebase-auth"
import { auth, initFirebase } from "@/lib/firebase-init"
import { initializeUserData } from "@/lib/firebase-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { BasicPlanPaymentForm } from "@/components/basic-plan-payment-form"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [plan, setPlan] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [showBasicPaymentForm, setShowBasicPaymentForm] = useState(false)
  const [priceInfo, setPriceInfo] = useState<{ amount: number; currency: string } | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)

  useEffect(() => {
    console.log("Register page mounted")
    initFirebase()
    console.log("Auth initialized:", !!auth)
  }, [])

  // Fetch price info when the payment form is about to be shown
  useEffect(() => {
    if (showBasicPaymentForm && !priceInfo && !loadingPrice) {
      fetchPriceInfo()
    }
  }, [showBasicPaymentForm, priceInfo, loadingPrice])

  const fetchPriceInfo = async () => {
    setLoadingPrice(true)
    try {
      const response = await fetch("/api/stripe/get-price-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPriceInfo({
          amount: data.amount,
          currency: data.currency,
        })
      } else {
        console.error("Error fetching price info:", data.error)
        // Use fallback values
        setPriceInfo({
          amount: 599, // $5.99 as fallback
          currency: "usd",
        })
      }
    } catch (error) {
      console.error("Error fetching price info:", error)
      // Use fallback values
      setPriceInfo({
        amount: 599, // $5.99 as fallback
        currency: "usd",
      })
    } finally {
      setLoadingPrice(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (plan === "basic") {
      setShowBasicPaymentForm(true)
    } else {
      setIsLoading(true)
      try {
        // Redirect to subscription page with user details
        const params = new URLSearchParams({
          email,
          name,
          password,
        })
        router.push(`/subscribe?${params.toString()}`)
      } catch (error: any) {
        console.error("Sign up error:", error)
        console.error("Error code:", error.code)
        console.error("Error message:", error.message)

        let errorMessage = "There was an error creating your account. Please try again."
        if (error.code === "auth/email-already-in-use") {
          errorMessage = "This email is already registered. Please log in instead."
          toast({
            title: "Account already exists",
            description: errorMessage,
            variant: "destructive",
            action: (
              <Button
              className="border border-gray-200 bg-transparent hover:bg-gray-100"
              onClick={() => router.push(`/login?email=${encodeURIComponent(email)}`)}
              >
                Go to Login
              </Button>
            ),
          })
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "The email address is not valid."
        } else if (error.code === "auth/weak-password") {
          errorMessage = "The password is too weak. Please choose a stronger password."
        } else if (error.code === "auth/network-request-failed") {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.code === "auth/configuration-not-found") {
          errorMessage = "The application is not configured correctly. Please contact support."
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBasicPaymentSuccess = async () => {
    setIsLoading(true)
    try {
      console.log("Attempting to sign up")
      console.log("Auth initialized:", !!auth)
      const user = await signUp(email, password, name)
      console.log("Sign up successful", user)

      // Initialize user data in Firestore
      try {
        await initializeUserData(user.uid, {
          name,
          email,
          plan: "basic",
        })
        console.log("User data initialized in Firestore")
      } catch (initError) {
        console.error("Error initializing user data:", initError)
        // Continue with the registration process even if initialization fails
        // We'll handle this gracefully
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before logging in.",
      })

      router.push("/verification?email=" + encodeURIComponent(email)) // Redirect to verification page
    } catch (error: any) {
      console.error("Sign up error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)

      let errorMessage = "There was an error creating your account. Please try again."
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please log in instead."
        toast({
          title: "Account already exists",
          description: errorMessage,
          variant: "destructive",
          action: (
            <Button
              
              onClick={() => router.push(`/login?email=${encodeURIComponent(email)}`)}
            >
              Go to Login
            </Button>
          ),
        })
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is not valid."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please choose a stronger password."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage = "The application is not configured correctly. Please contact support."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-rose-600">BucksDash</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-rose-600 hover:text-rose-500">
              Log in
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="font-medium text-rose-600 hover:text-rose-500">
              ← Back to Home
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label>Choose your plan</Label>
              <RadioGroup defaultValue="basic" value={plan} onValueChange={setPlan} className="mt-2">
                
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="basic" id="basic" />
                  <Label htmlFor="basic" className="flex-1 cursor-pointer">
                    <div className="font-medium">Basic -$5.99</div>
                    <div className="text-sm text-gray-500">One-time payment</div>
                  </Label>
                </div>

                {/* 
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium" className="flex-1 cursor-pointer">
                    <div className="font-medium">Premium</div>
                    <div className="text-sm text-gray-500">$8.99/month with advanced features</div>
                  </Label>
                </div>
                */}
              </RadioGroup>
            </div>
          </div>

          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {showBasicPaymentForm && priceInfo && (
          <Elements 
            stripe={stripePromise}
            options={{
              mode: 'payment',
              currency: priceInfo.currency,
              amount: priceInfo.amount,
              payment_method_types: ['card'],
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#E11D48', // Rose-600 color
                },
              }
            }}
          >
            <BasicPlanPaymentForm email={email} password={password} name={name} onSuccess={handleBasicPaymentSuccess} />
          </Elements>
        )}
        
        {showBasicPaymentForm && !priceInfo && (
          <div className="mt-6 text-center">
            <div className="animate-pulse">Loading payment options...</div>
          </div>
        )}
      </div>
    </div>
  )
}