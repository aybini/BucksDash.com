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
import { Checkbox } from "@/components/ui/checkbox"

interface RoommateExpenseFormProps {
  isOpen: boolean
  onClose: () => void
}

export function RoommateExpenseForm({ isOpen, onClose }: RoommateExpenseFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [paidBy, setPaidBy] = useState("you")
  const [roommates, setRoommates] = useState([
    { id: "1", name: "Alex", included: true },
    { id: "2", name: "Jamie", included: true },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleRoommate = (id: string) => {
    setRoommates(
      roommates.map((roommate) => (roommate.id === id ? { ...roommate, included: !roommate.included } : roommate)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Expense added",
        description: "Your roommate expense has been added successfully.",
      })

      // Reset form and close modal
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date())
      setPaidBy("you")
      setRoommates(roommates.map((r) => ({ ...r, included: true })))
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Add Roommate Expense"
      description="Track and split expenses with your roommates."
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="roommate-expense-form"
            className="bg-rose-600 hover:bg-rose-700"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      }
    >
      <form id="roommate-expense-form" onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Groceries"
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
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
              <SelectItem value="household">Household Items</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidBy">Paid By</Label>
          <Select value={paidBy} onValueChange={setPaidBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select who paid" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="you">You</SelectItem>
              {roommates.map((roommate) => (
                <SelectItem key={roommate.id} value={roommate.id}>
                  {roommate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Split With</Label>
          <div className="space-y-2">
            {roommates.map((roommate) => (
              <div key={roommate.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`roommate-${roommate.id}`}
                  checked={roommate.included}
                  onCheckedChange={() => toggleRoommate(roommate.id)}
                />
                <Label htmlFor={`roommate-${roommate.id}`} className="text-sm font-normal">
                  {roommate.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="text-sm font-medium mb-2">Split Preview</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>You</span>
              <span>
                ${(Number.parseFloat(amount || "0") / (roommates.filter((r) => r.included).length + 1)).toFixed(2)}
              </span>
            </div>
            {roommates
              .filter((r) => r.included)
              .map((roommate) => (
                <div key={roommate.id} className="flex justify-between">
                  <span>{roommate.name}</span>
                  <span>
                    ${(Number.parseFloat(amount || "0") / (roommates.filter((r) => r.included).length + 1)).toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
