"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

export function MonthlySpendingChart({ transactions }) {
  const [chartData, setChartData] = useState([])
  const [topCategories, setTopCategories] = useState([])

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([])
      setTopCategories([])
      return
    }

    // Filter for expense transactions only
    const expenses = transactions.filter((t) => t.type === "expense")

    // Find top 5 categories by total amount
    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category || "Uncategorized"
      if (!acc[category]) acc[category] = 0
      acc[category] += Number(transaction.amount) || 0
      return acc
    }, {})

    const top5Categories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category)

    setTopCategories(top5Categories)

    // Group transactions by month and category
    const monthlyData = expenses.reduce((acc, transaction) => {
      // Convert Firestore timestamp to Date if needed
      const date = transaction.date instanceof Date ? transaction.date : transaction.date?.toDate?.() || new Date()

      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const category = transaction.category || "Uncategorized"

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          displayMonth: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          total: 0,
        }

        // Initialize all top categories with 0
        top5Categories.forEach((cat) => {
          acc[monthYear][cat] = 0
        })
      }

      // Add to category total if it's a top category
      if (top5Categories.includes(category)) {
        acc[monthYear][category] += Number(transaction.amount) || 0
      }

      // Add to monthly total
      acc[monthYear].total += Number(transaction.amount) || 0

      return acc
    }, {})

    // Convert to array and sort by month
    const data = Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month))

    setChartData(data)
  }, [transactions])

  // Colors for the chart lines
  const categoryColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A259FF"]

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="font-medium text-gray-700">Total: {formatCurrency(payload[0].value)}</p>
          <div className="mt-2">
            {payload.slice(1).map((entry, index) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending Trends</CardTitle>
        <CardDescription>Track your spending patterns over time by category</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">No expense data available for the selected period.</p>
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayMonth" />
                <YAxis
                  tickFormatter={(value) => `$${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Expenses"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                {topCategories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={categoryColors[index % categoryColors.length]}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
