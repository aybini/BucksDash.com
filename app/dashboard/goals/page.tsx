"use client"

import { useState, useEffect } from "react"
import { SavingsGoals } from "@/components/dashboard/savings-goals"
import { GoalForm } from "@/components/forms/goal-form"
import { getSavingsGoals, type SavingsGoal } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { user } = useAuth()

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Savings Goals</h2>
        <button
          onClick={handleAddGoal}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-md text-sm"
        >
          Add Goal
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <SavingsGoals
          goals={goals}
          isLoading={isLoading}
          onGoalsChange={handleGoalsChange}
          onAddGoal={handleAddGoal}
        />
      )}

      <GoalForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} goal={null} onSuccess={handleFormSuccess} />
    </div>
  )
}
