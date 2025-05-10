"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, Trophy, Share2 } from "lucide-react"
import { ChallengeForm } from "@/components/forms/challenge-form"
import { ShareProgressForm } from "@/components/forms/share-progress-form"

export function FinancialChallenges() {
  const [isChallengeFormOpen, setIsChallengeFormOpen] = useState(false)
  const [isShareFormOpen, setIsShareFormOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)

  const handleStartChallenge = (challenge: any) => {
    setSelectedChallenge(challenge)
    setIsChallengeFormOpen(true)
  }

  const handleShareProgress = (challenge: any) => {
    setSelectedChallenge(challenge)
    setIsShareFormOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Financial Challenges</CardTitle>
              <CardDescription>Join trending money-saving challenges</CardDescription>
            </div>
            <Badge className="bg-pink-500">
              <Star className="mr-1 h-3 w-3" /> TikTok Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" /> No-Spend Weekend
                </h4>
                <Badge variant="outline">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Challenge yourself to spend $0 this weekend. 2 days left!
              </p>
              <Progress value={60} className="mb-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">3/5 weekends completed</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleShareProgress({
                      title: "No-Spend Weekend",
                      progress: 60,
                    })
                  }
                >
                  <Share2 className="h-3 w-3 mr-1" /> Share Progress
                </Button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-purple-500" /> 30-Day Savings Sprint
                </h4>
                <Badge variant="outline">Join</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Save an extra $5 each day for 30 days. 1,245 people participating!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  handleStartChallenge({
                    title: "30-Day Savings Sprint",
                    description:
                      "Save an extra $5 each day for 30 days. Track your progress and see your savings grow!",
                  })
                }
              >
                Start Challenge
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-green-500" /> Coffee Budget Challenge
                </h4>
                <Badge variant="outline">Join</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Cut your coffee spending in half for 2 weeks. 876 people participating!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  handleStartChallenge({
                    title: "Coffee Budget Challenge",
                    description:
                      "Cut your coffee spending in half for 2 weeks. Make coffee at home and track your savings!",
                  })
                }
              >
                Start Challenge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedChallenge && (
        <>
          <ChallengeForm
            isOpen={isChallengeFormOpen}
            onClose={() => {
              setIsChallengeFormOpen(false)
              setSelectedChallenge(null)
            }}
            challenge={selectedChallenge}
          />
          <ShareProgressForm
            isOpen={isShareFormOpen}
            onClose={() => {
              setIsShareFormOpen(false)
              setSelectedChallenge(null)
            }}
            challenge={selectedChallenge}
          />
        </>
      )}
    </>
  )
}
