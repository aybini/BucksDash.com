"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Loader2, Sparkles, Target, DollarSign, Tag, Calendar, Star, Shield, TrendingUp } from "lucide-react"
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

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

export function GoalForm({ isOpen, onClose, goal, onSuccess }: GoalFormProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("emergency")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetDate, setTargetDate] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  
  const { toast } = useToast()
  const { user } = useAuth()

  // Generate particles when modal opens
  useEffect(() => {
    if (isOpen) {
      const generatedParticles = [...Array(6)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3
      }))
      setParticles(generatedParticles)
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsVisible(false)
      setParticles([])
    }
  }, [isOpen])

  // Initialize form with goal data when editing
  useEffect(() => {
    if (goal && isOpen) {
      // Handle date conversion from Firestore
      let formattedDate = ""
      if (goal.targetDate) {
        try {
          let dateObj
          if (typeof goal.targetDate === "object" && "toDate" in goal.targetDate) {
            dateObj = goal.targetDate.toDate()
          } else if (goal.targetDate instanceof Date) {
            dateObj = goal.targetDate
          } else if (typeof goal.targetDate === "object" && "seconds" in goal.targetDate) {
            dateObj = new Date((goal.targetDate as any).seconds * 1000)
          } else {
            dateObj = new Date(goal.targetDate as any)
          }
          
          const year = dateObj.getFullYear()
          const month = String(dateObj.getMonth() + 1).padStart(2, "0")
          const day = String(dateObj.getDate()).padStart(2, "0")
          formattedDate = `${year}-${month}-${day}`
        } catch (error) {
          console.error("Error parsing target date:", error)
          formattedDate = ""
        }
      }

      setName(goal.name || "")
      setCategory(goal.category || "emergency")
      setTargetAmount(goal.targetAmount?.toString() || "")
      setCurrentAmount(goal.currentAmount?.toString() || "")
      setTargetDate(formattedDate)
    } else if (!goal && isOpen) {
      // Reset form for new goal
      setName("")
      setCategory("emergency")
      setTargetAmount("")
      setCurrentAmount("")
      setTargetDate("")
    }
  }, [goal, isOpen])

  // Memoized event handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value)
  }, [])

  const handleTargetAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetAmount(e.target.value)
  }, [])

  const handleCurrentAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAmount(e.target.value)
  }, [])

  const handleTargetDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetDate(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      const goalData: Partial<SavingsGoal> = {
        name,
        category,
        targetAmount: Number.parseFloat(targetAmount),
        currentAmount: Number.parseFloat(currentAmount),
        userId: user.uid,
      }

      if (targetDate) {
        const dateObj = new Date(targetDate)
        goalData.targetDate = Timestamp.fromDate(dateObj)
      }

      if (goal && goal.id) {
        await updateSavingsGoal(user.uid, goal.id, goalData as SavingsGoal)
        toast({
          title: "Goal updated",
          description: "Your savings goal has been updated successfully.",
        })
      } else {
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

      onSuccess?.()
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
  }, [user, name, category, targetAmount, currentAmount, targetDate, goal, toast, onSuccess, onClose])

  return (
    <Modal
      title={goal && goal.id ? "Edit Savings Goal" : "Create Savings Goal"}
      description={goal && goal.id ? "Update your savings goal details and track your progress." : "Set up a new savings goal and start building your financial future."}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="relative bg-gradient-to-br from-white/95 via-purple-50/90 to-white/95 dark:from-gray-900/95 dark:via-purple-900/80 dark:to-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse shadow-xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse shadow-xl" style={{ animationDelay: '2s' }} />
        </div>

        {/* Fixed Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-sm opacity-60"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            />
          ))}
        </div>

        <div className={`relative z-10 p-8 transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Goal Name Field */}
            <div className="space-y-3 group">
              <Label htmlFor="name" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Goal Name</span>
                <Star className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Emergency Fund, Vacation, New Car..."
                  required
                  className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Tag className="w-5 h-5 text-purple-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Category Field */}
            <div className="space-y-3 group">
              <Label htmlFor="category" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Category</span>
                <Shield className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
              </Label>
              <div className="relative">
                <Select value={category} onValueChange={handleCategoryChange} required>
                  <SelectTrigger 
                    id="category"
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                  >
                    <SelectValue placeholder="Select goal category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-xl shadow-2xl z-[99999]">
                    <SelectItem value="emergency" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">🚨 Emergency Fund</SelectItem>
                    <SelectItem value="vacation" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">🏖️ Vacation</SelectItem>
                    <SelectItem value="car" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">🚗 New Car</SelectItem>
                    <SelectItem value="house" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">🏠 House</SelectItem>
                    <SelectItem value="tuition" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">🎓 Tuition</SelectItem>
                    <SelectItem value="retirement" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">🏖️ Retirement</SelectItem>
                    <SelectItem value="other" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">📦 Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Amount Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Target Amount Field */}
              <div className="space-y-3 group">
                <Label htmlFor="targetAmount" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Target Amount</span>
                  <DollarSign className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                </Label>
                <div className="relative">
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    value={targetAmount}
                    onChange={handleTargetAmountChange}
                    placeholder="10000.00"
                    required
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Current Amount Field */}
              <div className="space-y-3 group">
                <Label htmlFor="currentAmount" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                  <span>Current Amount</span>
                  <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Label>
                <div className="relative">
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    value={currentAmount}
                    onChange={handleCurrentAmountChange}
                    placeholder="2500.00"
                    required
                    className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Target Date Field */}
            <div className="space-y-3 group">
              <Label htmlFor="targetDate" className="text-gray-800 dark:text-white font-semibold flex items-center space-x-2 text-sm">
                <span>Target Date</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
                <Calendar className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </Label>
              <div className="relative">
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={handleTargetDateChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/15 rounded-xl h-12 text-base shadow-sm hover:shadow-md pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-white/20">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  className="relative w-full sm:w-auto bg-white/80 dark:bg-white/10 backdrop-blur-sm border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/15 transition-all duration-300 hover:scale-105 h-12 px-8 text-base font-medium rounded-xl shadow-lg"
                >
                  Cancel
                </Button>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                <Button 
                  type="submit" 
                  className="relative w-full sm:w-auto bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 hover:from-purple-700 hover:via-purple-700 hover:to-purple-800 text-white font-semibold h-12 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base overflow-hidden group" 
                  disabled={isSubmitting}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center space-x-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{goal && goal.id ? "Updating..." : "Creating..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{goal && goal.id ? "Update" : "Create"} Goal</span>
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </Modal>
  )
}