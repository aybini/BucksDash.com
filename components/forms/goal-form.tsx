"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addSavingsGoal, updateSavingsGoal, type SavingsGoal } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Timestamp } from "firebase/firestore"

interface GoalFormProps {
  isOpen: boolean
  onClose: () => void
  goal?: SavingsGoal | null
  onSuccess?: () => void
}

export function GoalForm({ isOpen, onClose, goal, onSuccess }: GoalFormProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("emergency")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetDate, setTargetDate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Initialize form with goal data when editing
  useEffect(() => {
    if (goal && isOpen) {
      console.log("Initializing form with goal:", goal)

      // Handle date conversion from Firestore
      if (goal.targetDate) {
        try {
          let dateObj

          if (typeof goal.targetDate === "object" && "toDate" in goal.targetDate) {
            // It's a Firestore Timestamp
            dateObj = goal.targetDate.toDate()
          } else if (goal.targetDate instanceof Date) {
            // It's already a Date object
            dateObj = goal.targetDate
          } else if (typeof goal.targetDate === "object" && "seconds" in goal.targetDate) {
            // It's a Firestore Timestamp-like object but without toDate method
            dateObj = new Date((goal.targetDate as any).seconds * 1000)
          } else {
            // Try to parse it as a date string or number
            dateObj = new Date(goal.targetDate as any)
          }

          // Format as YYYY-MM-DD for the date input
          const year = dateObj.getFullYear()
          const month = String(dateObj.getMonth() + 1).padStart(2, "0")
          const day = String(dateObj.getDate()).padStart(2, "0")
          const formattedDate = `${year}-${month}-${day}`

          console.log("Setting target date to:", formattedDate)
          setTargetDate(formattedDate)
        } catch (error) {
          console.error("Error parsing target date:", error)
          setTargetDate("")
        }
      } else {
        setTargetDate("")
      }

      setName(goal.name || "")
      setCategory(goal.category || "emergency")
      setTargetAmount(goal.targetAmount?.toString() || "")
      setCurrentAmount(goal.currentAmount?.toString() || "")
    } else if (!goal && isOpen) {
      // Reset form for new goal
      setName("")
      setCategory("emergency")
      setTargetAmount("")
      setCurrentAmount("")
      setTargetDate("")
    }
  }, [goal, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a savings goal.",
        variant: "destructive",
      })
      return
    }

    if (!name || !targetAmount || !currentAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the base goal data
      const goalData: Partial<SavingsGoal> = {
        name,
        category,
        targetAmount: Number.parseFloat(targetAmount),
        currentAmount: Number.parseFloat(currentAmount),
        userId: user.uid,
      }

      // Only add targetDate if it's defined - convert to Firestore Timestamp
      if (targetDate) {
        console.log("Converting target date to Firestore Timestamp:", targetDate)
        const dateObj = new Date(targetDate)
        console.log("Date object:", dateObj)
        goalData.targetDate = Timestamp.fromDate(dateObj)
        console.log("Converted to Timestamp:", goalData.targetDate)
      }

      console.log("Saving goal with data:", goalData)

      // Check if we're updating an existing goal (has an id) or creating a new one
      if (goal && goal.id) {
        // Update existing goal
        await updateSavingsGoal(user.uid, goal.id, goalData as SavingsGoal)
        toast({
          title: "Goal updated",
          description: "Your savings goal has been updated successfully.",
        })
      } else {
        // Add new goal
        await addSavingsGoal(user.uid, goalData as SavingsGoal)
        toast({
          title: "Goal added",
          description: "Your savings goal has been added successfully.",
        })
      }

      // Reset form and close modal
      setName("")
      setCategory("emergency")
      setTargetAmount("")
      setCurrentAmount("")
      setTargetDate("")

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      console.error("Error saving goal:", error)
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={goal && goal.id ? "Edit Savings Goal" : "Add Savings Goal"}
      description={
        goal && goal.id ? "Update your savings goal details." : "Create a new savings goal to track your progress."
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Goal Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Emergency Fund"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emergency">Emergency Fund</SelectItem>
              <SelectItem value="vacation">Vacation</SelectItem>
              <SelectItem value="car">New Car</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="tuition">Tuition</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount ($)</Label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Current Amount ($)</Label>
          <Input
            id="currentAmount"
            type="number"
            step="0.01"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date (Optional)</Label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => {
              console.log("Date input changed:", e.target.value)
              setTargetDate(e.target.value)
            }}
            min={new Date().toISOString().split("T")[0]} // Set min to today
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {goal && goal.id ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{goal && goal.id ? "Update" : "Add"} Savings Goal</>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
