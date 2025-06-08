"use client"

import React, { useState, useEffect } from "react"
import { SavingsGoals } from "@/components/dashboard/savings-goals"
import { GoalForm } from "@/components/forms/goal-form"
import { getSavingsGoals, type SavingsGoal } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Target, PlusCircle, Sparkles, TrendingUp, Trophy, Zap, DollarSign, Calendar } from "lucide-react"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { user } = useAuth()
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

  useEffect(() => {
    if (user) {
      fetchGoals()
    } else {
      setGoals([])
      setIsLoading(false)
    }
  }, [user])

  const fetchGoals = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const fetchedGoals = await getSavingsGoals(user.uid)
      console.log("Fetched goals:", fetchedGoals)
      setGoals(fetchedGoals)
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoalsChange = (updatedGoals: SavingsGoal[]) => {
    setGoals(updatedGoals)
  }

  const handleAddGoal = () => {
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchGoals()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading your goals...</span>
              <Target className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-lg opacity-40"
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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                    Savings Goals
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <Trophy className="w-6 h-6 text-purple-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-purple-500/20 blur-lg animate-pulse">
                    Savings Goals
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700/50">
                  <Target className="w-4 h-4 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Achievement Focused</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700/50">
                  <DollarSign className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Financial Growth</span>
                </div>
                
                {/* Enhanced Add Goal Button */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                  <button
                    onClick={handleAddGoal}
                    className="relative bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 hover:from-purple-700 hover:via-purple-700 hover:to-purple-800 text-white font-semibold h-12 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 text-base overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative flex items-center space-x-2">
                      <PlusCircle className="h-5 w-5" />
                      <span>Add Goal</span>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mt-4 relative z-10">
              <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                <span>Set ambitious savings targets and track your progress towards financial freedom</span>
                <TrendingUp className="w-5 h-5 text-purple-500 animate-pulse" />
              </p>
            </div>
          </div>

          {/* Goals Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
                  <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Goals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {goals.filter(goal => (goal.currentAmount || 0) >= goal.targetAmount).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Target</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${goals.reduce((total, goal) => total + goal.targetAmount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Savings Goals Container */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6 group">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
                  Your Savings Journey
                </h3>
                <div className="relative">
                  <Zap className="w-6 h-6 text-purple-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              
              <SavingsGoals
                goals={goals}
                isLoading={false}
                onGoalsChange={handleGoalsChange}
                onAddGoal={handleAddGoal}
              />
            </div>
          </div>

        </div>
      </div>

      <GoalForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        goal={null} 
        onSuccess={handleFormSuccess} 
      />
    </div>
  )
}