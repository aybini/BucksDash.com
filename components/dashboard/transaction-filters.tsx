"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  types: string[]
}

interface TransactionFiltersProps {
  isOpen: boolean
  onClose: () => void
  onFilter: (filters: TransactionFilters) => void
  initialFilters?: TransactionFilters
}

export function TransactionFilters({ isOpen, onClose, onFilter, initialFilters }: TransactionFiltersProps) {
  const [startDate, setStartDate] = useState<string>(initialFilters?.startDate || "")
  const [endDate, setEndDate] = useState<string>(initialFilters?.endDate || "")
  const [minAmount, setMinAmount] = useState<string>(initialFilters?.minAmount?.toString() || "")
  const [maxAmount, setMaxAmount] = useState<string>(initialFilters?.maxAmount?.toString() || "")
  const [showIncome, setShowIncome] = useState<boolean>(initialFilters?.types.includes("income") ?? true)
  const [showExpenses, setShowExpenses] = useState<boolean>(initialFilters?.types.includes("expense") ?? true)

  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setMinAmount("")
    setMaxAmount("")
    setShowIncome(true)
    setShowExpenses(true)
  }

  const handleApplyFilters = () => {
    const types: string[] = []
    if (showIncome) types.push("income")
    if (showExpenses) types.push("expense")

    onFilter({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minAmount: minAmount ? Number.parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? Number.parseFloat(maxAmount) : undefined,
      types,
    })
    onClose()
  }

  return (
    <Modal
      title="Filter Transactions"
      description="Filter your transactions by date range and amount."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Date Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">From</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">To</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Amount Range Filter */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Amount Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Min Amount ($)</Label>
              <Input
                id="min-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">Max Amount ($)</Label>
              <Input
                id="max-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Any"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Transaction Type Filter */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Transaction Type</h3>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-income"
                checked={showIncome}
                onCheckedChange={(checked) => setShowIncome(checked === true)}
              />
              <Label htmlFor="show-income">Income</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-expenses"
                checked={showExpenses}
                onCheckedChange={(checked) => setShowExpenses(checked === true)}
              />
              <Label htmlFor="show-expenses">Expenses</Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClearFilters} type="button">
            Clear All
          </Button>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} className="bg-rose-600 hover:bg-rose-700" type="button">
            Apply Filters
          </Button>
        </div>
      </div>
    </Modal>
  )
}
