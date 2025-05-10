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
import { Trophy, Share2, Users, TrendingUp, Calendar, Star, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-init"

// Mock data structure - in a real app, this would come from your backend
const mockChallenges = [
  {
    id: "challenge-1",
    title: "No-Spend Weekend Challenge",
    description: "Spend $0 for an entire weekend and share what you learned!",
    participants: 1245,
    duration: "2 days",
    difficulty: "Medium",
    category: "Spending Habits",
    progress: 0,
    joined: false,
    leaderboard: [
      { name: "Alex", avatar: "/placeholder.svg?height=32&width=32", progress: 85 },
      { name: "Jamie", avatar: "/placeholder.svg?height=32&width=32", progress: 72 },
      { name: "Taylor", avatar: "/placeholder.svg?height=32&width=32", progress: 68 },
    ],
  },
  {
    id: "challenge-2",
    title: "Coffee Budget Challenge",
    description: "Cut your coffee spending in half for 2 weeks.",
    participants: 876,
    duration: "14 days",
    difficulty: "Easy",
    category: "Specific Expense",
    progress: 0,
    joined: false,
    leaderboard: [
      { name: "Morgan", avatar: "/placeholder.svg?height=32&width=32", progress: 92 },
      { name: "Casey", avatar: "/placeholder.svg?height=32&width=32", progress: 88 },
      { name: "You", avatar: "/placeholder.svg?height=32&width=32", progress: 35 },
    ],
  },
  {
    id: "challenge-3",
    title: "30-Day Savings Sprint",
    description: "Save an extra $5 each day for 30 days. Watch your savings grow!",
    participants: 2134,
    duration: "30 days",
    difficulty: "Hard",
    category: "Savings",
    progress: 0,
    joined: false,
    leaderboard: [
      { name: "Riley", avatar: "/placeholder.svg?height=32&width=32", progress: 95 },
      { name: "Jordan", avatar: "/placeholder.svg?height=32&width=32", progress: 90 },
      { name: "Quinn", avatar: "/placeholder.svg?height=32&width=32", progress: 87 },
    ],
  },
]

export function MoneyChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [challenges, setChallenges] = useState([])
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

  const handleJoinChallenge = (challenge) => {
    setSelectedChallenge(challenge)
    setPersonalGoal("")
    setIsJoinDialogOpen(true)
  }

  const handleShareProgress = (challenge) => {
    setSelectedChallenge(challenge)
    setShareMessage("")
    setIsShareDialogOpen(true)
  }

  const handleViewLeaderboard = (challenge) => {
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
        title: "Challenge Joined!",
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
        title: "Progress Shared!",
        description: "Your progress has been shared with your friends.",
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Money-Saving Challenges</CardTitle>
          <CardDescription>Loading challenges...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                Money-Saving Challenges
              </CardTitle>
              <CardDescription>Join trending challenges and compete with friends</CardDescription>
            </div>
            <Badge className="bg-pink-500">Social Feature</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    {challenge.title}
                  </CardTitle>
                  <Badge variant="outline">{challenge.difficulty}</Badge>
                </div>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 pb-2">
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{challenge.participants} joined</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{challenge.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{challenge.category}</span>
                  </div>
                </div>

                {challenge.joined && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span>Your progress</span>
                      <span className="font-medium">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-2 flex gap-2">
                {!challenge.joined ? (
                  <Button
                    className="flex-1 bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
                    onClick={() => handleJoinChallenge(challenge)}
                  >
                    Join Challenge
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareProgress(challenge)}
                      className="touch-manipulation active:scale-95"
                    >
                      <Share2 className="h-3 w-3 mr-1" /> Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLeaderboard(challenge)}
                      className="touch-manipulation active:scale-95"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" /> Leaderboard
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Join Challenge Dialog */}
      {selectedChallenge && (
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join {selectedChallenge.title}</DialogTitle>
              <DialogDescription>Challenge yourself and compete with friends to save money!</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                <p>
                  By joining this challenge, you commit to following the rules and tracking your progress. You can share
                  your progress with friends and earn badges for completing milestones.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Set a personal goal for this challenge:</h4>
                <Textarea
                  placeholder="I want to save $X by doing Y..."
                  value={personalGoal}
                  onChange={(e) => setPersonalGoal(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsJoinDialogOpen(false)}
                className="touch-manipulation active:scale-95"
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
                onClick={confirmJoinChallenge}
              >
                Join Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Progress Dialog */}
      {selectedChallenge && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Progress</DialogTitle>
              <DialogDescription>
                Let your friends know how you're doing with the {selectedChallenge.title}!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4">
                <div className="flex flex-col items-center space-y-3">
                  <Trophy className="h-12 w-12 text-amber-500" />
                  <h3 className="text-lg font-semibold">{selectedChallenge.title}</h3>
                  <Progress value={selectedChallenge.progress} className="w-full" />
                  <p className="text-center text-sm">
                    I'm {selectedChallenge.progress}% through this challenge! Join me on Rose Finance to start your own
                    money-saving journey.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Add a personal message:</h4>
                <Textarea
                  placeholder="Share your experience so far..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsShareDialogOpen(false)}
                className="touch-manipulation active:scale-95"
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 touch-manipulation active:scale-95"
                onClick={confirmShareProgress}
              >
                Share Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Leaderboard Dialog */}
      {selectedChallenge && (
        <Dialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedChallenge.title} Leaderboard</DialogTitle>
              <DialogDescription>See how you compare to other participants</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedChallenge.leaderboard.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Progress: {user.progress}%</p>
                    </div>
                  </div>
                  <Progress value={user.progress} className="w-24" />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button onClick={() => setIsLeaderboardOpen(false)} className="touch-manipulation active:scale-95">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
