"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Share2, Lock, CheckCircle, TrendingUp, PiggyBank, CreditCard, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data - in a real app, this would come from your backend
const badges = {
  earned: [
    {
      id: 1,
      name: "Budget Master",
      description: "Created your first budget and stuck to it for a month",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      category: "Budgeting",
      earnedDate: "2023-09-15",
      rarity: "Common",
      sharedCount: 3,
    },
    {
      id: 2,
      name: "Savings Starter",
      description: "Saved your first $500 in emergency funds",
      icon: <PiggyBank className="h-8 w-8 text-blue-500" />,
      category: "Savings",
      earnedDate: "2023-10-02",
      rarity: "Common",
      sharedCount: 0,
    },
    {
      id: 3,
      name: "Debt Destroyer",
      description: "Paid off your first debt account completely",
      icon: <CreditCard className="h-8 w-8 text-purple-500" />,
      category: "Debt",
      earnedDate: "2023-11-20",
      rarity: "Uncommon",
      sharedCount: 5,
    },
  ],
  upcoming: [
    {
      id: 4,
      name: "Investing Initiate",
      description: "Make your first investment contribution",
      icon: <TrendingUp className="h-8 w-8 text-gray-400" />,
      category: "Investing",
      progress: 0,
      requirement: "Contribute to an investment account",
    },
    {
      id: 5,
      name: "Consistency Champion",
      description: "Log into the app for 30 consecutive days",
      icon: <Zap className="h-8 w-8 text-gray-400" />,
      category: "Engagement",
      progress: 65,
      requirement: "10 more days to go!",
    },
  ],
}

export function AchievementBadges() {
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("earned")
  const { toast } = useToast()

  const handleShareBadge = (badge) => {
    setSelectedBadge(badge)
    setIsShareDialogOpen(true)
  }

  const confirmShareBadge = () => {
    toast({
      title: "Badge Shared!",
      description: `You've shared your ${selectedBadge.name} badge with your friends.`,
    })
    setIsShareDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-amber-500" />
                Achievement Badges
              </CardTitle>
              <CardDescription>Earn badges for hitting financial milestones</CardDescription>
            </div>
            <Badge className="bg-pink-500">Social Feature</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="earned" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="earned">Earned ({badges.earned.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({badges.upcoming.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="earned" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.earned.map((badge) => (
                  <Card key={badge.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3 mt-3">
                        {badge.icon}
                      </div>
                      <h3 className="font-medium">{badge.name}</h3>
                      <Badge variant="outline" className="my-1">
                        {badge.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                      </p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleShareBadge(badge)}>
                        <Share2 className="h-3 w-3 mr-1" />
                        Share {badge.sharedCount > 0 ? `(${badge.sharedCount})` : ""}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.upcoming.map((badge) => (
                  <Card key={badge.id} className="overflow-hidden bg-muted/30">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3 mt-3 relative">
                        {badge.icon}
                        <Lock className="h-4 w-4 absolute bottom-0 right-0 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium">{badge.name}</h3>
                      <Badge variant="outline" className="my-1">
                        {badge.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                      <p className="text-xs font-medium mb-3">{badge.requirement}</p>
                      {badge.progress > 0 && (
                        <div className="w-full bg-muted rounded-full h-2 mb-3">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Share Badge Dialog */}
      {selectedBadge && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Achievement</DialogTitle>
              <DialogDescription>Let your friends know about your financial milestone!</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    {selectedBadge.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{selectedBadge.name}</h3>
                  <Badge variant="outline">{selectedBadge.category}</Badge>
                  <p className="text-center text-sm">
                    I just earned the {selectedBadge.name} badge on Rose Finance! Join me on my financial journey.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Award className="h-4 w-4 mr-1" />
                  {selectedBadge.rarity} Badge
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4 mr-1" />
                  Shared {selectedBadge.sharedCount} times
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={confirmShareBadge}>
                Share Badge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
