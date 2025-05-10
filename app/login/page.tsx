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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  
  // New state for error dialog
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null as React.ReactNode | null,
  })

  useEffect(() => {
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

        // Check if user is already logged in
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            router.push("/dashboard")
          }
        })

        return unsubscribe
      } else {
        console.log("Auth not initialized yet, retrying...")
        setTimeout(checkAuth, 500)
        return () => {}
      }
    }

    const unsubscribe = checkAuth()
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
      await signIn(email, password)

      toast({
        title: "Logged in!",
        description: "You have successfully logged in.",
      })

      // Force navigation to dashboard
      window.location.href = "/dashboard"
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-rose-600">BucksDash</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Log in to your account</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Or{" "}
            <Link href="/register" className="font-medium text-rose-600 hover:text-rose-500">
              subscribe now
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-rose-600 hover:text-rose-500">
                  Forgot your password?
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
          </div>

          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Error Dialog */}
        <Dialog open={errorDialog.isOpen} onOpenChange={closeErrorDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-rose-600">{errorDialog.title}</DialogTitle>
              <DialogDescription>{errorDialog.message}</DialogDescription>
            </DialogHeader>
            {errorDialog.action && (
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeErrorDialog}>
                  Close
                </Button>
                {errorDialog.action}
              </DialogFooter>
            )}
            {!errorDialog.action && (
              <DialogFooter>
                <Button variant="outline" onClick={closeErrorDialog}>
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