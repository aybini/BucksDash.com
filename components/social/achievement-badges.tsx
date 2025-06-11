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
import { Award, Share2, Lock, CheckCircle, TrendingUp, PiggyBank, CreditCard, Zap, Sparkles, Crown, Target, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Enhanced mock data with more variety and styling
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
      points: 100,
      color: "from-green-400 to-green-600"
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
      points: 150,
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 3,
      name: "Debt Destroyer",
      description: "Paid off your first debt account completely",
      icon: <CreditCard className="h-8 w-8 text-purple-500" />,
      category: "Debt",
      earnedDate: "2023-11-20",
      rarity: "Rare",
      sharedCount: 5,
      points: 300,
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 6,
      name: "Community Helper",
      description: "Helped 5 community members with financial advice",
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      category: "Community",
      earnedDate: "2023-12-01",
      rarity: "Epic",
      sharedCount: 12,
      points: 500,
      color: "from-yellow-400 to-yellow-600"
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
      points: 250,
      rarity: "Rare"
    },
    {
      id: 5,
      name: "Consistency Champion",
      description: "Log into the app for 30 consecutive days",
      icon: <Zap className="h-8 w-8 text-gray-400" />,
      category: "Engagement",
      progress: 65,
      requirement: "10 more days to go!",
      points: 200,
      rarity: "Common"
    },
    {
      id: 7,
      name: "Financial Guru",
      description: "Achieve a financial health score of 90+",
      icon: <Crown className="h-8 w-8 text-gray-400" />,
      category: "Achievement",
      progress: 75,
      requirement: "Current score: 75/100",
      points: 1000,
      rarity: "Legendary"
    },
  ],
}

export function AchievementBadges() {
  const [selectedBadge, setSelectedBadge] = useState<any>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("earned")
  const { toast } = useToast()

  const handleShareBadge = (badge: any) => {
    setSelectedBadge(badge)
    setIsShareDialogOpen(true)
  }

  const confirmShareBadge = () => {
    toast({
      title: "Badge Shared! ✨",
      description: `You've shared your ${selectedBadge.name} badge with the community.`,
    })
    setIsShareDialogOpen(false)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300'
      case 'Rare': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300'
      case 'Epic': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300'
      case 'Legendary': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-300'
    }
  }

  const getBadgeGlow = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'shadow-gray-200/50'
      case 'Rare': return 'shadow-blue-400/30'
      case 'Epic': return 'shadow-purple-400/30'
      case 'Legendary': return 'shadow-yellow-400/30'
      default: return 'shadow-gray-200/50'
    }
  }

  const totalPoints = badges.earned.reduce((sum, badge) => sum + badge.points, 0)

  return (
    <>
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{badges.earned.length}</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Badges Earned</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{badges.upcoming.length}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">In Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-700/30">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{totalPoints}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Total Points</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/30">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                {badges.earned.reduce((sum, badge) => sum + badge.sharedCount, 0)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Times Shared</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-gray-200/50 dark:border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Award className="h-6 w-6 text-purple-500" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping" />
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Achievement Badges
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Earn badges for hitting financial milestones and helping others
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Social Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/30">
              <TabsTrigger value="earned" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300">
                <Award className="w-4 h-4 mr-2" />
                Earned ({badges.earned.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300">
                <Target className="w-4 h-4 mr-2" />
                In Progress ({badges.upcoming.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="earned" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.earned.map((badge) => (
                  <Card key={badge.id} className={`relative overflow-hidden border-2 ${getRarityColor(badge.rarity)} shadow-lg ${getBadgeGlow(badge.rarity)} hover:shadow-xl transition-all duration-300 group hover:scale-105`}>
                    {/* Rarity glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${badge.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <CardContent className="p-6 flex flex-col items-center text-center relative z-10">
                      {/* Badge Icon with Glow */}
                      <div className={`h-20 w-20 rounded-full bg-gradient-to-r ${badge.color} p-0.5 mb-4 shadow-lg ${getBadgeGlow(badge.rarity)} group-hover:shadow-xl transition-all duration-300`}>
                        <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                          {badge.icon}
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{badge.name}</h3>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {badge.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{badge.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{badge.points} pts</span>
                        </div>
                        <div>
                          Earned {new Date(badge.earnedDate).toLocaleDateString()}
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-white/80 dark:bg-white/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all duration-300 group-hover:scale-105" 
                        onClick={() => handleShareBadge(badge)}
                      >
                        <Share2 className="h-3 w-3 mr-2" />
                        Share {badge.sharedCount > 0 ? `(${badge.sharedCount})` : ""}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.upcoming.map((badge) => (
                  <Card key={badge.id} className="overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:shadow-lg transition-all duration-300 group hover:scale-105">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      {/* Locked Badge Icon */}
                      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 relative shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {badge.icon}
                        <div className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full p-1">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-2">{badge.name}</h3>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {badge.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{badge.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{badge.points} pts</span>
                        </div>
                      </div>

                      <div className="w-full space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.requirement}</p>
                        
                        {badge.progress > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${badge.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Share Badge Dialog */}
      {selectedBadge && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Share Your Achievement
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Let the community celebrate your financial milestone!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-xl border-2 border-purple-200/50 dark:border-purple-700/30 p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="flex flex-col items-center space-y-4">
                  {/* Badge Preview */}
                  <div className={`h-24 w-24 rounded-full bg-gradient-to-r ${selectedBadge.color} p-0.5 shadow-lg`}>
                    <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      {selectedBadge.icon}
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBadge.name}</h3>
                    <div className="flex items-center justify-center space-x-2">
                      <Badge className={getRarityColor(selectedBadge.rarity)}>
                        {selectedBadge.rarity}
                      </Badge>
                      <Badge variant="outline">{selectedBadge.category}</Badge>
                    </div>
                    <p className="text-center text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                      🎉 I just earned the <strong>{selectedBadge.name}</strong> badge! Join me on my financial journey and start building better money habits together.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>{selectedBadge.rarity} Badge</span>
                  <span>•</span>
                  <Star className="h-4 w-4" />
                  <span>{selectedBadge.points} Points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="h-4 w-4" />
                  <span>Shared {selectedBadge.sharedCount} times</span>
                </div>
              </div>
            </div>

            <DialogFooter className="space-x-2">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" onClick={confirmShareBadge}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Badge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}