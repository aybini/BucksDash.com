"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, RefreshCw, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getTransactions, updateUserData } from "@/lib/firebase-service"
import { generateAIRecommendations } from "@/lib/ai-service"

interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  confidence: "High" | "Medium" | "Low"
  applied: boolean
  dismissed: boolean
  createdAt: number
}

interface RecommendationsByCategory {
  spending: Recommendation[]
  subscriptions: Recommendation[]
  savings: Recommendation[]
  debt: Recommendation[]
  lastUpdated: number
  nextUpdate: number
}

export function AIRecommendations() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recommendations, setRecommendations] = useState<RecommendationsByCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("spending")
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<string>("")

  useEffect(() => {
    if (user) {
      loadRecommendations()
    }
  }, [user])

  useEffect(() => {
    // Update the countdown timer every minute
    const interval = setInterval(() => {
      if (recommendations?.nextUpdate) {
        updateCountdown(recommendations.nextUpdate)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [recommendations])

  const updateCountdown = (nextUpdateTimestamp: number) => {
    const now = Date.now()
    const timeRemaining = nextUpdateTimestamp - now

    if (timeRemaining <= 0) {
      setTimeUntilNextUpdate("Ready to update")
      return
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

    setTimeUntilNextUpdate(`${hours}h ${minutes}m`)
  }

  const loadRecommendations = async () => {
    if (!user) return

    try {
      setLoading(true)

      // First check if we have stored recommendations
      const userData = await getUserData(user.uid)
      let userRecommendations = userData?.recommendations as RecommendationsByCategory | null

      // If we have recommendations but they're older than 24 hours, refresh them
      const now = Date.now()
      const shouldRefresh =
        !userRecommendations ||
        !userRecommendations.lastUpdated ||
        !userRecommendations.nextUpdate ||
        userRecommendations.nextUpdate <= now

      if (shouldRefresh) {
        userRecommendations = await refreshRecommendations()
      } else if (userRecommendations) {
        // Update the countdown
        updateCountdown(userRecommendations.nextUpdate)
      }

      setRecommendations(userRecommendations)
    } catch (error) {
      console.error("Error loading recommendations:", error)
      toast({
        title: "Error",
        description: "Failed to load AI recommendations. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshRecommendations = async () => {
    if (!user) return null

    try {
      setRefreshing(true)

      // Get user's transactions
      const transactions = await getTransactions(user.uid)

      // Generate new recommendations
      const newRecommendations = await generateAIRecommendations(transactions, user.uid)

      // Save to user's data
      await updateUserData(user.uid, { recommendations: newRecommendations })

      // Update countdown
      updateCountdown(newRecommendations.nextUpdate)

      toast({
        title: "Success",
        description: "AI recommendations refreshed successfully!",
      })

      return newRecommendations
    } catch (error) {
      console.error("Error refreshing recommendations:", error)
      toast({
        title: "Error",
        description: "Failed to refresh AI recommendations. Please try again later.",
        variant: "destructive",
      })
      return null
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    const newRecommendations = await refreshRecommendations()
    if (newRecommendations) {
      setRecommendations(newRecommendations)
    }
  }

  const handleApplyRecommendation = async (id: string) => {
    if (!user || !recommendations) return

    try {
      // Find the recommendation and mark it as applied
      const updatedRecommendations = { ...recommendations }

      // Update the recommendation in the appropriate category
      for (const category of ["spending", "subscriptions", "savings", "debt"] as const) {
        const index = updatedRecommendations[category].findIndex((rec) => rec.id === id)
        if (index !== -1) {
          updatedRecommendations[category][index] = {
            ...updatedRecommendations[category][index],
            applied: true,
            dismissed: false,
          }
          break
        }
      }

      // Save to user's data
      await updateUserData(user.uid, { recommendations: updatedRecommendations })

      // Update local state
      setRecommendations(updatedRecommendations)

      toast({
        title: "Success",
        description: "Recommendation applied successfully!",
      })
    } catch (error) {
      console.error("Error applying recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to apply recommendation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDismissRecommendation = async (id: string) => {
    if (!user || !recommendations) return

    try {
      // Find the recommendation and mark it as dismissed
      const updatedRecommendations = { ...recommendations }

      // Update the recommendation in the appropriate category
      for (const category of ["spending", "subscriptions", "savings", "debt"] as const) {
        const index = updatedRecommendations[category].findIndex((rec) => rec.id === id)
        if (index !== -1) {
          updatedRecommendations[category][index] = {
            ...updatedRecommendations[category][index],
            applied: false,
            dismissed: true,
          }
          break
        }
      }

      // Save to user's data
      await updateUserData(user.uid, { recommendations: updatedRecommendations })

      // Update local state
      setRecommendations(updatedRecommendations)

      toast({
        title: "Success",
        description: "Recommendation dismissed.",
      })
    } catch (error) {
      console.error("Error dismissing recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to get user data
  const getUserData = async (userId: string) => {
    // This would be implemented in your firebase-service.js
    // For now, we'll assume it returns the user's data including recommendations
    try {
      // This is a placeholder - you would implement this in your firebase-service
      const userData = await fetch(`/api/user/${userId}`).then((res) => res.json())
      return userData
    } catch (error) {
      console.error("Error getting user data:", error)
      return null
    }
  }

  const getConfidenceBadge = (confidence: "High" | "Medium" | "Low") => {
    switch (confidence) {
      case "High":
        return <Badge className="bg-green-500">High Confidence</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500">Medium Confidence</Badge>
      case "Low":
        return <Badge className="bg-red-500">Low Confidence</Badge>
      default:
        return null
    }
  }

  const getActiveRecommendations = () => {
    if (!recommendations) return []
    return (recommendations[activeTab as keyof typeof recommendations] as Recommendation[]) || []
  }

  const formatLastUpdated = () => {
    if (!recommendations?.lastUpdated) return "Never"

    const date = new Date(recommendations.lastUpdated)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Recommendations</CardTitle>
          <CardDescription>Loading your personalized financial insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI-Powered Recommendations</CardTitle>
            <CardDescription>Personalized insights to optimize your finances</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <div>Last updated: {formatLastUpdated()}</div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Next update: {timeUntilNextUpdate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="debt">Debt</TabsTrigger>
          </TabsList>

          {["spending", "subscriptions", "savings", "debt"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {getActiveRecommendations().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recommendations available for this category.</p>
                </div>
              ) : (
                getActiveRecommendations().map((recommendation) => (
                  <Card
                    key={recommendation.id}
                    className={`
                    ${recommendation.applied ? "border-green-500 bg-green-50" : ""}
                    ${recommendation.dismissed ? "border-gray-300 bg-gray-50 opacity-60" : ""}
                  `}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        {getConfidenceBadge(recommendation.confidence)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p>{recommendation.description}</p>
                      <p className="mt-2 font-semibold text-green-600">{recommendation.impact}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      {!recommendation.applied && !recommendation.dismissed && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismissRecommendation(recommendation.id)}
                          >
                            Dismiss
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApplyRecommendation(recommendation.id)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Apply
                          </Button>
                        </>
                      )}
                      {recommendation.applied && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Applied
                        </div>
                      )}
                      {recommendation.dismissed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyRecommendation(recommendation.id)}
                        >
                          Reconsider
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
