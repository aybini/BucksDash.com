"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/dashboard/bills-calendar"
import { BillsList } from "@/components/dashboard/bills-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptions, type Subscription } from "@/lib/firebase-service"
import { 
  ArrowLeft,
  Calendar as CalendarIcon, 
  List, 
  Clock, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Bell,
  CreditCard,
  Activity,
  CheckCircle2
} from "lucide-react"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setHasMounted(true)
    
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(8)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4
    }))
    setParticles(generatedParticles)
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  useEffect(() => {
    if (hasMounted && !loading && !user) {
      router.push("/login")
    }
  }, [hasMounted, loading, user])

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!user) return

      setIsLoading(true)
      try {
        const fetchedSubscriptions = await getSubscriptions(user.uid)
        setSubscriptions(fetchedSubscriptions)
      } catch (error) {
        console.error("Error fetching subscriptions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  // Calculate calendar metrics
  const calculateMetrics = () => {
    if (!subscriptions.length) {
      return {
        totalBills: 0,
        upcomingThisWeek: 0,
        monthlyTotal: 0,
        overdueCount: 0
      }
    }

    let monthlyTotal = 0
    
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
        case 'annually':
          monthlyAmount = sub.amount / 12
          break
        case 'monthly':
        default:
          monthlyAmount = sub.amount
          break
      }
      
      monthlyTotal += monthlyAmount
    })

    // Calculate upcoming bills (next 7 days)
    const upcomingThisWeek = subscriptions.filter(sub => {
      if (!sub.nextBillingDate) return false
      
      // Handle both Firebase Timestamp and Date objects
      let nextBilling: Date
      if (typeof sub.nextBillingDate === 'object' && 'toDate' in sub.nextBillingDate) {
        // Firebase Timestamp
        nextBilling = sub.nextBillingDate.toDate()
      } else if (sub.nextBillingDate instanceof Date) {
        // Already a Date object
        nextBilling = sub.nextBillingDate
      } else {
        // String or other format, convert to Date
        nextBilling = new Date(sub.nextBillingDate)
      }
      
      const today = new Date()
      const daysUntil = Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 7
    }).length

    return {
      totalBills: subscriptions.length,
      upcomingThisWeek,
      monthlyTotal,
      overdueCount: 0 // You can implement overdue logic here
    }
  }

  const metrics = calculateMetrics()

  if (!hasMounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading your bills calendar...</span>
              <CalendarIcon className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg opacity-30"
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="group bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </Button>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <Bell className="w-3 h-3 mr-1" />
                    {metrics.upcomingThisWeek} This Week
                  </Badge>
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-2">
                  Bills & Calendar
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  View and manage your upcoming bills and payments
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Bills */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/5 dark:from-blue-500/10 dark:to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalBills}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Bills</div>
              </div>
            </div>

            {/* Upcoming This Week */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-500/5 dark:from-orange-500/10 dark:to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {metrics.upcomingThisWeek}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
              </div>
            </div>

            {/* Monthly Total */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-500/5 dark:from-green-500/10 dark:to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  ${metrics.monthlyTotal.toFixed(0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Monthly Total</div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {metrics.overdueCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-2xl sm:rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <Tabs defaultValue="calendar" className="w-full">
                {/* Mobile-Friendly Tab Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <TabsList className="grid w-full grid-cols-2 sm:w-auto bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/30 rounded-xl p-1">
                    <TabsTrigger value="calendar" className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300">
                      <CalendarIcon className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Calendar View</span>
                      <span className="sm:hidden">Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="text-xs sm:text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300">
                      <List className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">List View</span>
                      <span className="sm:hidden">List</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-700/30">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                          Upcoming Bills Calendar
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          View and manage your upcoming bills and payments
                        </p>
                      </div>
                      {metrics.upcomingThisWeek > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {metrics.upcomingThisWeek} Due Soon
                        </Badge>
                      )}
                    </div>
                    <Calendar subscriptions={subscriptions} isLoading={isLoading} />
                  </div>
                </TabsContent>

                {/* List Tab */}
                <TabsContent value="list" className="mt-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 sm:p-6 border border-emerald-200/50 dark:border-emerald-700/30">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <List className="w-5 h-5 mr-2 text-emerald-500" />
                          Bills & Payments
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Manage your recurring bills and one-time payments
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {metrics.totalBills} Total
                      </Badge>
                    </div>
                    <BillsList subscriptions={subscriptions} isLoading={isLoading} />
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