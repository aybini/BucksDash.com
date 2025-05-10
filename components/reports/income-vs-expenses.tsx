"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

export function IncomeVsExpenses({ transactions }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([])
      return
    }

    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      // Convert Firestore timestamp to Date if needed
      const date = transaction.date instanceof Date ? transaction.date : transaction.date?.toDate?.() || new Date()

      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          income: 0,
          expenses: 0,
          displayMonth: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        }
      }

      if (transaction.type === "income") {
        acc[monthYear].income += Number(transaction.amount) || 0
      } else if (transaction.type === "expense") {
        acc[monthYear].expenses += Number(transaction.amount) || 0
      }

      return acc
    }, {})

    // Convert to array and sort by month
    const data = Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .map((item) => ({
        ...item,
        savings: item.income - item.expenses,
      }))

    setChartData(data)
  }, [transactions])

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-emerald-600">Income: {formatCurrency(payload[0].value)}</p>
          <p className="text-red-600">Expenses: {formatCurrency(payload[1].value)}</p>
          <p className={payload[2].value >= 0 ? "text-blue-600" : "text-red-600"}>
            Net: {formatCurrency(payload[2].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Monthly comparison of your income and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No data available for the selected period.</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                <Bar dataKey="savings" name="Net Savings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
