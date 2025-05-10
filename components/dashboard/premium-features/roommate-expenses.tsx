"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, DollarSign } from "lucide-react"
import { RoommateExpenseForm } from "@/components/forms/roommate-expense-form"
import { SettleUpForm } from "@/components/forms/settle-up-form"

export function RoommateExpenses() {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [isSettleUpFormOpen, setIsSettleUpFormOpen] = useState(false)

  const roommates = [
    {
      id: "1",
      name: "Alex",
      amount: 28.5,
    },
    {
      id: "2",
      name: "Jamie",
      amount: 17.25,
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roommate Expenses</CardTitle>
              <CardDescription>Track and split shared expenses</CardDescription>
            </div>
            <Badge className="bg-blue-500">
              <Users className="mr-1 h-3 w-3" /> Student Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Current Balance</h4>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">You're owed: $45.75</p>
                <p className="text-xs text-muted-foreground">From 2 roommates</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Alex" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Alex owes you</p>
                    <p className="text-xs text-muted-foreground">For utilities and groceries</p>
                  </div>
                </div>
                <p className="font-medium text-green-600">$28.50</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Jamie" />
                    <AvatarFallback>JM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Jamie owes you</p>
                    <p className="text-xs text-muted-foreground">For internet and rent</p>
                  </div>
                </div>
                <p className="font-medium text-green-600">$17.25</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => setIsExpenseFormOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Expense
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsSettleUpFormOpen(true)}>
                <DollarSign className="h-4 w-4 mr-1" /> Settle Up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoommateExpenseForm isOpen={isExpenseFormOpen} onClose={() => setIsExpenseFormOpen(false)} />
      <SettleUpForm isOpen={isSettleUpFormOpen} onClose={() => setIsSettleUpFormOpen(false)} roommates={roommates} />
    </>
  )
}
