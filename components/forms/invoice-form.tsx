"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"

interface InvoiceFormProps {
  isOpen: boolean
  onClose: () => void
}

export function InvoiceForm({ isOpen, onClose }: InvoiceFormProps) {
  const [client, setClient] = useState("")
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 30))
  const [items, setItems] = useState([{ description: "", amount: "" }])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addItem = () => {
    setItems([...items, { description: "", amount: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const amount = Number.parseFloat(item.amount) || 0
        return sum + amount
      }, 0)
      .toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Invoice created",
        description: "Your invoice has been created successfully.",
      })

      // Reset form and close modal
      setClient("")
      setInvoiceDate(new Date())
      setDueDate(addDays(new Date(), 30))
      setItems([{ description: "", amount: "" }])
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Create Invoice"
      description="Create a new invoice for your client."
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="invoice-form" className="bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client">Client Name</Label>
          <Input
            id="client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="e.g., Acme Inc."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !invoiceDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate ? format(invoiceDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={invoiceDate}
                  onSelect={(date) => date && setInvoiceDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Invoice Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 px-2">
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  required
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => updateItem(index, "amount", e.target.value)}
                  required
                  className="w-24"
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-xl font-bold">${calculateTotal()}</div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
