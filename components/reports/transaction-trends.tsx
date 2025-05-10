"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

export function TransactionTrends({ transactions }) {
  const [chartData, setChartData] = useState([])
  const [metrics, setMetrics] = useState({
    avgTransaction: 0,
    largestExpense: { amount: 0, description: "" },
    largestIncome: { amount: 0, description: "" },
    transactionCount: 0,
  })

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([])
      setMetrics({
        avgTransaction: 0,
        largestExpense: { amount: 0, description: "" },
        largestIncome: { amount: 0, description: "" },
        transactionCount: 0,
      })
      return
    }

    // Calculate metrics
    const expenseTransactions = transactions.filter((t) => t.type === "expense")
    const incomeTransactions = transactions.filter((t) => t.type === "income")

    const totalExpenseAmount = expenseTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const avgTransaction = expenseTransactions.length > 0 ? totalExpenseAmount / expenseTransactions.length : 0

    // Find largest expense
    const largestExpense =
      expenseTransactions.length > 0
        ? expenseTransactions.reduce((max, t) => ((Number(t.amount) || 0) > (Number(max.amount) || 0) ? t : max), {
            amount: 0,
          })
        : { amount: 0, description: "None" }

    // Find largest income
    const largestIncome =
      incomeTransactions.length > 0
        ? incomeTransactions.reduce((max, t) => ((Number(t.amount) || 0) > (Number(max.amount) || 0) ? t : max), {
            amount: 0,
          })
        : { amount: 0, description: "None" }

    setMetrics({
      avgTransaction,
      largestExpense,
      largestIncome,
      transactionCount: transactions.length,
    })

    // Group transactions by day for the trend chart
    const dailyData = transactions.reduce((acc, transaction) => {
      // Convert Firestore timestamp to Date if needed
      const date = transaction.date instanceof Date ? transaction.date : transaction.date?.toDate?.() || new Date()

      const dateStr = date.toISOString().split("T")[0]

      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          displayDate: new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          income: 0,
          expenses: 0,
          balance: 0,
        }
      }

      if (transaction.type === "income") {
        acc[dateStr].income += Number(transaction.amount) || 0
      } else if (transaction.type === "expense") {
        acc[dateStr].expenses += Number(transaction.amount) || 0
      }

      return acc
    }, {})

    // Convert to array, sort by date, and calculate running balance
    let runningBalance = 0
    const data = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => {
        const dayBalance = day.income - day.expenses
        runningBalance += dayBalance
        return {
          ...day,
          balance: runningBalance,
        }
      })

    setChartData(data)
  }, [transactions])

  // Custom tooltip for the area chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-emerald-600">Income: {formatCurrency(payload[0].payload.income)}</p>
          <p className="text-red-600">Expenses: {formatCurrency(payload[0].payload.expenses)}</p>
          <p className={payload[0].value >= 0 ? "text-blue-600" : "text-red-600"}>
            Balance: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Trends</CardTitle>
        <CardDescription>Your financial balance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Average Transaction</p>
            <p className="text-xl font-medium">{formatCurrency(metrics.avgTransaction)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Largest Expense</p>
            <p className="text-xl font-medium">{formatCurrency(metrics.largestExpense.amount)}</p>
            <p className="text-xs text-muted-foreground truncate" title={metrics.largestExpense.description}>
              {metrics.largestExpense.description}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Largest Income</p>
            <p className="text-xl font-medium">{formatCurrency(metrics.largestIncome.amount)}</p>
            <p className="text-xs text-muted-foreground truncate" title={metrics.largestIncome.description}>
              {metrics.largestIncome.description}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Transaction Count</p>
            <p className="text-xl font-medium">{metrics.transactionCount}</p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No transaction data available for the selected period.</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis
                  tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#93c5fd" name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
