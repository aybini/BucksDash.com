"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  Users, 
  Trophy, 
  Target, 
  MessageSquare, 
  Heart, 
  Share2, 
  TrendingUp,
  Crown,
  Gift,
  Zap,
  Star,
  Award,
  PiggyBank,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle2,
  Loader2,
  Plus
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptionDetails } from "@/lib/firebase-service"
import Link from "next/link"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface CommunityPost {
  id: string
  author: string
  avatar: string
  content: string
  likes: number
  comments: number
  timeAgo: string
  badges: string[]
}

interface Challenge {
  id: string
  title: string
  description: string
  reward: string
  participants: number
  timeLeft: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  progress?: number
  maxProgress?: number
  unlocked: boolean
}

// Mock data for demonstration
const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: 'Sarah M.',
    avatar: '👩‍💼',
    content: 'Just completed my first month of budgeting! Saved $300 more than expected by tracking my coffee expenses. Small changes make a big difference! ☕💰',
    likes: 24,
    comments: 8,
    timeAgo: '2 hours ago',
    badges: ['Budget Master', 'Savings Hero']
  },
  {
    id: '2',
    author: 'Mike R.',
    avatar: '👨‍💻',
    content: 'Pro tip: Use the 50/30/20 rule for budgeting. 50% needs, 30% wants, 20% savings. Game changer for my financial health! 📊',
    likes: 45,
    comments: 12,
    timeAgo: '5 hours ago',
    badges: ['Financial Guru', 'Community Helper']
  },
  {
    id: '3',
    author: 'Emma K.',
    avatar: '👩‍🎓',
    content: 'Reached my emergency fund goal of $5,000! Starting my next goal: investing for retirement. Any tips for a beginner? 🎯',
    likes: 67,
    comments: 23,
    timeAgo: '1 day ago',
    badges: ['Goal Crusher', 'Emergency Fund Champion']
  }
]

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'No-Spend Week',
    description: 'Go 7 days without any unnecessary purchases',
    reward: '500 points + Minimalist badge',
    participants: 1247,
    timeLeft: '3 days',
    difficulty: 'Medium',
    category: 'Spending'
  },
  {
    id: '2',
    title: 'Emergency Fund Builder',
    description: 'Save $100 this month for emergencies',
    reward: '1000 points + Safety Net badge',
    participants: 892,
    timeLeft: '12 days',
    difficulty: 'Easy',
    category: 'Savings'
  },
  {
    id: '3',
    title: 'Subscription Audit',
    description: 'Cancel at least 2 unused subscriptions',
    reward: '750 points + Subscription Slayer badge',
    participants: 634,
    timeLeft: '18 days',
    difficulty: 'Easy',
    category: 'Optimization'
  }
]

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first transaction entry',
    icon: '🚀',
    rarity: 'Common',
    unlocked: true
  },
  {
    id: '2',
    title: 'Budget Master',
    description: 'Stay under budget for 30 days',
    icon: '🎯',
    rarity: 'Rare',
    progress: 22,
    maxProgress: 30,
    unlocked: false
  },
  {
    id: '3',
    title: 'Savings Streak',
    description: 'Save money for 7 days in a row',
    icon: '💰',
    rarity: 'Epic',
    progress: 5,
    maxProgress: 7,
    unlocked: false
  },
  {
    id: '4',
    title: 'Community Helper',
    description: 'Help 10 community members',
    icon: '🤝',
    rarity: 'Legendary',
    progress: 3,
    maxProgress: 10,
    unlocked: false
  }
]

export default function CommunityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPremium, setIsPremium] = useState(false) // Set to true for demo purposes
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("feed")
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setIsClient(true)
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    // Generate particles
    const generatedParticles = [...Array(10)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4
    }))
    setParticles(generatedParticles)
    
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return
      try {
        // For demo purposes, we'll assume premium is true
         const subscription = await getSubscriptionDetails(user.uid)
         setIsPremium(subscription && subscription.status === "active")
        setIsPremium(false)
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'Hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-300 dark:border-gray-600'
      case 'Rare': return 'border-blue-400 dark:border-blue-500'
      case 'Epic': return 'border-purple-400 dark:border-purple-500'
      case 'Legendary': return 'border-yellow-400 dark:border-yellow-500'
      default: return 'border-gray-300 dark:border-gray-600'
    }
  }

  if (loading || !isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading community...</span>
              <Users className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
        <div className="relative z-10 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent mb-2">
                Community
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with other users and grow your financial knowledge together
              </p>
            </div>

            <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30">
              <Crown className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Premium Feature</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                The Community feature is only available to premium users. Upgrade your account to connect with other users, participate in challenges, and unlock exclusive badges.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-lg opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 p-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Enhanced Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" asChild className="group bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300">
                  <Link href="/dashboard" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    Dashboard
                  </Link>
                </Button>

                <div className="flex items-center space-x-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium Member
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                    Community
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80">
                    <Users className="w-6 h-6 text-purple-500 animate-pulse" />
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700/50">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Social Hub</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Connect with other users, share your financial journey, and participate in challenges
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">2,847</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Members</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <Zap className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">12</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Challenges</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">8</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Badges Earned</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  <Gift className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">2,450</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Points Earned</div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <TabsList className="grid w-full grid-cols-3 sm:w-auto bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/30 rounded-xl p-1">
                    <TabsTrigger value="feed" className="text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Social Feed
                    </TabsTrigger>
                    <TabsTrigger value="challenges" className="text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300">
                      <Target className="w-4 h-4 mr-2" />
                      Challenges
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300">
                      <Trophy className="w-4 h-4 mr-2" />
                      Achievements
                    </TabsTrigger>
                  </TabsList>

                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>

                {/* Social Feed Tab */}
                <TabsContent value="feed" className="space-y-4">
                  <div className="grid gap-4">
                    {mockPosts.map((post) => (
                      <Card key={post.id} className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{post.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{post.author}</h4>
                                {post.badges.map((badge) => (
                                  <Badge key={badge} variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{post.timeAgo}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 transition-colors">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 transition-colors">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 transition-colors">
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Challenges Tab */}
                <TabsContent value="challenges" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockChallenges.map((challenge) => (
                      <Card key={challenge.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 group">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-gray-900 dark:text-white">{challenge.title}</CardTitle>
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {challenge.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Reward:</span>
                              <span className="font-medium text-purple-600 dark:text-purple-400">{challenge.reward}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Participants:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{challenge.participants.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Time left:</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">{challenge.timeLeft}</span>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-300 group-hover:scale-105">
                              <Target className="w-4 h-4 mr-2" />
                              Join Challenge
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="badges" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockAchievements.map((achievement) => (
                      <Card key={achievement.id} className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-700/30 border-2 ${getRarityColor(achievement.rarity)} hover:shadow-lg transition-all duration-300 ${achievement.unlocked ? 'ring-2 ring-green-400/20' : 'opacity-75'}`}>
                        <CardHeader className="text-center">
                          <div className="text-4xl mb-2">{achievement.icon}</div>
                          <CardTitle className={`text-lg ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {achievement.title}
                          </CardTitle>
                          <div className="flex items-center justify-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                            {achievement.unlocked && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {achievement.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {achievement.progress !== undefined && achievement.maxProgress && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Progress</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {achievement.unlocked && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/30">
                              <div className="flex items-center space-x-2">
                                <Trophy className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                  Achievement Unlocked!
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}