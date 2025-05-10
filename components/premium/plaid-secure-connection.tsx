"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export function PlaidSecureConnection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isPremium } = useAuth()

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const oauthStateId = searchParams.get("oauth_state_id")

    if (!oauthStateId) {
      router.push("/dashboard")
      return
    }

    async function handleOAuthRedirect() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setStatus("success")
        setTimeout(() => router.push("/dashboard"), 3000)
      } catch (error) {
        console.error("OAuth error:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Something went wrong.")
      }
    }

    if (user) {
      handleOAuthRedirect()
    }
  }, [searchParams, router, user])

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card className="text-center">
        <CardHeader>
          <CardTitle>
            {status === "processing" && "Connecting Your Bank"}
            {status === "success" && "Connection Successful!"}
            {status === "error" && "Connection Failed"}
          </CardTitle>
          <CardDescription>
            {status === "processing" && "Please wait while we securely connect to your bank account..."}
            {status === "success" && "Your bank account has been successfully connected. Redirecting..."}
            {status === "error" && "There was an issue connecting your account. Please try again."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "processing" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-sm">Hang tight while we complete the process.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button onClick={() => router.push("/dashboard/connect-accounts")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
