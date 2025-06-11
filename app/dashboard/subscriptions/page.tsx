"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { 
  ArrowLeft, 
  CreditCard, 
  Repeat, 
  Shield, 
  Sparkles, 
  Target, 
  Zap, 
  Activity, 
  Loader2,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  Search,
  Bell,
  PieChart
} from "lucide-react"
import { SubscriptionsList } from "@/components/subscriptions/subscriptions-list"
import { SubscriptionForm } from "@/components/forms/subscription-form" // Import the form component

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface Subscription {
  id: string
  name: string
  amount: number
  category: string
  billingCycle: string
  nextBillingDate: any
  status?: string
  createdAt: any
  updatedAt: any
}

export default function SubscriptionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  // Add form state
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Fetch real subscription data from Firebase
  const fetchSubscriptions = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const subscriptionsRef = collection(db, `users/${user.uid}/subscriptions`)
      const q = query(subscriptionsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)

      const fetchedSubscriptions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscription[]

      setSubscriptions(fetchedSubscriptions)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh data when subscriptions change
  const refreshData = () => {
    if (user) {
      fetchSubscriptions()
    }
  }

  // Handle form success
  const handleSubscriptionSuccess = () => {
    fetchSubscriptions()
    setIsFormOpen(false)
  }

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(8)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4
    }))
    setParticles(generatedParticles)
    
    // Trigger entrance animation and fetch data
    setTimeout(() => setIsVisible(true), 100)

    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  // Remove auto-refresh - only refresh on user actions
  // useEffect(() => {
  //   if (!user) return

  //   const interval = setInterval(() => {
  //     fetchSubscriptions()
  //   }, 300000) // 5 minutes instead of 30 seconds

  //   return () => clearInterval(interval)
  // }, [user])

  // Listen for focus events to refresh data when user returns to tab - REMOVED to prevent excessive refreshing
  // useEffect(() => {
  //   const handleFocus = () => {
  //     if (user) {
  //       fetchSubscriptions()
  //     }
  //   }

  //   window.addEventListener('focus', handleFocus)
  //   return () => window.removeEventListener('focus', handleFocus)
  // }, [user])

  // Calculate real subscription metrics
  const calculateMetrics = () => {
    if (!subscriptions.length) {
      return {
        totalMonthly: 0,
        totalAnnual: 0,
        upcomingRenewals: 0,
        dueToday: 0,
        categoryBreakdown: {}
      }
    }

    let totalMonthly = 0
    const categoryBreakdown: Record<string, number> = {}
    let upcomingRenewals = 0
    let dueToday = 0

    // Get today's date at start of day for accurate comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const oneWeekFromNow = new Date(today)
    oneWeekFromNow.setDate(today.getDate() + 7)

    // Calculate monthly total (normalize all billing cycles to monthly)
    subscriptions.forEach(sub => {
      let monthlyAmount = sub.amount
      
      switch (sub.billingCycle) {
        case 'weekly':
          monthlyAmount = sub.amount * 4.33
          break
        case 'quarterly':
          monthlyAmount = sub.amount / 3
          break
        case 'yearly':
          monthlyAmount = sub.amount / 12
          break
      }
      
      totalMonthly += monthlyAmount
      
      // Category breakdown
      const category = sub.category || 'other'
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + monthlyAmount

      // Calculate due dates
      if (sub.nextBillingDate) {
        const nextBilling = sub.nextBillingDate.toDate ? sub.nextBillingDate.toDate() : new Date(sub.nextBillingDate)
        nextBilling.setHours(0, 0, 0, 0) // Normalize to start of day
        
        // Check if due today
        if (nextBilling.getTime() === today.getTime()) {
          dueToday++
        }
        
        // Check if due this week (including today)
        if (nextBilling >= today && nextBilling <= oneWeekFromNow) {
          upcomingRenewals++
        }
      }
    })

    return {
      totalMonthly,
      totalAnnual: totalMonthly * 12,
      upcomingRenewals,
      dueToday,
      categoryBreakdown
    }
  }

  const metrics = calculateMetrics()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading your subscriptions...</span>
              <CreditCard className="w-6 h-6 text-indigo-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/10 dark:bg-indigo-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full animate-pulse shadow-lg opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 p-4 sm:p-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Mobile-Optimized Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 dark:from-indigo-500/10 dark:to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="group bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </Button>

                <div className="flex items-center space-x-2">
                  {/* Show Due Today badge if any subscriptions are due today */}
                  {metrics.dueToday > 0 ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {metrics.dueToday} Due Today
                    </Badge>
                  ) : metrics.upcomingRenewals > 0 ? (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      <Bell className="w-3 h-3 mr-1" />
                      {metrics.upcomingRenewals} Due This Week
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      All Up to Date
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent mb-2">
                  Subscription Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Track, manage, and optimize your recurring payments
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats - Real Data */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Monthly */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/5 dark:from-green-500/10 dark:to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ${metrics.totalMonthly.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Monthly Total</div>
              </div>
            </div>

            {/* Total Annual */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/5 dark:from-blue-500/10 dark:to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ${metrics.totalAnnual.toFixed(0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Annual Total</div>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/5 dark:from-purple-500/10 dark:to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {subscriptions.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Subs</div>
              </div>
            </div>

            {/* Upcoming Renewals */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-500/5 dark:from-orange-500/10 dark:to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {metrics.upcomingRenewals}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Due This Week</div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 dark:from-indigo-500/10 dark:to-transparent rounded-2xl sm:rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Mobile-Friendly Tab Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <TabsList className="grid w-full grid-cols-3 sm:w-auto bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-700/30 rounded-xl p-1">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all duration-300">
                      <PieChart className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="text-xs sm:text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all duration-300">
                      <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Active</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all duration-300">
                      <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Quick Actions - Fixed the button to open form */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setIsFormOpen(true)}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subscription
                    </Button>
                  </div>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-6">
                    {/* Due Today Alert - Higher Priority */}
                    {metrics.dueToday > 0 && (
                      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border border-red-200/50 dark:border-red-700/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200">
                              🚨 {metrics.dueToday} subscription{metrics.dueToday > 1 ? 's' : ''} due TODAY
                            </h4>
                            <p className="text-sm text-red-600 dark:text-red-300">
                              Payment{metrics.dueToday > 1 ? 's' : ''} will be charged today - review immediately
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upcoming Renewals Alert - Only show if no items due today */}
                    {metrics.dueToday === 0 && metrics.upcomingRenewals > 0 && (
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-700/30 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-orange-500" />
                          <div>
                            <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                              {metrics.upcomingRenewals} subscription{metrics.upcomingRenewals > 1 ? 's' : ''} due this week
                            </h4>
                            <p className="text-sm text-orange-600 dark:text-orange-300">
                              Review your upcoming charges to avoid surprises
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clean Subscription List without redundant data */}
                    {subscriptions.length === 0 ? (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border border-gray-200/50 dark:border-gray-700/30 rounded-xl p-8 text-center">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No subscriptions yet</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Start tracking your recurring payments to get insights and avoid surprises
                        </p>
                        <Button 
                          onClick={() => setIsFormOpen(true)}
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Subscription
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 border border-indigo-200/50 dark:border-indigo-700/30">
                        {/* Clean subscription list header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Subscriptions</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Button 
                            onClick={refreshData} 
                            variant="outline" 
                            size="sm"
                            className="bg-white/50 dark:bg-white/5"
                          >
                            Refresh
                          </Button>
                        </div>
                        <SubscriptionsList />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Active Subscriptions Tab */}
                <TabsContent value="active" className="mt-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-6 border border-green-200/50 dark:border-green-700/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Subscriptions</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {subscriptions.length} Active
                      </Badge>
                    </div>
                    
                    {subscriptions.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No active subscriptions found</p>
                        <Button 
                          onClick={() => setIsFormOpen(true)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Subscription
                        </Button>
                      </div>
                    ) : (
                      <SubscriptionsList />
                    )}
                  </div>
                </TabsContent>

                {/* Analytics Tab - Real Data */}
                <TabsContent value="analytics" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending by Category - Real Data */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-700/30">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                        Spending by Category
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(metrics.categoryBreakdown).length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No category data available
                          </p>
                        ) : (
                          Object.entries(metrics.categoryBreakdown)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([category, amount]) => (
                              <div key={category} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {category.replace('_', ' ')}
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ${(amount as number).toFixed(2)}/mo
                                </span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Monthly Insights - Real Data */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200/50 dark:border-purple-700/30">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                        Monthly Insights
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Monthly</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${metrics.totalMonthly.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Average per Subscription</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${subscriptions.length > 0 ? (metrics.totalMonthly / subscriptions.length).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Annual Impact</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            ${metrics.totalAnnual.toFixed(0)}
                          </span>
                        </div>
                        {subscriptions.length > 0 && (
                          <div className="pt-2 border-t border-purple-200/50 dark:border-purple-700/30">
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              💡 Tip: Review unused subscriptions to potentially save ${(metrics.totalMonthly * 0.2).toFixed(0)}/month
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

        </div>
      </div>

      {/* Add the SubscriptionForm component */}
      <SubscriptionForm 
        userId={user?.uid || ""}
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={handleSubscriptionSuccess} 
      />
    </div>
  )
}