"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { resendVerificationEmail } from "@/lib/firebase-auth"
import { Mail, ArrowRight, RefreshCw } from "lucide-react"

export default function VerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { toast } = useToast()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    if (countdown > 0) return

    setIsLoading(true)
    try {
      await resendVerificationEmail()
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      })
      setCountdown(60) // Start a 60-second countdown
    } catch (error: any) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
            <Mail className="h-8 w-8 text-rose-600 dark:text-rose-300" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification email to <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <p>
              Please check your email and click on the verification link to activate your account. If you don't see the
              email, check your spam folder.
            </p>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Once you've verified your email, you can{" "}
              <Link href="/login" className="font-medium text-rose-600 hover:text-rose-500">
                log in to your account
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={isLoading || countdown > 0}
            variant="outline"
            className="w-full"
          >
            {countdown > 0 ? (
              <>
                Resend in {countdown}s
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Resend verification email
                {isLoading && <RefreshCw className="ml-2 h-4 w-4 animate-spin" />}
              </>
            )}
          </Button>
          <Link href="/login" className="w-full">
            <Button className="w-full bg-rose-600 hover:bg-rose-700">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
