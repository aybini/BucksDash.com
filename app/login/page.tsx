"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { signIn } from "@/lib/firebase-auth"
import { auth } from "@/lib/firebase-init"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Sparkles, Shield, ArrowLeft, Mail, Lock } from "lucide-react"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  
  // New state for error dialog
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null as React.ReactNode | null,
  })

useEffect(() => {
  // Generate particles only on client side to prevent hydration mismatch
  const generatedParticles = [...Array(20)].map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    animationDelay: Math.random() * 5,
    animationDuration: 2 + Math.random() * 3
  }))
  setParticles(generatedParticles)

  // Check if Firebase Auth is initialized
  const checkAuth = () => {
    if (auth) {
      setAuthInitialized(true)

      // Get email from URL if available (when redirected from register)
      const params = new URLSearchParams(window.location.search)
      const emailParam = params.get("email")
      if (emailParam) {
        setEmail(emailParam)
      }

      // COMMENTED OUT - this was causing the redirect loop
      // const unsubscribe = auth.onAuthStateChanged((user) => {
      //   if (user) {
      //     router.push("/dashboard")
      //   }
      // })
      // return unsubscribe

      return () => {} // Return empty cleanup function
    } else {
      console.log("Auth not initialized yet, retrying...")
      setTimeout(checkAuth, 500)
      return () => {}
    }
  }

  const unsubscribe = checkAuth()
  
  // Trigger entrance animation
  setTimeout(() => setIsVisible(true), 100)
  
  return () => unsubscribe()
}, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authInitialized) {
      setErrorDialog({
        isOpen: true,
        title: "Service unavailable",
        message: "Authentication service is not available. Please try again later.",
        action: null,
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting to sign in with:", email)
      const result = await signIn(email, password)
      console.log("Sign in successful:", result)

      toast({
        title: "Logged in!",
        description: "You have successfully logged in.",
      })

      // Add a small delay before redirect to ensure auth state updates
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1000)
      
    } catch (error: any) {
      console.error("Login error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      console.error("Error name:", error.name)

      let errorMessage = "Failed to log in. Please check your credentials and try again."
      let errorTitle = "Login failed"
      let errorAction = null

      // Handle specific error cases
      if (error.name === "auth/email-not-verified") {
        errorTitle = "Email not verified"
        errorMessage = "Please verify your email before logging in. Check your inbox for a verification link."
        errorAction = (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setErrorDialog({ isOpen: false, title: "", message: "", action: null as React.ReactNode | null })
              router.push(`/verification?email=${encodeURIComponent(email)}`)
            }}
          >
            Resend Email
          </Button>
        )
      } else if (error.name === "auth/invalid-login-credentials" || error.code === "auth/invalid-credential") {
        errorTitle = "Invalid credentials"
        errorMessage = "The email or password you entered is incorrect. Please try again."
      } else if (error.code === "auth/user-not-found") {
        errorTitle = "Account not found"
        errorMessage = "No account found with this email address. Please check your email or create a new account."
      } else if (error.code === "auth/wrong-password") {
        errorTitle = "Incorrect password"
        errorMessage = "Incorrect password. Please try again or reset your password."
        errorAction = (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setErrorDialog({ isOpen: false, title: "", message: "", action: null as React.ReactNode | null })
              router.push(`/forgot-password?email=${encodeURIComponent(email)}`)
            }}
          >
            Reset Password
          </Button>
        )
      } else if (error.code === "auth/too-many-requests") {
        errorTitle = "Account temporarily locked"
        errorMessage = "Too many failed login attempts. Please try again later or reset your password."
      } else if (error.code === "auth/network-request-failed") {
        errorTitle = "Connection error"
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.code === "auth/invalid-email") {
        errorTitle = "Invalid email"
        errorMessage = "Invalid email format. Please enter a valid email address."
      }

      // Show error dialog instead of toast
      setErrorDialog({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        action: errorAction,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Close error dialog
  const closeErrorDialog = () => {
    setErrorDialog({
      isOpen: false,
      title: "",
      message: "",
      action: null,
    })
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
            Log in to your account
          </h2>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Or{" "}
            <Link 
              href="/register" 
              className="font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 relative group"
            >
              subscribe now
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
              
              {/* Enhanced Email Field */}
              <div className="group">
                <Label htmlFor="email" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Email address</span>
                  <Mail className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                    <span>Password</span>
                    <Lock className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-6" />
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-300 relative group"
                  >
                    Forgot your password?
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log in</span>
                    <Shield className="w-5 h-5 animate-pulse" />
                  </>
                )}
              </span>
            </Button>
          </form>
        </div>

        {/* Enhanced Error Dialog */}
        <Dialog open={errorDialog.isOpen} onOpenChange={closeErrorDialog}>
          <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-2xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent rounded-2xl" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-rose-600 dark:text-rose-400 flex items-center space-x-2 text-xl">
                <Shield className="w-5 h-5" />
                <span>{errorDialog.title}</span>
              </DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300 text-base">
                {errorDialog.message}
              </DialogDescription>
            </DialogHeader>
            {errorDialog.action && (
              <DialogFooter className="flex justify-end gap-3 relative z-10">
                <Button 
                  variant="outline" 
                  onClick={closeErrorDialog}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  Close
                </Button>
                {errorDialog.action}
              </DialogFooter>
            )}
            {!errorDialog.action && (
              <DialogFooter className="relative z-10">
                <Button 
                  variant="outline" 
                  onClick={closeErrorDialog}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  Close
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}