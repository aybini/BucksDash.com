"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Trophy, 
  Share2, 
  Users, 
  TrendingUp, 
  Calendar, 
  Star, 
  Loader2, 
  Target, 
  Fire, 
  Zap, 
  Crown,
  Medal,
  Gift,
  DollarSign,
  Timer,
  Sparkles
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-init"

// Enhanced mock data with more variety and visual appeal
const mockChallenges = [
  {
    id: "challenge-1",
    title: "No-Spend Weekend Challenge",
    description: "Spend $0 for an entire weekend and discover creative free activities!",
    participants: 1245,
    duration: "2 days",
    difficulty: "Medium",
    category: "Spending Habits",
    progress: 0,
    joined: false,
    reward: "150 points + Minimalist badge",
    icon: "🛑",
    color: "from-red-400 to-red-600",
    bgColor: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
    leaderboard: [
      { name: "Alex", avatar: "/placeholder.svg?height=32&width=32", progress: 85 },
      { name: "Jamie", avatar: "/placeholder.svg?height=32&width=32", progress: 72 },
      { name: "Taylor", avatar: "/placeholder.svg?height=32&width=32", progress: 68 },
    ],
  },
  {
    id: "challenge-2",
    title: "Coffee Budget Challenge",
    description: "Cut your coffee spending in half for 2 weeks and find new energy sources!",
    participants: 876,
    duration: "14 days",
    difficulty: "Easy",
    category: "Specific Expense",
    progress: 0,
    joined: false,
    reward: "100 points + Coffee Saver badge",
    icon: "☕",
    color: "from-amber-400 to-amber-600",
    bgColor: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
    leaderboard: [
      { name: "Morgan", avatar: "/placeholder.svg?height=32&width=32", progress: 92 },
      { name: "Casey", avatar: "/placeholder.svg?height=32&width=32", progress: 88 },
      { name: "You", avatar: "/placeholder.svg?height=32&width=32", progress: 35 },
    ],
  },
  {
    id: "challenge-3",
    title: "30-Day Savings Sprint",
    description: "Save an extra $5 each day for 30 days. Watch your savings grow exponentially!",
    participants: 2134,
    duration: "30 days",
    difficulty: "Hard",
    category: "Savings",
    progress: 0,
    joined: false,
    reward: "300 points + Savings Champion badge",
    icon: "💰",
    color: "from-green-400 to-green-600",
    bgColor: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
    leaderboard: [
      { name: "Riley", avatar: "/placeholder.svg?height=32&width=32", progress: 95 },
      { name: "Jordan", avatar: "/placeholder.svg?height=32&width=32", progress: 90 },
      { name: "Quinn", avatar: "/placeholder.svg?height=32&width=32", progress: 87 },
    ],
  },
  {
    id: "challenge-4",
    title: "Subscription Audit Sprint",
    description: "Cancel at least 3 unused subscriptions and reclaim your money!",
    participants: 634,
    duration: "7 days",
    difficulty: "Easy",
    category: "Optimization",
    progress: 0,
    joined: true,
    progress: 67,
    reward: "200 points + Subscription Slayer badge",
    icon: "✂️",
    color: "from-purple-400 to-purple-600",
    bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
    leaderboard: [
      { name: "Sam", avatar: "/placeholder.svg?height=32&width=32", progress: 100 },
      { name: "You", avatar: "/placeholder.svg?height=32&width=32", progress: 67 },
      { name: "Blake", avatar: "/placeholder.svg?height=32&width=32", progress: 55 },
    ],
  },
]

export function MoneyChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [personalGoal, setPersonalGoal] = useState("")
  const [shareMessage, setShareMessage] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchChallenges()
    }
  }, [user])

  const fetchChallenges = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      // Check if user has challenges stored
      const userChallengesRef = doc(db, "users", user.uid, "social", "challenges")
      const docSnap = await getDoc(userChallengesRef)

      if (docSnap.exists()) {
        // User has existing challenges
        const userData = docSnap.data()
        setChallenges(userData.challenges || mockChallenges)
      } else {
        // First time - initialize with mock data and store in Firestore
        await setDoc(userChallengesRef, {
          challenges: mockChallenges,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setChallenges(mockChallenges)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
      // Fall back to mock data if there's an error
      setChallenges(mockChallenges)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = (challenge: any) => {
    setSelectedChallenge(challenge)
    setPersonalGoal("")
    setIsJoinDialogOpen(true)
  }

  const handleShareProgress = (challenge: any) => {
    setSelectedChallenge(challenge)
    setShareMessage("")
    setIsShareDialogOpen(true)
  }

  const handleViewLeaderboard = (challenge: any) => {
    setSelectedChallenge(challenge)
    setIsLeaderboardOpen(true)
  }

  const confirmJoinChallenge = async () => {
    if (!user?.uid || !selectedChallenge) return

    try {
      // Update the challenge in state
      const updatedChallenges = challenges.map((challenge) => {
        if (challenge.id === selectedChallenge.id) {
          return {
            ...challenge,
            joined: true,
            progress: 0,
            joinedAt: new Date().toISOString(),
            personalGoal: personalGoal,
          }
        }
        return challenge
      })

      setChallenges(updatedChallenges)

      // Update in Firestore
      const userChallengesRef = doc(db, "users", user.uid, "social", "challenges")
      await updateDoc(userChallengesRef, {
        challenges: updatedChallenges,
        updatedAt: serverTimestamp(),
      })

      // Log the action in user's activity
      await addDoc(collection(db, "users", user.uid, "activity"), {
        type: "challenge",
        action: "joined",
        challengeId: selectedChallenge.id,
        challengeTitle: selectedChallenge.title,
        personalGoal: personalGoal,
        timestamp: serverTimestamp(),
      })

      toast({
        title: "Challenge Joined! 🎯",
        description: `You've joined the ${selectedChallenge.title}. Good luck!`,
      })
      setIsJoinDialogOpen(false)
    } catch (error) {
      console.error("Error joining challenge:", error)
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const confirmShareProgress = async () => {
    if (!user?.uid || !selectedChallenge) return

    try {
      // Log the share action in user's activity
      await addDoc(collection(db, "users", user.uid, "activity"), {
        type: "challenge",
        action: "shared",
        challengeId: selectedChallenge.id,
        challengeTitle: selectedChallenge.title,
        progress: selectedChallenge.progress,
        message: shareMessage,
        timestamp: serverTimestamp(),
      })

      toast({
        title: "Progress Shared! 🚀",
        description: "Your progress has been shared with the community.",
      })
      setIsShareDialogOpen(false)
    } catch (error) {
      console.error("Error sharing progress:", error)
      toast({
        title: "Error",
        description: "Failed to share progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300'
      case 'Hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return <Star className="w-3 h-3" />
      case 'Medium': return <Target className="w-3 h-3" />
      case 'Hard': return <Fire className="w-3 h-3" />
      default: return <Zap className="w-3 h-3" />
    }
  }

  // Calculate stats
  const joinedChallenges = challenges.filter(c => c.joined).length
  const totalParticipants = challenges.reduce((sum, c) => sum + c.participants, 0)
  const averageProgress = joinedChallenges > 0 
    ? Math.round(challenges.filter(c => c.joined).reduce((sum, c) => sum + (c.progress || 0), 0) / joinedChallenges)
    : 0

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-white/20 shadow-xl">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Money-Saving Challenges</h3>
              <p className="text-gray-600 dark:text-gray-400">Loading exciting challenges...</p>
            </div>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{challenges.length}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Available</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">{joinedChallenges}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Joined</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{totalParticipants.toLocaleString()}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Participants</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/30">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{averageProgress}%</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Avg Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Challenges Card */}
      <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-b border-gray-200/50 dark:border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  Money-Saving Challenges
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Join trending challenges and compete with the community
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Social Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className={`relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 group hover:scale-[1.02] bg-gradient-to-r ${challenge.bgColor} border-gray-200/50 dark:border-gray-700/50`}>
              {/* Challenge joined indicator */}
              {challenge.joined && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500 text-white animate-pulse">
                    <Crown className="w-3 h-3 mr-1" />
                    Joined
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{challenge.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                        {challenge.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                        {challenge.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} border`}>
                    {getDifficultyIcon(challenge.difficulty)}
                    <span className="ml-1">{challenge.difficulty}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                {/* Challenge Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">{challenge.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                    <Timer className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{challenge.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">{challenge.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                    <Gift className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">{challenge.reward}</span>
                  </div>
                </div>

                {/* Progress Bar for Joined Challenges */}
                {challenge.joined && (
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-3" />
                    <div className="flex items-center space-x-2 mt-2">
                      <Medal className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {challenge.progress >= 100 ? "Challenge Completed! 🎉" : 
                         challenge.progress >= 75 ? "Almost there! Keep going!" :
                         challenge.progress >= 50 ? "Halfway mark reached!" :
                         challenge.progress >= 25 ? "Great start!" : "Just getting started"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0 flex gap-3">
                {!challenge.joined ? (
                  <Button
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl"
                    onClick={() => handleJoinChallenge(challenge)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Join Challenge
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareProgress(challenge)}
                      className="bg-white/80 dark:bg-white/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:border-blue-400 transition-all duration-300 group-hover:scale-105"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLeaderboard(challenge)}
                      className="bg-white/80 dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all duration-300 group-hover:scale-105"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Leaderboard
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Enhanced Join Challenge Dialog */}
      {selectedChallenge && (
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className="text-2xl">{selectedChallenge.icon}</div>
                <span className="bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  Join {selectedChallenge.title}
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Challenge yourself and compete with the community to build better money habits!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className={`rounded-xl border-2 p-4 bg-gradient-to-r ${selectedChallenge.bgColor} border-yellow-200/50 dark:border-yellow-700/30`}>
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Challenge Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{selectedChallenge.participants.toLocaleString()} participants</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-green-500" />
                    <span>{selectedChallenge.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <span>{selectedChallenge.reward}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                      {selectedChallenge.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Set a personal goal for this challenge:
                </h4>
                <Textarea
                  placeholder="e.g., I want to save $50 by finding free weekend activities instead of spending..."
                  value={personalGoal}
                  onChange={(e) => setPersonalGoal(e.target.value)}
                  className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 focus:border-yellow-400 dark:focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>

            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsJoinDialogOpen(false)}
                className="bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmJoinChallenge}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                Join Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Share Progress Dialog */}
      {selectedChallenge && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-blue-500" />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Share Your Progress
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Inspire others by sharing your journey with the {selectedChallenge.title}!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className={`rounded-xl border-2 p-6 bg-gradient-to-r ${selectedChallenge.bgColor} border-blue-200/50 dark:border-blue-700/30`}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-4xl">{selectedChallenge.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">{selectedChallenge.title}</h3>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedChallenge.progress}%</span>
                    </div>
                    <Progress value={selectedChallenge.progress} className="w-full h-3" />
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 w-full">
                    <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                      🚀 I'm {selectedChallenge.progress}% through the {selectedChallenge.title}! 
                      Join me in building better financial habits together.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  Add a personal message:
                </h4>
                <Textarea
                  placeholder="Share your experience, tips, or motivation..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsShareDialogOpen(false)}
                className="bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmShareProgress}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Leaderboard Dialog */}
      {selectedChallenge && (
        <Dialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {selectedChallenge.title} Leaderboard
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                See how you compare to other participants in this challenge
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className={`rounded-xl p-4 bg-gradient-to-r ${selectedChallenge.bgColor} border border-purple-200/50 dark:border-purple-700/30`}>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="text-3xl">{selectedChallenge.icon}</div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">{selectedChallenge.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChallenge.participants.toLocaleString()} participants</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedChallenge.leaderboard.map((user: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                    user.name === "You" 
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-600" 
                      : "bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white" :
                        index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white" :
                        index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white" :
                        "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center">
                          {user.name}
                          {user.name === "You" && <Crown className="w-4 h-4 ml-2 text-blue-500" />}
                          {index === 0 && <Trophy className="w-4 h-4 ml-2 text-yellow-500" />}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Progress: {user.progress}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={user.progress} className="w-24" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{user.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedChallenge.joined && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/30">
                  <div className="flex items-center space-x-2">
                    <Medal className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Keep going! You're doing great in this challenge.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={() => setIsLeaderboardOpen(false)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}