"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { IncomeSources } from "@/components/dashboard/income-sources"
import { PlusCircle, TrendingUp, DollarSign, Target, Sparkles, Shield, Zap, Loader2 } from "lucide-react"
import { IncomeSourceForm } from "@/components/forms/income-source-form"
import { getIncomeSources, type IncomeSource } from "@/lib/firebase-service"
import { useRouter } from "next/navigation"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function IncomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(12)].map((_, i) => ({
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
    setIsClient(true)
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    const fetchIncomeSources = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const sources = await getIncomeSources(user.uid)
        setIncomeSources(sources)
      } catch (error) {
        console.error("Error fetching income sources:", error)
        toast({
          title: "Error",
          description: "Failed to load income sources. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchIncomeSources()
    }
  }, [user, toast])

  const handleFormSuccess = async () => {
    setIsAddIncomeOpen(false)
    if (user) {
      try {
        const sources = await getIncomeSources(user.uid)
        setIncomeSources(sources)
        toast({
          title: "Success",
          description: "Income source saved successfully.",
        })
      } catch (error) {
        console.error("Error refreshing income sources:", error)
      }
    }
  }

  // Calculate income statistics
  const totalMonthlyIncome = incomeSources.reduce((total, source) => total + source.amount, 0)
  const totalAnnualIncome = totalMonthlyIncome * 12
  const averageIncomePerSource = incomeSources.length > 0 ? totalMonthlyIncome / incomeSources.length : 0

  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-white dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading income management...</span>
              <TrendingUp className="w-6 h-6 text-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-white dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 dark:bg-green-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse shadow-lg opacity-40"
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
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-green-600 to-green-700 bg-clip-text text-transparent drop-shadow-lg">
                    Income Management
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <TrendingUp className="w-6 h-6 text-green-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-green-500/20 blur-lg animate-pulse">
                    Income Management
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 px-4 py-2 rounded-full border border-green-200 dark:border-green-700/50">
                  <Shield className="w-4 h-4 text-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Growth Focused</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-700/50">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Smart Tracking</span>
                </div>
                <Button 
                  onClick={() => setIsAddIncomeOpen(true)} 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Add Income
                </Button>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mt-4 relative z-10">
              <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                <span>Track and optimize your income streams for financial growth</span>
                <Target className="w-5 h-5 text-green-500 animate-pulse" />
              </p>
            </div>
          </div>

          {/* Income Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalMonthlyIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 dark:from-emerald-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Annual Projection</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalAnnualIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5 dark:from-teal-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/30">
                  <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Per Source</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${averageIncomePerSource.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Income Overview Card */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6 group">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent drop-shadow-sm">
                  Income Overview
                </h3>
                <div className="relative">
                  <Zap className="w-6 h-6 text-green-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <span>Track and manage your income sources to maximize your financial potential.</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add your income sources to get a comprehensive view of your earning capacity and plan for future growth.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30">
                <IncomeSources
                  incomeSources={incomeSources}
                  isLoading={isLoading}
                  onIncomesChange={setIncomeSources}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <IncomeSourceForm
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}