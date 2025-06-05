"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase-init"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // State for error dialog
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
  })

  useEffect(() => {
    // Check if Firebase Auth is initialized
    const checkAuth = () => {
      if (auth) {
        setAuthInitialized(true)

        // Get email from URL parameters if available
        const emailParam = searchParams.get("email")
        if (emailParam) {
          setEmail(decodeURIComponent(emailParam))
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
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authInitialized) {
      setErrorDialog({
        isOpen: true,
        title: "Service unavailable",
        message: "Authentication service is not available. Please try again later.",
      })
      return
    }

    if (!email.trim()) {
      setErrorDialog({
        isOpen: true,
        title: "Email required",
        message: "Please enter your email address.",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!auth) {
        throw new Error("Authentication service not available")
      }

      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`, // Redirect to login after password reset
        handleCodeInApp: false,
      })

      setEmailSent(true)
      
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for password reset instructions.",
      })

    } catch (error: any) {
      console.error("Password reset error:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)

      let errorMessage = "Failed to send reset email. Please try again."
      let errorTitle = "Reset failed"

      // Handle specific error cases
      if (error.code === "auth/user-not-found") {
        errorTitle = "Account not found"
        errorMessage = "No account found with this email address. Please check your email or create a new account."
      } else if (error.code === "auth/invalid-email") {
        errorTitle = "Invalid email"
        errorMessage = "Invalid email format. Please enter a valid email address."
      } else if (error.code === "auth/too-many-requests") {
        errorTitle = "Too many requests"
        errorMessage = "Too many password reset attempts. Please wait a few minutes before trying again."
      } else if (error.code === "auth/network-request-failed") {
        errorTitle = "Connection error"
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.code === "auth/missing-email") {
        errorTitle = "Email required"
        errorMessage = "Please enter your email address."
      }

      setErrorDialog({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const closeErrorDialog = () => {
    setErrorDialog({
      isOpen: false,
      title: "",
      message: "",
    })
  }

  const handleResendEmail = () => {
    setEmailSent(false)
    // The form will be shown again for re-submission
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Check your email</h1>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              We've sent password reset instructions to:
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {email}
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Check your inbox and click the link in the email to reset your password.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-rose-600 hover:bg-rose-700"
            >
              Back to Login
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the email?{" "}
                <button
                  onClick={handleResendEmail}
                  className="font-medium text-rose-600 hover:text-rose-500"
                >
                  Send again
                </button>
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm font-medium text-rose-600 hover:text-rose-500">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-rose-600">BucksDash</h1>
          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
            <Mail className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-rose-600 hover:bg-rose-700" 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset email"}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-rose-600 hover:text-rose-500">
              Sign up
            </Link>
          </p>

          <p className="text-sm">
            <Link href="/" className="font-medium text-rose-600 hover:text-rose-500">
              ← Back to Home
            </Link>
          </p>
        </div>

        {/* Error Dialog */}
        <Dialog open={errorDialog.isOpen} onOpenChange={closeErrorDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-rose-600">{errorDialog.title}</DialogTitle>
              <DialogDescription>{errorDialog.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeErrorDialog}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}