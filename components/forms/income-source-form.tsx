"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Loader2, DollarSign, TrendingUp, Calendar, FileText, Target, Sparkles, Zap, Clock } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { addIncomeSource, updateIncomeSource, type IncomeSource } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Timestamp } from "firebase/firestore"

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface IncomeSourceFormProps {
  isOpen: boolean
  onClose: () => void
  incomeSource?: IncomeSource | null
  onSuccess?: () => void
}

export function IncomeSourceForm({ isOpen, onClose, incomeSource, onSuccess }: IncomeSourceFormProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<IncomeSource["frequency"]>("monthly")
  const [entryDate, setEntryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  // Generate particles and trigger entrance animation
  useEffect(() => {
    if (isOpen) {
      const generatedParticles = [...Array(8)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3
      }))
      setParticles(generatedParticles)
      
      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  // Initialize form with income source data when editing
  useEffect(() => {
    if (incomeSource && isOpen) {
      console.log("Initializing form with income source:", incomeSource)

      // Handle date conversion from Firestore
      if (incomeSource.entryDate) {
        try {
          let dateObj

          // Handle Firestore Timestamp
          if (typeof incomeSource.entryDate === "object" && "toDate" in incomeSource.entryDate) {
            dateObj = incomeSource.entryDate.toDate()
          } else {
            // Handle regular Date object or string
            dateObj = new Date(incomeSource.entryDate as any)
          }

          // Format as YYYY-MM-DD for the input
          const year = dateObj.getFullYear()
          const month = String(dateObj.getMonth() + 1).padStart(2, "0")
          const day = String(dateObj.getDate()).padStart(2, "0")
          const formattedDate = `${year}-${month}-${day}`

          console.log("Setting entry date:", formattedDate)
          setEntryDate(formattedDate)
        } catch (error) {
          console.error("Error formatting date:", error)
          // Default to today if there's an error
          const today = new Date()
          const year = today.getFullYear()
          const month = String(today.getMonth() + 1).padStart(2, "0")
          const day = String(today.getDate()).padStart(2, "0")
          setEntryDate(`${year}-${month}-${day}`)
        }
      } else {
        // Default to today if no date
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, "0")
        const day = String(today.getDate()).padStart(2, "0")
        setEntryDate(`${year}-${month}-${day}`)
      }

      setName(incomeSource.name || "")
      setAmount(incomeSource.amount?.toString() || "")
      setFrequency(incomeSource.frequency || "monthly")
      setNotes(incomeSource.notes || "")
    } else if (!incomeSource && isOpen) {
      // Reset form for new income source
      setName("")
      setAmount("")
      setFrequency("monthly")

      // Default to today
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const day = String(today.getDate()).padStart(2, "0")
      setEntryDate(`${year}-${month}-${day}`)

      setNotes("")
    }
  }, [incomeSource, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add an income source.",
        variant: "destructive",
      })
      return
    }

    if (!name || !amount || !entryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Submitting form with date:", entryDate)

      // Parse the date string to a Date object
      const [year, month, day] = entryDate.split("-").map(Number)
      const dateObject = new Date(year, month - 1, day)

      console.log("Converted date object:", dateObject)

      // Create the base income source data
      const incomeData: Partial<IncomeSource> = {
        name,
        amount: Number.parseFloat(amount),
        frequency,
        userId: user.uid,
        // Convert the Date to a Firestore Timestamp
        entryDate: Timestamp.fromDate(dateObject),
      }

      // Only add notes if it's defined and not empty
      if (notes && notes.trim()) {
        incomeData.notes = notes.trim()
      }

      console.log("Saving income source data:", incomeData)

      if (incomeSource?.id) {
        // Update existing income source
        await updateIncomeSource(user.uid, incomeSource.id, incomeData as IncomeSource)
        toast({
          title: "Income source updated",
          description: "Your income source has been updated successfully.",
        })
      } else {
        // Add new income source
        await addIncomeSource(user.uid, incomeData as IncomeSource)
        toast({
          title: "Income source added",
          description: "Your income source has been added successfully.",
        })
      }

      // Reset form and close modal
      setName("")
      setAmount("")
      setFrequency("monthly")
      setEntryDate("")
      setNotes("")

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error) {
      console.error("Error saving income source:", error)
      toast({
        title: "Error",
        description: "Failed to save income source. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFrequencyIcon = (freq: string) => {
    switch (freq) {
      case "weekly":
        return <Clock className="w-4 h-4" />
      case "biweekly":
        return <Calendar className="w-4 h-4" />
      case "monthly":
        return <Target className="w-4 h-4" />
      case "quarterly":
        return <TrendingUp className="w-4 h-4" />
      case "annually":
        return <Sparkles className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Modal
      title={incomeSource?.id ? "Edit Income Source" : "Add Income Source"}
      description={
        incomeSource?.id ? "Update your income source details." : "Add a new source of income to track your earnings."
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="relative max-h-[80vh] md:max-h-[500px] bg-gradient-to-br from-gray-50 via-green-50/30 to-white dark:from-gray-900 dark:via-green-900/20 dark:to-gray-900 rounded-3xl overflow-hidden">
        {/* Scrollable Container */}
        <div className="max-h-[80vh] md:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 dark:scrollbar-thumb-green-600 scrollbar-track-transparent hover:scrollbar-thumb-green-400 dark:hover:scrollbar-thumb-green-500 transition-colors duration-300">
        
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/20 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-300/10 dark:bg-green-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse shadow-lg opacity-40"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.animationDelay}s`,
                animationDuration: `${particle.animationDuration}s`
              }}
            />
          ))}
        </div>

        {/* Form Content */}
        <div className={`relative z-10 p-6 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Enhanced Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500 mb-6">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex items-center space-x-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700/50">
                {getFrequencyIcon(frequency)}
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent drop-shadow-sm">
                  {incomeSource?.id ? "Update Income Details" : "Create New Income Source"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                  <span>Track your earnings and build wealth</span>
                  <TrendingUp className="w-4 h-4 text-green-500 animate-pulse" />
                </p>
              </div>
            </div>
          </div>

          <form id="income-source-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Income Source Name Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Income Source Name</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Salary, Freelance Work"
                  required
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Amount Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="amount" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>Amount ($)</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Frequency Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="frequency" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Frequency</span>
                </Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as IncomeSource["frequency"])}>
                  <SelectTrigger id="frequency" className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20">
                    <SelectItem value="weekly">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Weekly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="biweekly">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Bi-weekly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="monthly">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Monthly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="quarterly">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Quarterly</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="annually">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Annually</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entry Date Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="entryDate" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Entry Date</span>
                </Label>
                <Input 
                  id="entryDate" 
                  type="date" 
                  value={entryDate} 
                  onChange={(e) => setEntryDate(e.target.value)} 
                  required 
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Notes Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-teal-500/5 dark:from-teal-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="notes" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FileText className="w-4 h-4 text-teal-500" />
                  <span>Notes (Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details about this income source"
                  className="min-h-[80px] bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-teal-500 dark:focus:border-teal-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  className="w-full sm:w-auto bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {incomeSource ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {incomeSource ? "Update" : "Add"} Income Source
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
        </div>
      </div>
    </Modal>
  )
}