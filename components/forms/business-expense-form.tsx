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

interface BusinessExpenseFormProps {
  isOpen: boolean
  onClose: () => void
}

export function BusinessExpenseForm({ isOpen, onClose }: BusinessExpenseFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Business expense added",
        description: "Your business expense has been added successfully.",
      })

      // Reset form and close modal
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date())
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add business expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Add Business Expense"
      description="Track expenses for your business or side hustle."
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="business-expense-form"
            className="bg-rose-600 hover:bg-rose-700"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Business Expense"}
          </Button>
        </div>
      }
    >
      <form id="business-expense-form" onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="e.g., Office supplies"
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
              <SelectItem value="office">Office Supplies</SelectItem>
              <SelectItem value="software">Software & Subscriptions</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="meals">Meals & Entertainment</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="services">Professional Services</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </Modal>
  )
}
