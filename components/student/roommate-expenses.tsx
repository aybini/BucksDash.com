"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check, DollarSign, Plus, UserPlus, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

// Types for our component
interface Roommate {
  id: string
  name: string
  avatarUrl?: string
}

interface Expense {
  id: string
  description: string
  amount: number
  date: Date
  paidBy: string // roommate id
  splitWith: string[] // roommate ids
  settled: boolean
  settledBy: string[] // roommate ids who have settled
}

export function RoommateExpenses() {
  const { toast } = useToast()

  // Sample roommates data (in a real app, this would come from an API)
  const [roommates, setRoommates] = useState<Roommate[]>([
    { id: "1", name: "You", avatarUrl: "/placeholder.svg?height=40&width=40" },
    { id: "2", name: "Alex", avatarUrl: "/placeholder.svg?height=40&width=40" },
    { id: "3", name: "Jordan", avatarUrl: "/placeholder.svg?height=40&width=40" },
  ])

  // Sample expenses data (in a real app, this would come from an API)
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Groceries",
      amount: 75.5,
      date: new Date("2023-03-15"),
      paidBy: "1",
      splitWith: ["1", "2", "3"],
      settled: false,
      settledBy: ["1"],
    },
    {
      id: "2",
      description: "Utilities",
      amount: 120.0,
      date: new Date("2023-03-10"),
      paidBy: "2",
      splitWith: ["1", "2", "3"],
      settled: false,
      settledBy: ["2"],
    },
  ])

  // State for new expense form
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "1", // Default to current user
    splitWith: [] as string[],
  })

  // State for new roommate form
  const [newRoommate, setNewRoommate] = useState({
    name: "",
  })

  // State for dialogs
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [addRoommateOpen, setAddRoommateOpen] = useState(false)

  // Handle adding a new expense
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || newExpense.splitWith.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select at least one roommate to split with.",
        variant: "destructive",
      })
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: Number.parseFloat(newExpense.amount),
      date: new Date(),
      paidBy: newExpense.paidBy,
      splitWith: newExpense.splitWith,
      settled: false,
      settledBy: [newExpense.paidBy], // The person who paid is automatically settled
    }

    setExpenses([...expenses, expense])
    setNewExpense({
      description: "",
      amount: "",
      paidBy: "1",
      splitWith: [],
    })
    setAddExpenseOpen(false)

    toast({
      title: "Expense added",
      description: "Your expense has been added successfully.",
    })
  }

  // Handle adding a new roommate
  const handleAddRoommate = () => {
    if (!newRoommate.name) {
      toast({
        title: "Missing information",
        description: "Please enter a name for your roommate.",
        variant: "destructive",
      })
      return
    }

    const roommate: Roommate = {
      id: Date.now().toString(),
      name: newRoommate.name,
      avatarUrl: "/placeholder.svg?height=40&width=40",
    }

    setRoommates([...roommates, roommate])
    setNewRoommate({ name: "" })
    setAddRoommateOpen(false)

    toast({
      title: "Roommate added",
      description: `${roommate.name} has been added to your roommates.`,
    })
  }

  // Handle settling up an expense
  const handleSettleUp = (expenseId: string) => {
    setExpenses(
      expenses.map((expense) => {
        if (expense.id === expenseId) {
          // Add current user to settled list
          const newSettledBy = [...expense.settledBy, "1"]

          // Check if all roommates have settled
          const allSettled = expense.splitWith.every((roommateId) => newSettledBy.includes(roommateId))

          return {
            ...expense,
            settledBy: newSettledBy,
            settled: allSettled,
          }
        }
        return expense
      }),
    )

    toast({
      title: "Expense settled",
      description: "You've marked this expense as settled for your part.",
    })
  }

  // Toggle roommate selection for expense splitting
  const toggleRoommateSplit = (roommateId: string) => {
    if (newExpense.splitWith.includes(roommateId)) {
      setNewExpense({
        ...newExpense,
        splitWith: newExpense.splitWith.filter((id) => id !== roommateId),
      })
    } else {
      setNewExpense({
        ...newExpense,
        splitWith: [...newExpense.splitWith, roommateId],
      })
    }
  }

  // Calculate what each person owes for an expense
  const calculateShare = (expense: Expense) => {
    const totalPeople = expense.splitWith.length
    return totalPeople > 0 ? expense.amount / totalPeople : expense.amount
  }

  // Get roommate name by ID
  const getRoommateName = (id: string) => {
    const roommate = roommates.find((r) => r.id === id)
    return roommate ? roommate.name : "Unknown"
  }

  // Check if current user has settled an expense
  const hasUserSettled = (expense: Expense) => {
    return expense.settledBy.includes("1")
  }

  // Check if current user needs to settle an expense
  const needsToSettle = (expense: Expense) => {
    return expense.splitWith.includes("1") && expense.paidBy !== "1" && !hasUserSettled(expense)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Roommate Expenses</span>
          </div>
          <div className="flex gap-2">
            <Dialog open={addRoommateOpen} onOpenChange={setAddRoommateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1" aria-label="Add roommate">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Roommate</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a Roommate</DialogTitle>
                  <DialogDescription>Add a new roommate to split expenses with.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="roommate-name">Roommate Name</Label>
                    <Input
                      id="roommate-name"
                      value={newRoommate.name}
                      onChange={(e) => setNewRoommate({ name: e.target.value })}
                      placeholder="Enter roommate name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddRoommateOpen(false)}
                    aria-label="Cancel adding roommate"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoommate} aria-label="Add new roommate">
                    Add Roommate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1" aria-label="Add expense">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Expense</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add an Expense</DialogTitle>
                  <DialogDescription>Add a new expense to split with your roommates.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expense-description">Description</Label>
                    <Input
                      id="expense-description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="e.g., Groceries, Rent, Utilities"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expense-amount">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="expense-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="pl-8"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expense-paid-by">Paid By</Label>
                    <Select
                      value={newExpense.paidBy}
                      onValueChange={(value) => setNewExpense({ ...newExpense, paidBy: value })}
                    >
                      <SelectTrigger id="expense-paid-by">
                        <SelectValue placeholder="Select who paid" />
                      </SelectTrigger>
                      <SelectContent>
                        {roommates.map((roommate) => (
                          <SelectItem key={roommate.id} value={roommate.id}>
                            {roommate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Split With</Label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                      {roommates.map((roommate) => (
                        <Badge
                          key={roommate.id}
                          variant={newExpense.splitWith.includes(roommate.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleRoommateSplit(roommate.id)}
                        >
                          {roommate.name}
                          {newExpense.splitWith.includes(roommate.id) && <Check className="ml-1 h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddExpenseOpen(false)} aria-label="Cancel adding expense">
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense} aria-label="Add new expense">
                    Add Expense
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
        <CardDescription>
          Track and split expenses with your roommates. Add expenses, settle up, and keep everyone on the same page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses yet. Add your first expense to get started.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {expenses.map((expense) => (
                <Card key={expense.id} className={expense.settled ? "bg-muted/50" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{expense.description}</CardTitle>
                        <CardDescription>
                          {expense.date.toLocaleDateString()} • Paid by {getRoommateName(expense.paidBy)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${expense.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          ${calculateShare(expense).toFixed(2)} per person
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2">
                      {expense.splitWith.map((roommateId) => {
                        const isSettled = expense.settledBy.includes(roommateId)
                        return (
                          <Badge
                            key={roommateId}
                            variant={isSettled ? "default" : "outline"}
                            className={isSettled ? "bg-green-500 hover:bg-green-500/90" : ""}
                          >
                            {getRoommateName(roommateId)}
                            {isSettled && <Check className="ml-1 h-3 w-3" />}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {expense.settled ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-500/20"
                      >
                        All settled
                      </Badge>
                    ) : needsToSettle(expense) ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            aria-label={`Settle up ${calculateShare(expense).toFixed(2)} dollars`}
                          >
                            Settle Up (${calculateShare(expense).toFixed(2)})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Settle Up</AlertDialogTitle>
                            <AlertDialogDescription>
                              You're about to mark that you've paid ${calculateShare(expense).toFixed(2)} to{" "}
                              {getRoommateName(expense.paidBy)} for {expense.description}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSettleUp(expense.id)}>
                              Confirm Payment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : hasUserSettled(expense) ? (
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 border-blue-500/20"
                      >
                        You've settled
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10 border-yellow-500/20"
                      >
                        No action needed
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {roommates.length} roommates • {expenses.length} expenses
        </div>
        <Button variant="outline" size="sm" onClick={() => setAddExpenseOpen(true)} aria-label="Add new expense">
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </CardFooter>
    </Card>
  )
}
