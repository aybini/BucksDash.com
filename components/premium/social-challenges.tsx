"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Users, CheckCircle, Calendar, TrendingUp, AlertCircle, Download, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { updateUserData, getUserTransactions, type Transaction } from "@/lib/firebase-service"

interface Challenge {
  id: string
  title: string
  description: string
  category: "saving" | "budgeting" | "investing" | "debt"
  difficulty: "easy" | "medium" | "hard"
  duration: number // in days
  participants: number
  badge: {
    name: string
    image: string
    color: string
  }
  criteria?: {
    type: string
    threshold: number
    timeframe: number // in days
  }
  startDate?: number
  progress?: number
  completed?: boolean
}

interface UserChallenges {
  active: Challenge[]
  completed: Challenge[]
  badges: string[]
}

// Base challenge templates
const CHALLENGE_TEMPLATES: Challenge[] = [
  {
    id: "challenge-1",
    title: "No-Spend Weekend",
    description:
      "Challenge yourself to spend $0 for an entire weekend. Plan free activities and use what you already have.",
    category: "saving",
    difficulty: "easy",
    duration: 2,
    participants: 1243,
    badge: {
      name: "Weekend Warrior",
      image: "/badges/weekend-warrior.svg",
      color: "bg-blue-500",
    },
    criteria: {
      type: "no_spending",
      threshold: 0,
      timeframe: 2,
    },
  },
  {
    id: "challenge-2",
    title: "Coffee Budget Challenge",
    description: "Cut your coffee shop spending in half for 7 days. Make coffee at home and track your savings.",
    category: "budgeting",
    difficulty: "medium",
    duration: 7,
    participants: 856,
    badge: {
      name: "Coffee Conqueror",
      image: "/badges/coffee-conqueror.svg",
      color: "bg-amber-600",
    },
    criteria: {
      type: "category_reduction",
      threshold: 50, // 50% reduction
      timeframe: 7,
    },
  },
  {
    id: "challenge-3",
    title: "Debt Snowball Sprint",
    description: "Pay an extra $100 toward your smallest debt this month to accelerate your debt-free journey.",
    category: "debt",
    difficulty: "medium",
    duration: 30,
    participants: 542,
    badge: {
      name: "Debt Destroyer",
      image: "/badges/debt-destroyer.svg",
      color: "bg-green-600",
    },
    criteria: {
      type: "debt_payment",
      threshold: 100,
      timeframe: 30,
    },
  },
  {
    id: "challenge-4",
    title: "Investment Starter",
    description: "Set up an automatic investment of at least $50 into an index fund or ETF.",
    category: "investing",
    difficulty: "hard",
    duration: 14,
    participants: 328,
    badge: {
      name: "Investment Initiator",
      image: "/badges/investment-initiator.svg",
      color: "bg-purple-600",
    },
    criteria: {
      type: "investment",
      threshold: 50,
      timeframe: 14,
    },
  },
  {
    id: "challenge-5",
    title: "Meal Prep Master",
    description: "Prepare all your lunches for the work week in advance to save money on eating out.",
    category: "budgeting",
    difficulty: "easy",
    duration: 7,
    participants: 1089,
    badge: {
      name: "Meal Prep Master",
      image: "/badges/meal-prep-master.svg",
      color: "bg-emerald-500",
    },
    criteria: {
      type: "category_reduction",
      threshold: 30, // 30% reduction in dining out
      timeframe: 7,
    },
  },
  {
    id: "challenge-6",
    title: "Monthly Budget Champion",
    description: "Stay under your monthly budget in all categories for a full month.",
    category: "budgeting",
    difficulty: "hard",
    duration: 30,
    participants: 723,
    badge: {
      name: "Budget Champion",
      image: "/badges/budget-champion.svg",
      color: "bg-indigo-600",
    },
    criteria: {
      type: "under_budget",
      threshold: 100, // 100% of categories
      timeframe: 30,
    },
  },
  {
    id: "challenge-7",
    title: "Savings Streak",
    description: "Save at least 10% of your income for 3 consecutive months.",
    category: "saving",
    difficulty: "medium",
    duration: 90,
    participants: 512,
    badge: {
      name: "Savings Streaker",
      image: "/badges/savings-streaker.svg",
      color: "bg-teal-500",
    },
    criteria: {
      type: "savings_rate",
      threshold: 10, // 10% of income
      timeframe: 90,
    },
  },
  {
    id: "challenge-8",
    title: "Subscription Slasher",
    description: "Cancel or reduce at least 2 subscription services this month.",
    category: "budgeting",
    difficulty: "easy",
    duration: 30,
    participants: 1432,
    badge: {
      name: "Subscription Slasher",
      image: "/badges/subscription-slasher.svg",
      color: "bg-red-500",
    },
    criteria: {
      type: "subscription_reduction",
      threshold: 2, // 2 subscriptions
      timeframe: 30,
    },
  },
]

// Helper function to get color hex from Tailwind class
const getColorHex = (colorClass: string): string => {
  const colorMap: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-amber-600": "#d97706",
    "bg-green-600": "#16a34a",
    "bg-purple-600": "#9333ea",
    "bg-emerald-500": "#10b981",
    "bg-indigo-600": "#4f46e5",
    "bg-teal-500": "#14b8a6",
    "bg-red-500": "#ef4444",
    "bg-primary": "#6366f1", // Default primary color
  }

  return colorMap[colorClass] || colorMap["bg-primary"]
}

export function SocialChallenges() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userChallenges, setUserChallenges] = useState<UserChallenges>({
    active: [],
    completed: [],
    badges: [],
  })
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
  const [activeTab, setActiveTab] = useState("available")
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<string>("")
  const [selectedBadgeColor, setSelectedBadgeColor] = useState<string>("bg-primary")
  const [selectedBadgeDescription, setSelectedBadgeDescription] = useState<string>("")
  const [downloadStarted, setDownloadStarted] = useState(false)
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [userBudgets, setUserBudgets] = useState<any>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load user challenges data
      const userData = await getUserData(user.uid)

      // Load user transactions (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const transactions = await getUserTransactions(user.uid, sixMonthsAgo.getTime())
      setUserTransactions(transactions)

      // Load user budgets
      const budgets = userData?.budgets || {}
      setUserBudgets(budgets)

      // If user has no challenges data yet, initialize it
      if (!userData?.challenges) {
        const initialUserChallenges = {
          active: [],
          completed: [],
          badges: [],
        }

        await updateUserData(user.uid, { challenges: initialUserChallenges })
        setUserChallenges(initialUserChallenges)
      } else {
        setUserChallenges(userData.challenges)
      }

      // Generate personalized challenges based on transaction history
      const personalizedChallenges = await generatePersonalizedChallenges(
        transactions,
        userData?.challenges || { active: [], completed: [], badges: [] },
        budgets,
      )

      setAvailableChallenges(personalizedChallenges)
    } catch (error) {
      console.error("Error loading user data:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get user data
  const getUserData = async (userId: string) => {
    // This would be implemented in your firebase-service.js
    try {
      // Fetch user data from your database
      const userData = await fetch(`/api/user/${userId}`).then((res) => res.json())
      return userData
    } catch (error) {
      console.error("Error getting user data:", error)
      return null
    }
  }

  // Generate personalized challenges based on transaction history
  const generatePersonalizedChallenges = async (
    transactions: Transaction[],
    userChallenges: UserChallenges,
    budgets: any,
  ): Promise<Challenge[]> => {
    // Get IDs of challenges the user has already joined or completed
    const userActiveIds = userChallenges.active.map((c) => c.id)
    const userCompletedIds = userChallenges.completed.map((c) => c.id)
    const alreadyJoinedIds = [...userActiveIds, ...userCompletedIds]

    // Analyze transaction history
    const analysis = analyzeTransactions(transactions)

    // Filter and personalize challenges based on transaction analysis
    const personalizedChallenges: Challenge[] = []

    for (const template of CHALLENGE_TEMPLATES) {
      // Skip if user already joined or completed this challenge
      if (alreadyJoinedIds.includes(template.id)) continue

      // Check if this challenge is relevant based on transaction history
      const isRelevant = isChallengeRelevant(template, analysis, budgets)

      if (isRelevant) {
        // Personalize the challenge description and threshold based on user data
        const personalizedChallenge = personalizeChallenge(template, analysis, budgets)
        personalizedChallenges.push(personalizedChallenge)
      }
    }

    return personalizedChallenges
  }

  // Analyze transaction history
  const analyzeTransactions = (transactions: Transaction[]) => {
    // Group transactions by category
    const spendingByCategory: Record<string, number> = {}
    const monthlySpending: Record<string, number> = {}

    // Calculate total income
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    // Process transactions
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        // Add to category spending
        const category = transaction.category || "Uncategorized"
        spendingByCategory[category] = (spendingByCategory[category] || 0) + transaction.amount

        // Add to monthly spending
        const date = new Date(transaction.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + transaction.amount
      }
    })

    // Find potential subscription transactions
    const subscriptionKeywords = [
      "netflix",
      "spotify",
      "hulu",
      "disney",
      "apple",
      "google",
      "amazon prime",
      "gym",
      "membership",
      "subscription",
    ]
    const potentialSubscriptions = transactions.filter((transaction) => {
      const name = (transaction.description || "").toLowerCase()
      return transaction.type === "expense" && subscriptionKeywords.some((keyword) => name.includes(keyword))
    })

    // Calculate average monthly spending
    const months = Object.keys(monthlySpending).length || 1
    const averageMonthlySpending = Object.values(monthlySpending).reduce((sum: any, val: any) => sum + val, 0) / months

    // Calculate savings rate (if we have income data)
    const savingsRate =
      totalIncome > 0
        ? ((totalIncome - Object.values(spendingByCategory).reduce((sum: any, val: any) => sum + val, 0)) /
            totalIncome) *
          100
        : 0

    return {
      spendingByCategory,
      monthlySpending,
      averageMonthlySpending,
      potentialSubscriptions,
      savingsRate,
      totalIncome,
    }
  }

  // Check if a challenge is relevant based on transaction history
  const isChallengeRelevant = (challenge: Challenge, analysis: any, budgets: any): boolean => {
    if (!challenge.criteria) return true

    const { type, threshold } = challenge.criteria

    switch (type) {
      case "no_spending":
        // Always relevant
        return true

      case "category_reduction":
        // Check if user spends in this category
        const categoryKeyword = challenge.title.toLowerCase().includes("coffee")
          ? "coffee"
          : challenge.title.toLowerCase().includes("meal")
            ? "dining"
            : ""

        if (categoryKeyword) {
          // Check if user has spending in this category
          return Object.keys(analysis.spendingByCategory).some(
            (category) => category.toLowerCase().includes(categoryKeyword) && analysis.spendingByCategory[category] > 0,
          )
        }
        return true

      case "debt_payment":
        // Check if user has debt-related transactions
        return Object.keys(analysis.spendingByCategory).some(
          (category) =>
            category.toLowerCase().includes("debt") ||
            category.toLowerCase().includes("loan") ||
            category.toLowerCase().includes("credit"),
        )

      case "investment":
        // Always relevant for investment challenges
        return true

      case "under_budget":
        // Check if user has budgets set up
        return Object.keys(budgets).length > 0

      case "savings_rate":
        // Check if user has income data
        return analysis.totalIncome > 0

      case "subscription_reduction":
        // Check if user has subscription transactions
        return analysis.potentialSubscriptions.length >= threshold

      default:
        return true
    }
  }

  // Personalize challenge based on user data
  const personalizeChallenge = (challenge: Challenge, analysis: any, budgets: any): Challenge => {
    const personalizedChallenge = { ...challenge }

    if (!challenge.criteria) return personalizedChallenge

    const { type, threshold } = challenge.criteria

    switch (type) {
      case "category_reduction":
        // Personalize category reduction challenges
        const categoryKeyword = challenge.title.toLowerCase().includes("coffee")
          ? "coffee"
          : challenge.title.toLowerCase().includes("meal")
            ? "dining"
            : ""

        if (categoryKeyword) {
          // Find relevant category and spending
          const relevantCategory = Object.keys(analysis.spendingByCategory).find((category) =>
            category.toLowerCase().includes(categoryKeyword),
          )

          if (relevantCategory) {
            const currentSpending = analysis.spendingByCategory[relevantCategory]
            const targetReduction = ((currentSpending * threshold) / 100).toFixed(0)

            personalizedChallenge.description = personalizedChallenge.description.replace(
              /Cut your .* spending in half/,
              `Cut your ${relevantCategory} spending by $${targetReduction}`,
            )
          }
        }
        break

      case "debt_payment":
        // Personalize debt payment challenges
        const debtCategories = Object.keys(analysis.spendingByCategory).filter(
          (category) =>
            category.toLowerCase().includes("debt") ||
            category.toLowerCase().includes("loan") ||
            category.toLowerCase().includes("credit"),
        )

        if (debtCategories.length > 0) {
          const smallestDebt = debtCategories.reduce(
            (smallest, category) =>
              analysis.spendingByCategory[category] < analysis.spendingByCategory[smallest] ? category : smallest,
            debtCategories[0],
          )

          personalizedChallenge.description = personalizedChallenge.description.replace(
            /your smallest debt/,
            `your ${smallestDebt}`,
          )
        }
        break

      case "under_budget":
        // Personalize budget challenges
        const budgetCount = Object.keys(budgets).length
        if (budgetCount > 0) {
          personalizedChallenge.description = personalizedChallenge.description.replace(
            /in all categories/,
            `in all ${budgetCount} categories`,
          )
        }
        break

      case "savings_rate":
        // Personalize savings rate challenges
        if (analysis.totalIncome > 0) {
          const currentSavingsRate = analysis.savingsRate.toFixed(1)
          const targetRate = Math.max(10, Math.ceil(analysis.savingsRate) + 5) // Target 5% more than current

          personalizedChallenge.description = personalizedChallenge.description.replace(
            /at least 10% of your income/,
            `at least ${targetRate}% of your income (you're currently at ${currentSavingsRate}%)`,
          )

          personalizedChallenge.criteria!.threshold = targetRate
        }
        break

      case "subscription_reduction":
        // Personalize subscription challenges
        const subCount = analysis.potentialSubscriptions.length
        if (subCount > 0) {
          const targetCount = Math.min(subCount, 2)

          personalizedChallenge.description = personalizedChallenge.description.replace(
            /at least 2 subscription/,
            `at least ${targetCount} subscription`,
          )

          personalizedChallenge.criteria!.threshold = targetCount
        }
        break
    }

    return personalizedChallenge
  }

  const handleJoinChallenge = async (challenge: Challenge) => {
    if (!user) return

    try {
      // Add the challenge to user's active challenges
      const now = Date.now()
      const challengeWithProgress = {
        ...challenge,
        startDate: now,
        progress: 0,
        completed: false,
      }

      const updatedUserChallenges = {
        ...userChallenges,
        active: [...userChallenges.active, challengeWithProgress],
      }

      // Update in database
      await updateUserData(user.uid, { challenges: updatedUserChallenges })

      // Update local state
      setUserChallenges(updatedUserChallenges)
      setAvailableChallenges(availableChallenges.filter((c) => c.id !== challenge.id))

      // Switch to active tab
      setActiveTab("active")

      toast({
        title: "Challenge Joined!",
        description: `You've joined the "${challenge.title}" challenge. Good luck!`,
      })
    } catch (error) {
      console.error("Error joining challenge:", error)
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProgress = async (challengeId: string, newProgress: number) => {
    if (!user) return

    try {
      // Find the challenge
      const challengeIndex = userChallenges.active.findIndex((c) => c.id === challengeId)
      if (challengeIndex === -1) return

      // Update the challenge progress
      const updatedActiveChallenges = [...userChallenges.active]
      updatedActiveChallenges[challengeIndex] = {
        ...updatedActiveChallenges[challengeIndex],
        progress: newProgress,
      }

      // Check if challenge is completed
      if (newProgress >= 100) {
        // Move to completed challenges
        const completedChallenge = {
          ...updatedActiveChallenges[challengeIndex],
          completed: true,
        }

        const updatedUserChallenges = {
          active: updatedActiveChallenges.filter((c) => c.id !== challengeId),
          completed: [...userChallenges.completed, completedChallenge],
          badges: [...userChallenges.badges, completedChallenge.badge.name],
        }

        // Update in database
        await updateUserData(user.uid, { challenges: updatedUserChallenges })

        // Update local state
        setUserChallenges(updatedUserChallenges)

        // Show completion toast
        toast({
          title: "Challenge Completed!",
          description: `Congratulations! You've earned the "${completedChallenge.badge.name}" badge.`,
        })

        // Open share dialog
        setSelectedBadge(completedChallenge.badge.name)
        setSelectedBadgeColor(completedChallenge.badge.color)
        setSelectedBadgeDescription(completedChallenge.description)
        setShareDialogOpen(true)
      } else {
        // Just update progress
        const updatedUserChallenges = {
          ...userChallenges,
          active: updatedActiveChallenges,
        }

        // Update in database
        await updateUserData(user.uid, { challenges: updatedUserChallenges })

        // Update local state
        setUserChallenges(updatedUserChallenges)

        toast({
          title: "Progress Updated",
          description: `Your progress on "${updatedActiveChallenges[challengeIndex].title}" is now ${newProgress}%`,
        })
      }
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareBadge = (badgeName: string, badgeColor = "bg-primary", badgeDescription = "") => {
    setSelectedBadge(badgeName)
    setSelectedBadgeColor(badgeColor)
    setSelectedBadgeDescription(badgeDescription)
    setDownloadStarted(false)
    setShareDialogOpen(true)
  }

  const downloadBadgeImage = async () => {
    if (!canvasRef.current || !user) return

    try {
      setDownloadStarted(true)

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      canvas.width = 1200
      canvas.height = 630

      // Fill background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw badge background
      ctx.fillStyle = "#f8f9fa"
      ctx.beginPath()
      ctx.roundRect(100, 50, canvas.width - 200, canvas.height - 100, 20)
      ctx.fill()

      // Draw badge circle
      const colorHex = getColorHex(selectedBadgeColor)
      ctx.fillStyle = colorHex
      ctx.beginPath()
      ctx.arc(canvas.width / 2, 200, 100, 0, Math.PI * 2)
      ctx.fill()

      // Draw trophy icon
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 8
      ctx.beginPath()

      // Trophy cup
      ctx.moveTo(canvas.width / 2 - 50, 150)
      ctx.lineTo(canvas.width / 2 - 50, 220)
      ctx.lineTo(canvas.width / 2 + 50, 220)
      ctx.lineTo(canvas.width / 2 + 50, 150)

      // Trophy handles
      ctx.moveTo(canvas.width / 2 - 50, 170)
      ctx.lineTo(canvas.width / 2 - 70, 170)
      ctx.arc(canvas.width / 2 - 70, 185, 15, -Math.PI / 2, Math.PI / 2, false)
      ctx.lineTo(canvas.width / 2 - 50, 200)

      ctx.moveTo(canvas.width / 2 + 50, 170)
      ctx.lineTo(canvas.width / 2 + 70, 170)
      ctx.arc(canvas.width / 2 + 70, 185, 15, -Math.PI / 2, Math.PI / 2, true)
      ctx.lineTo(canvas.width / 2 + 50, 200)

      // Trophy base
      ctx.moveTo(canvas.width / 2 - 20, 220)
      ctx.lineTo(canvas.width / 2 - 20, 250)
      ctx.lineTo(canvas.width / 2 + 20, 250)
      ctx.lineTo(canvas.width / 2 + 20, 220)

      ctx.stroke()

      // Draw user name at top left
      ctx.fillStyle = "#333333"
      ctx.font = "bold 32px Arial"
      ctx.textAlign = "left"
      ctx.fillText(user.displayName || user.email || "Rose Finance User", 130, 100)

      // Draw badge name
      ctx.fillStyle = "#333333"
      ctx.font = "bold 48px Arial"
      ctx.textAlign = "center"
      ctx.fillText(selectedBadge, canvas.width / 2, 350)

      // Draw "Achievement Unlocked" text
      ctx.fillStyle = "#666666"
      ctx.font = "32px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Achievement Unlocked", canvas.width / 2, 400)

      // Draw badge description at bottom
      ctx.fillStyle = "#333333"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"

      // Handle multi-line text for description
      const maxWidth = canvas.width - 300
      const lineHeight = 36
      const words = selectedBadgeDescription.split(" ")
      let line = ""
      let y = canvas.height - 150

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y)
          line = words[i] + " "
          y += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, canvas.width / 2, y)

      // Draw Rose Finance logo/text at bottom
      ctx.fillStyle = "#6366f1" // Primary color
      ctx.font = "bold 28px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Rose Finance", canvas.width / 2, canvas.height - 60)

      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${selectedBadge.replace(/\s+/g, "-").toLowerCase()}-badge.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Badge Downloaded",
        description: "Your badge image has been downloaded successfully!",
      })

      setTimeout(() => {
        setDownloadStarted(false)
      }, 2000)
    } catch (error) {
      console.error("Error downloading badge:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading your badge. Please try again.",
        variant: "destructive",
      })
      setDownloadStarted(false)
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge className="bg-green-500">Easy</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "hard":
        return <Badge className="bg-red-500">Hard</Badge>
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "saving":
        return <TrendingUp className="h-4 w-4" />
      case "budgeting":
        return <Calendar className="h-4 w-4" />
      case "investing":
        return <Trophy className="h-4 w-4" />
      case "debt":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Challenges</CardTitle>
          <CardDescription>Loading challenges...</CardDescription>
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
            <CardTitle>Financial Challenges</CardTitle>
            <CardDescription>Join challenges, earn badges, and improve your finances</CardDescription>
          </div>
          <Badge className="bg-primary flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            {userChallenges.badges.length} Badges Earned
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="active">
              Active
              {userChallenges.active.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {userChallenges.active.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {userChallenges.completed.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {userChallenges.completed.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableChallenges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available challenges at the moment. Check back later!</p>
              </div>
            ) : (
              availableChallenges.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getDifficultyBadge(challenge.difficulty)}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {challenge.participants.toLocaleString()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(challenge.category)}
                            {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${challenge.badge.color}`}>
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    <p className="mt-2 text-sm font-medium">Duration: {challenge.duration} days</p>
                    <p className="text-sm font-medium">Badge: {challenge.badge.name}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={() => handleJoinChallenge(challenge)} className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Join Challenge
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {userChallenges.active.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't joined any challenges yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("available")}>
                  Browse Challenges
                </Button>
              </div>
            ) : (
              userChallenges.active.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getDifficultyBadge(challenge.difficulty)}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {challenge.participants.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${challenge.badge.color}`}>
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    <div className="mt-4 flex justify-between text-sm">
                      <span>Started: {new Date(challenge.startDate!).toLocaleDateString()}</span>
                      <span>{challenge.duration} days remaining</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedChallenge(challenge)
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateProgress(challenge.id, Math.min(100, (challenge.progress || 0) + 25))
                        }
                      >
                        Update Progress
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleUpdateProgress(challenge.id, 100)}>
                        Complete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {userChallenges.completed.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You haven't completed any challenges yet.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("available")}>
                  Browse Challenges
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userChallenges.badges.map((badgeName, index) => {
                    const challenge = userChallenges.completed.find((c) => c.badge.name === badgeName)
                    return (
                      <Card
                        key={index}
                        className="flex flex-col items-center p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleShareBadge(badgeName, challenge?.badge.color, challenge?.description)}
                      >
                        <div className={`p-4 rounded-full ${challenge?.badge.color || "bg-primary"} mb-2`}>
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <p className="font-medium text-center">{badgeName}</p>
                        <Button variant="ghost" size="sm" className="mt-2 flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Download Badge
                        </Button>
                      </Card>
                    )
                  })}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-4">Completed Challenges</h3>
                  {userChallenges.completed.map((challenge) => (
                    <Card key={challenge.id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <Badge className="bg-green-500">Completed</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`p-2 rounded-full ${challenge.badge.color}`}>
                            <Trophy className="h-4 w-4 text-white" />
                          </div>
                          <span>Earned: {challenge.badge.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Hidden canvas for badge image generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} width="1200" height="630" />

      {/* Badge Download Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Your Badge</DialogTitle>
            <DialogDescription>Download your "{selectedBadge}" badge to share on social media!</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            {/* Badge preview */}
            <div className="w-full max-w-sm bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="text-sm text-left w-full mb-2 text-gray-500">
                  {user?.displayName || user?.email || "Rose Finance User"}
                </div>
                <div className={`${selectedBadgeColor} p-6 rounded-full mb-2`}>
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-lg">{selectedBadge}</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">Achievement Unlocked</p>
                <div className="mt-4 text-xs text-center text-gray-600 max-w-[250px]">{selectedBadgeDescription}</div>
                <div className="mt-4 text-xs text-primary font-semibold">Rose Finance</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 text-center">
              This is how your badge will appear when downloaded
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={downloadBadgeImage}
              disabled={downloadStarted}
            >
              {downloadStarted ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {downloadStarted ? "Downloaded!" : "Download Badge Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
