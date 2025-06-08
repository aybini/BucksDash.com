"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DebtAccounts } from "@/components/dashboard/debt-accounts"
import { DebtPayoffCalculator } from "@/components/dashboard/debt-payoff-calculator"
import { useAuth } from "@/lib/auth-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import { Loader2, TrendingDown, Calculator, Shield, Zap, DollarSign, Target, AlertTriangle } from "lucide-react"

interface DebtAccount {
  id?: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  type: string
  userId?: string
}

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function DebtPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [accounts, setAccounts] = useState<DebtAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(10)].map((_, i) => ({
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

  const fetchDebtAccounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const accountsRef = collection(db, `users/${user.uid}/debtAccounts`)
      const snapshot = await getDocs(accountsRef)

      const fetchedAccounts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DebtAccount[]

      setAccounts(fetchedAccounts)
    } catch (error) {
      console.error("Error fetching debt accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAccounts = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    setIsClient(true)
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    if (user && isClient) {
      fetchDebtAccounts()
    }
  }, [user, isClient, refreshTrigger])

  // Calculate debt statistics
  const totalDebt = accounts.reduce((total, account) => total + account.balance, 0)
  const totalMinimumPayment = accounts.reduce((total, account) => total + account.minimumPayment, 0)
  const averageInterestRate = accounts.length > 0 
    ? accounts.reduce((total, account) => total + account.interestRate, 0) / accounts.length 
    : 0

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 dark:bg-orange-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading debt management...</span>
              <TrendingDown className="w-6 h-6 text-orange-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 dark:bg-orange-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/10 dark:bg-orange-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg opacity-40"
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
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent drop-shadow-lg">
                    Debt Management
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <TrendingDown className="w-6 h-6 text-orange-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-orange-500/20 blur-lg animate-pulse">
                    Debt Management
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-700/50">
                  <Shield className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Freedom Focused</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-700/50">
                  <Calculator className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Smart Payoff</span>
                </div>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 px-4 py-2 rounded-full border border-red-200 dark:border-red-700/50">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Debt Elimination</span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mt-4 relative z-10">
              <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                <span>Take control of your debt and accelerate your path to financial freedom</span>
                <Target className="w-5 h-5 text-orange-500 animate-pulse" />
              </p>
            </div>
          </div>

          {/* Debt Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 dark:from-red-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Debt</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalDebt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
                  <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Minimums</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalMinimumPayment.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                  <Calculator className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Interest Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {averageInterestRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Debt Accounts Container */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6 group">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent drop-shadow-sm">
                  Your Debt Accounts
                </h3>
                <div className="relative">
                  <TrendingDown className="w-6 h-6 text-orange-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                  <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              
              <div id="debt-accounts">
                <DebtAccounts accounts={accounts} isLoading={isLoading} onAccountsChange={refreshAccounts} />
              </div>
            </div>
          </div>

          {/* Enhanced Debt Payoff Calculator Container */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6 group">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent drop-shadow-sm">
                  Payoff Strategy Calculator
                </h3>
                <div className="relative">
                  <Zap className="w-6 h-6 text-amber-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              
              <DebtPayoffCalculator accounts={accounts} isLoading={isLoading} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}