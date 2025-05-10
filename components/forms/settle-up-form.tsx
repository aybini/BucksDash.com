"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SettleUpFormProps {
  isOpen: boolean
  onClose: () => void
  roommates: {
    id: string
    name: string
    amount: number
  }[]
}

export function SettleUpForm({ isOpen, onClose, roommates }: SettleUpFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [roommateId, setRoommateId] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("cash")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Payment recorded",
        description: "The payment has been recorded successfully.",
      })

      // Reset form and close modal
      setRoommateId("")
      setAmount("")
      setMethod("cash")
      setDate(new Date())
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Set default amount when roommate is selected
  const handleRoommateChange = (id: string) => {
    setRoommateId(id)
    const selectedRoommate = roommates.find((r) => r.id === id)
    if (selectedRoommate) {
      setAmount(Math.abs(selectedRoommate.amount).toFixed(2))
    }
  }

  return (
    <Modal
      title="Settle Up"
      description="Record a payment to or from a roommate."
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="settle-up-form" className="bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      }
    >
      <form id="settle-up-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roommate">Roommate</Label>
          <Select value={roommateId} onValueChange={handleRoommateChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select roommate" />
            </SelectTrigger>
            <SelectContent>
              {roommates.map((roommate) => (
                <SelectItem key={roommate.id} value={roommate.id}>
                  {roommate.name} (
                  {roommate.amount > 0
                    ? `owes you $${roommate.amount.toFixed(2)}`
                    : `you owe $${Math.abs(roommate.amount).toFixed(2)}`}
                  )
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label htmlFor="method">Payment Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="venmo">Venmo</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="zelle">Zelle</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Modal>
  )
}
