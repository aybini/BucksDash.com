"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptionDetails } from "@/lib/firebase-service"
import { SpendingRecommendations } from "@/components/premium/spending-recommendations"
import { FinancialInsights } from "@/components/premium/financial-insights"
import { Sparkles } from "lucide-react"

export default function PremiumPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return
      try {
        const subscription = await getSubscriptionDetails(user.uid)
        setIsPremium(subscription && subscription.status === "active")
      } catch (error) {
        console.error("Error checking status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && isClient) {
      checkStatus()
    }
  }, [user, isClient])

  if (loading || !isClient || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Premium Features</h2>
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
            <CardDescription>
              Unlock premium features to get personalized insights, spending recommendations, and optimize your
              finances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/pricing")} className="bg-rose-600 hover:bg-rose-700">
              <Sparkles className="mr-2 h-4 w-4" /> View Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Premium Features</h2>
      </div>

      <div className="space-y-6">
        <SpendingRecommendations />
        <FinancialInsights />
      </div>
    </div>
  )
}
