"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoneyChallenges } from "@/components/social/money-challenges"
import { AchievementBadges } from "@/components/social/achievement-badges"
import { SocialFeed } from "@/components/social/social-feed"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptionDetails } from "@/lib/firebase-service"

export default function CommunityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("feed")

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
        console.error("Error checking subscription status:", error)
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
        <h2 className="text-2xl font-bold tracking-tight">Community</h2>
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription>
            The Community feature is only available to premium users. Please upgrade your account to access this
            feature.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Community</h2>
      <p className="text-muted-foreground">
        Connect with other users, share your financial journey, and participate in challenges.
      </p>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="feed">Social Feed</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="badges">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <SocialFeed userId={user?.uid} />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <MoneyChallenges />
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <AchievementBadges />
        </TabsContent>
      </Tabs>
    </div>
  )
}
