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
import { Textarea } from "@/components/ui/textarea"
import { addIncomeSource, updateIncomeSource, type IncomeSource } from "@/lib/firebase-service"
import { useAuth } from "@/lib/auth-context"
import { Timestamp } from "firebase/firestore"

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
  const { toast } = useToast()
  const { user } = useAuth()

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

  return (
    <Modal
      title={incomeSource?.id ? "Edit Income Source" : "Add Income Source"}
      description={
        incomeSource?.id ? "Update your income source details." : "Add a new source of income to track your earnings."
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <form id="income-source-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Income Source Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Salary, Freelance Work"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={(value) => setFrequency(value as IncomeSource["frequency"])}>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryDate">Entry Date</Label>
          <Input id="entryDate" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details about this income source"
            className="min-h-[80px]"
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
                {incomeSource ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{incomeSource ? "Update" : "Add"} Income Source</>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
