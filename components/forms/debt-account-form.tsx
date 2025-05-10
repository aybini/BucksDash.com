"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Loader2 } from "lucide-react"
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
  const { toast } = useToast()
  const { user } = useAuth()

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

  return (
    <Modal
      title={account?.id ? "Edit Debt Account" : "Add Debt Account"}
      description={account?.id ? "Update your debt account details." : "Add a new debt account to track."}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form id="debt-account-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Account Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chase Credit Card"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="balance">Current Balance ($)</Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumPayment">Minimum Payment ($)</Label>
          <Input
            id="minimumPayment"
            type="number"
            step="0.01"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Account Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit-card">Credit Card</SelectItem>
              <SelectItem value="student-loan">Student Loan</SelectItem>
              <SelectItem value="auto-loan">Auto Loan</SelectItem>
              <SelectItem value="mortgage">Mortgage</SelectItem>
              <SelectItem value="personal-loan">Personal Loan</SelectItem>
              <SelectItem value="medical-debt">Medical Debt</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {account ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{account ? "Update" : "Add"} Debt Account</>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
