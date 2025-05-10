"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TransactionForm } from "@/components/forms/transaction-form"

const transactions = [
  {
    id: "1",
    date: "2023-07-15",
    description: "Grocery Store",
    category: "Food",
    amount: -56.32,
    status: "completed",
  },
  {
    id: "2",
    date: "2023-07-14",
    description: "Salary Deposit",
    category: "Income",
    amount: 2500.0,
    status: "completed",
  },
  {
    id: "3",
    date: "2023-07-12",
    description: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    status: "completed",
  },
  {
    id: "4",
    date: "2023-07-10",
    description: "Gas Station",
    category: "Transportation",
    amount: -45.5,
    status: "completed",
  },
  {
    id: "5",
    date: "2023-07-01",
    description: "Rent Payment",
    category: "Housing",
    amount: -1200.0,
    status: "completed",
  },
]

export function RecentTransactions() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recent financial activity.</CardDescription>
          </div>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right ${transaction.amount > 0 ? "text-green-600" : ""}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TransactionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  )
}
