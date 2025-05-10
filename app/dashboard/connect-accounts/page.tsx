"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptionDetails } from "@/lib/firebase-service"
import { exchangePublicToken, createPlaidLinkToken } from "@/lib/plaid-actions"
import { usePlaidLink } from "react-plaid-link"
import {
  Wallet,
  Receipt,
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ConnectAccountsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [isConnecting, setIsConnecting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [linkToken, setLinkToken] = useState<string | null>(null)

  const fetchToken = useCallback(async () => {
    if (!user?.uid) {
      setError("User ID is required")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const response = await createPlaidLinkToken(user.uid)
      if (response.success && response.linkToken) {
        setLinkToken(response.linkToken)
      } else {
        setError(response.error || "Failed to create link token")
      }
    } catch (err: any) {
      console.error("Token error:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsConnecting(false)
    }
  }, [user?.uid])

  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (public_token, metadata) => {
      try {
        const result = await exchangePublicToken(public_token, user.uid, metadata || {})
        if (result.success) {
          setIsSuccess(true)
          setTimeout(() => router.push("/dashboard"), 2000)
        } else {
          setError(result.error || "Failed to connect account")
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while connecting your account")
      }
    },
    onExit: () => {
      console.log("Plaid exit")
    },
  })

  useEffect(() => {
    if (user) fetchToken()
  }, [user, fetchToken])

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        try {
          const subscription = await getSubscriptionDetails(user.uid)
          setIsPremium(subscription && subscription.status === "active")
        } catch (error) {
          console.error("Subscription check failed:", error)
        }
      }
    }
    if (user) checkPremiumStatus()
  }, [user])

  const premiumBenefits = [
    {
      title: "Automatic Transaction Import",
      description: "Sync all your bank activity in real time.",
      icon: Receipt,
    },
    {
      title: "Real-Time Balance Updates",
      description: "Monitor all balances across accounts instantly.",
      icon: Wallet,
    },
    {
      title: "AI-Powered Insights",
      description: "Receive personalized tips to improve your finances.",
      icon: Brain,
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Connect Your Accounts</h2>
      <Card>
        <CardHeader>
          <CardTitle>Secure Bank Connection</CardTitle>
          <CardDescription>
            Securely link your bank accounts to automate expense tracking, balance updates, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPremium ? (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need a premium subscription to use account linking. Please upgrade by creating a new account with
                a premium plan.
              </AlertDescription>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {premiumBenefits.map((benefit) => (
                  <li key={benefit.title} className="flex items-center">
                    <benefit.icon className="mr-2 h-4 w-4 text-rose-600" />
                    <span>{benefit.description}</span>
                  </li>
                ))}
              </ul>
            </Alert>
          ) : isSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                Account connected successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {isPremium && (
            <Button
              onClick={() => (ready && linkToken ? open() : fetchToken())}
              disabled={!ready || !linkToken}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Bank Account"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
