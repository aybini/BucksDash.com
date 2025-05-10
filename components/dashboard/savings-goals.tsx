"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, PlusCircle } from "lucide-react"
import { GoalForm } from "@/components/forms/goal-form"
import { deleteSavingsGoal, type SavingsGoal, getSavingsGoals } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SavingsGoalsProps {
  goals: SavingsGoal[]
  isLoading: boolean
  onGoalsChange: (goals: SavingsGoal[]) => void
  onAddGoal: () => void
}

export function SavingsGoals({ goals = [], isLoading, onGoalsChange, onAddGoal }: SavingsGoalsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleEdit = (goal: SavingsGoal, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Editing goal:", goal)
    setSelectedGoal(goal)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setGoalToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!user || !goalToDelete) return

    try {
      await deleteSavingsGoal(user.uid, goalToDelete)

      // Update local state
      const updatedGoals = goals.filter((goal) => goal.id !== goalToDelete)
      onGoalsChange(updatedGoals)

      toast({
        title: "Goal deleted",
        description: "Savings goal has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setGoalToDelete(null)
    }
  }

  // Helper function to format date from Firestore Timestamp or Date
  const formatTargetDate = (dateValue: any) => {
    if (!dateValue) return null

    try {
      let dateObj

      // Handle Firestore Timestamp
      if (typeof dateValue === "object" && "toDate" in dateValue) {
        dateObj = dateValue.toDate()
      }
      // Handle Firestore Timestamp-like object without toDate method
      else if (typeof dateValue === "object" && "seconds" in dateValue) {
        dateObj = new Date(dateValue.seconds * 1000)
      }
      // Handle regular Date object
      else if (dateValue instanceof Date) {
        dateObj = dateValue
      }
      // Try to parse as date string or number
      else {
        dateObj = new Date(dateValue)
      }

      // Format the date as MM/DD/YYYY
      return dateObj.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error, dateValue)
      return "Invalid date"
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track your progress towards financial goals</CardDescription>
          </div>
          {/* 
          <Button
            className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto mt-2 sm:mt-0 touch-manipulation active:scale-95"
            onClick={onAddGoal}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
          */}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p>Loading savings goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No savings goals found. Add your first goal to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress =
                  goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="max-w-[70%]">
                        <h3 className="font-medium truncate">{goal.name}</h3>
                        {goal.targetDate && (
                          <p className="text-xs text-muted-foreground">
                            Target date: {formatTargetDate(goal.targetDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEdit(goal, e)}
                          className="h-10 w-10 p-0 touch-manipulation active:scale-95"
                          aria-label="Edit goal"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(goal.id!, e)}
                          className="h-10 w-10 p-0 text-red-500 hover:text-red-600 touch-manipulation active:scale-95"
                          aria-label="Delete goal"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="truncate">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </span>
                      <span className="ml-2">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <GoalForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedGoal(null)
        }}
        goal={selectedGoal}
        onSuccess={() => {
          if (user) {
            // Refresh goals after adding/updating
            const fetchGoals = async () => {
              try {
                const fetchedGoals = await getSavingsGoals(user.uid)
                onGoalsChange(fetchedGoals)
              } catch (error) {
                console.error("Error refreshing goals:", error)
              }
            }
            fetchGoals()
          }
        }}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this savings goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-2 sm:mt-0 touch-manipulation active:scale-95">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 touch-manipulation active:scale-95"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
