"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Loader2, DollarSign, Percent, CreditCard, Target, Sparkles, Shield, TrendingDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

// Define the DebtAccount interface
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

// Mock Firebase functions for debt accounts
async function addDebtAccount(userId: string, account: DebtAccount): Promise<string> {
  // This would be implemented in firebase-service.ts
  console.log("Adding debt account:", account)
  return "mock-id-" + Date.now()
}

async function updateDebtAccount(userId: string, accountId: string, account: DebtAccount): Promise<void> {
  // This would be implemented in firebase-service.ts
  console.log("Updating debt account:", account)
}

interface DebtAccountFormProps {
  isOpen: boolean
  onClose: () => void
  account?: DebtAccount
  onSuccess?: (account: DebtAccount) => void
}

export function DebtAccountForm({ isOpen, onClose, account, onSuccess }: DebtAccountFormProps) {
  const [name, setName] = useState("")
  const [balance, setBalance] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [minimumPayment, setMinimumPayment] = useState("")
  const [type, setType] = useState("credit-card")
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

  // Initialize form with account data when editing
  useEffect(() => {
    if (account && isOpen) {
      setName(account.name || "")
      setBalance(account.balance?.toString() || "")
      setInterestRate(account.interestRate?.toString() || "")
      setMinimumPayment(account.minimumPayment?.toString() || "")
      setType(account.type || "credit-card")
    } else if (!account && isOpen) {
      // Reset form for new account
      setName("")
      setBalance("")
      setInterestRate("")
      setMinimumPayment("")
      setType("credit-card")
    }
  }, [account, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to manage debt accounts.",
        variant: "destructive",
      })
      return
    }

    if (!name || !balance || !interestRate || !minimumPayment) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const accountData: DebtAccount = {
        id: account?.id,
        name,
        balance: Number.parseFloat(balance),
        interestRate: Number.parseFloat(interestRate),
        minimumPayment: Number.parseFloat(minimumPayment),
        type,
        userId: user.uid,
      }

      if (account?.id) {
        // Update existing account
        await updateDebtAccount(user.uid, account.id, accountData)
        toast({
          title: "Account updated",
          description: "Your debt account has been updated successfully.",
        })
      } else {
        // Add new account
        const newId = await addDebtAccount(user.uid, accountData)
        accountData.id = newId
        toast({
          title: "Account added",
          description: "Your debt account has been added successfully.",
        })
      }

      // Reset form and close modal
      if (onSuccess) {
        onSuccess(accountData)
      }

      onClose()
    } catch (error) {
      console.error("Error saving debt account:", error)
      toast({
        title: "Error",
        description: "Failed to save debt account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (accountType: string) => {
    switch (accountType) {
      case "credit-card":
        return <CreditCard className="w-4 h-4" />
      case "student-loan":
        return <Target className="w-4 h-4" />
      case "auto-loan":
        return <Shield className="w-4 h-4" />
      case "mortgage":
        return <TrendingDown className="w-4 h-4" />
      case "personal-loan":
        return <DollarSign className="w-4 h-4" />
      case "medical-debt":
        return <Shield className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  return (
    <Modal
      title={account?.id ? "Edit Debt Account" : "Add Debt Account"}
      description={account?.id ? "Update your debt account details." : "Add a new debt account to track."}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="relative max-h-[80vh] md:max-h-[400px] bg-gradient-to-br from-gray-50 via-orange-50/30 to-white dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-900 rounded-3xl overflow-hidden">
        {/* Scrollable Container */}
        <div className="max-h-[80vh] md:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-600 scrollbar-track-transparent hover:scrollbar-thumb-orange-400 dark:hover:scrollbar-thumb-orange-500 transition-colors duration-300">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 dark:bg-orange-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-300/10 dark:bg-orange-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg opacity-40"
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
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex items-center space-x-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700/50">
                {getTypeIcon(type)}
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 bg-clip-text text-transparent drop-shadow-sm">
                  {account?.id ? "Update Account Details" : "Create New Debt Account"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                  <span>Track your debt and accelerate payoff</span>
                  <Target className="w-4 h-4 text-orange-500 animate-pulse" />
                </p>
              </div>
            </div>
          </div>

          <form id="debt-account-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Account Name Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Account Name</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Chase Credit Card"
                  required
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Balance Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 dark:from-red-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="balance" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <DollarSign className="w-4 h-4 text-red-500" />
                  <span>Current Balance ($)</span>
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  required
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-red-500 dark:focus:border-red-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Interest Rate Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="interestRate" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <span>Interest Rate (%)</span>
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="0.00"
                  required
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Minimum Payment Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="minimumPayment" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Minimum Payment ($)</span>
                </Label>
                <Input
                  id="minimumPayment"
                  type="number"
                  step="0.01"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  placeholder="0.00"
                  required
                  className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Account Type Field */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-2">
                <Label htmlFor="type" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Account Type</span>
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="bg-white/50 dark:bg-white/5 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/20">
                    <SelectItem value="credit-card" className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      Credit Card
                    </SelectItem>
                    <SelectItem value="student-loan">Student Loan</SelectItem>
                    <SelectItem value="auto-loan">Auto Loan</SelectItem>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                    <SelectItem value="personal-loan">Personal Loan</SelectItem>
                    <SelectItem value="medical-debt">Medical Debt</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 dark:from-orange-500/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {account ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      {account ? "Update" : "Add"} Debt Account
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