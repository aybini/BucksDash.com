"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AccountBalances } from "@/components/dashboard/account-balances"
import { DataEntryPoints } from "@/components/dashboard/data-entry-points"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { RefreshFinancialData } from "@/components/dashboard/refresh-financial-data"
import { checkNetworkStatus } from "@/lib/firebase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { WifiOff, Sparkles, TrendingUp, Activity, Zap, Shield } from "lucide-react"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setIsClient(true)

    if (!loading && !user && isClient) {
      router.push("/login")
    }

    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4
    }))
    setParticles(generatedParticles)
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)

    const checkConnection = () => {
      const online = checkNetworkStatus()
      setIsOffline(!online)
    }

    checkConnection()

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)
    const interval = setInterval(checkConnection, 30000)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
      clearInterval(interval)
    }
  }, [user, loading, router, isClient])

  const handleRefreshComplete = (data: any) => {
    if (data.lastUpdated) {
      setLastUpdated(data.lastUpdated)
    }
  }

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-500/20 dark:bg-rose-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent rounded-3xl animate-pulse" />
          <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xl font-semibold animate-pulse">Loading your dashboard...</span>
            <Sparkles className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-500/20 dark:bg-rose-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/10 dark:bg-rose-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-rose-600 rounded-full animate-pulse shadow-lg opacity-40"
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
        <div className="flex flex-col space-y-8">
          
          {/* Enhanced Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 dark:from-rose-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 bg-clip-text text-transparent drop-shadow-lg">
                    Dashboard
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <TrendingUp className="w-6 h-6 text-rose-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-rose-500/20 blur-lg animate-pulse">
                    Dashboard
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 px-4 py-2 rounded-full border border-rose-200 dark:border-rose-700/50">
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-300">Live Data</span>
                </div>
              </div>
              
              {user && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <RefreshFinancialData
                    userId={user.uid}
                    lastUpdated={lastUpdated}
                    onRefreshComplete={handleRefreshComplete}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Offline Alert */}
          {isOffline && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 backdrop-blur-xl rounded-3xl p-6 border border-yellow-200/50 dark:border-yellow-700/50 shadow-2xl relative overflow-hidden group transition-all duration-700 transform animate-in slide-in-from-top-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <Alert variant="warning" className="bg-transparent border-none shadow-none relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <WifiOff className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                  </div>
                  <div>
                    <AlertTitle className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg">You're offline</AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                      You can still view and edit your data. Changes will be saved locally and synced when you're back online.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>
          )}

          {/* Enhanced Content Grid */}
          <div className="grid gap-8 grid-cols-1">
            
            {/* Overview Section */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 dark:from-rose-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-rose-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative z-10">
                <Overview />
              </div>
            </div>

            {/* Account Balances and Recent Activity */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative z-10">
                  <AccountBalances />
                </div>
              </div>

              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative z-10">
                  <RecentActivity />
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6 group">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
                    Quick Actions
                  </h3>
                  <div className="relative">
                    <Zap className="w-6 h-6 text-purple-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                    <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping opacity-75" />
                  </div>
                </div>
                <DataEntryPoints />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}