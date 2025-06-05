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
import { Eye, EyeOff, Sparkles, Shield, ArrowLeft, CheckCircle, Star } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

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
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    console.log("Register page mounted")
    initFirebase()
    console.log("Auth initialized:", !!auth)
    
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 2 + Math.random() * 3
    }))
    setParticles(generatedParticles)
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-500/20 dark:bg-rose-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/10 dark:bg-rose-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles - Only render after hydration */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full animate-pulse shadow-lg opacity-60"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <div className={`w-full max-w-md space-y-8 relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="relative group">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
              BucksDash
            </h1>
            <div className="absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-8 h-8 text-rose-500 animate-spin drop-shadow-lg" style={{ animationDuration: '3s' }} />
            </div>
            {/* Glow effect behind text */}
            <div className="absolute inset-0 text-5xl font-bold text-rose-500/20 blur-lg animate-pulse">
              BucksDash
            </div>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
            Create your account
          </h2>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 relative group"
            >
              Log in
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </p>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <Link 
              href="/" 
              className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 inline-flex items-center group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </p>
        </div>

        {/* Enhanced Form Card */}
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 dark:from-rose-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              
              {/* Enhanced Name Field */}
              <div className="group">
                <Label htmlFor="name" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Full name</span>
                  <Star className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-rose-500 focus:ring-rose-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Enhanced Email Field */}
              <div className="group">
                <Label htmlFor="email" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Email address</span>
                  <Shield className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-rose-500 focus:ring-rose-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="group">
                <Label htmlFor="password" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Password</span>
                  <Shield className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-6" />
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-rose-500 focus:ring-rose-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-300 transform hover:scale-110"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Enhanced Plan Selection */}
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Choose your plan</span>
                  <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                </Label>
                <RadioGroup defaultValue="basic" value={plan} onValueChange={setPlan} className="mt-2">
                  
                  <div className="relative group cursor-pointer">
                    <div className="flex items-center space-x-2 rounded-2xl border-2 border-gray-200 dark:border-white/20 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-white/10 hover:from-rose-50 hover:to-white dark:hover:from-white/10 dark:hover:to-white/15 transition-all duration-300 hover:border-rose-300 dark:hover:border-rose-400/50 hover:shadow-lg">
                      <RadioGroupItem value="basic" id="basic" className="border-gray-400 dark:border-white/40 text-rose-500 w-5 h-5" />
                      <Label htmlFor="basic" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                          <span>Basic - $5.99</span>
                          <CheckCircle className="w-4 h-4 text-green-500 drop-shadow-sm" />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">One-time payment</div>
                      </Label>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-rose-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* PRESERVED COMMENTED SECTION */}
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

            {/* Enhanced Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:via-rose-700 hover:to-rose-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group text-lg" 
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>

        {/* Enhanced Payment Form */}
        {showBasicPaymentForm && priceInfo && (
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group transition-all duration-700 transform animate-in slide-in-from-bottom-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
                  <Shield className="w-6 h-6 text-green-500" />
                  <span>Secure Payment</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-300">Protected by industry-leading encryption</p>
              </div>
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
                      borderRadius: '12px',
                    },
                  }
                }}
              >
                <BasicPlanPaymentForm email={email} password={password} name={name} onSuccess={handleBasicPaymentSuccess} />
              </Elements>
            </div>
          </div>
        )}
        
        {showBasicPaymentForm && !priceInfo && (
          <div className="mt-6 text-center bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-3 text-gray-900 dark:text-white">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-medium animate-pulse">Loading payment options...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}