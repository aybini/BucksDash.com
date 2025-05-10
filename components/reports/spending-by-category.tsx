"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie } from "recharts"

// Define a set of colors that work well together
const COLORS = [
  "#4361ee",
  "#3a0ca3",
  "#7209b7",
  "#f72585",
  "#4cc9f0",
  "#4895ef",
  "#560bad",
  "#f15bb5",
  "#00bbf9",
  "#00f5d4",
]

export function SpendingByCategory({ transactions }) {
  const [chartData, setChartData] = useState([])
  const [totalSpending, setTotalSpending] = useState(0)
  const [viewType, setViewType] = useState("bar")

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setChartData([])
      setTotalSpending(0)
      return
    }

    // Filter for expense transactions only
    const expenses = transactions.filter((t) => t.type === "expense")

    // Calculate total spending
    const total = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    setTotalSpending(total)

    // Group by category and calculate totals
    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category || "Uncategorized"
      if (!acc[category]) acc[category] = 0
      acc[category] += Number(transaction.amount) || 0
      return acc
    }, {})

    // Convert to array format for the chart
    let data = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value),
        percentage: total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value) // Sort by value descending

    // If there are more than 7 categories, group the smallest ones into "Other"
    if (data.length > 7) {
      const topCategories = data.slice(0, 6)
      const otherCategories = data.slice(6)

      const otherTotal = otherCategories.reduce((sum, item) => sum + item.value, 0)
      const otherPercentage = total > 0 ? ((otherTotal / total) * 100).toFixed(1) : 0

      data = [
        ...topCategories,
        {
          name: "Other",
          value: otherTotal,
          percentage: otherPercentage,
          isGroup: true,
          items: otherCategories,
        },
      ]
    }

    setChartData(data)
  }, [transactions])

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage}% of total</p>
        </div>
      )
    }
    return null
  }

  // Format the x-axis labels for currency
  const formatXAxis = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value}`
  }

  // Truncate long category names
  const truncateName = (name, maxLength = 14) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Total: {formatCurrency(totalSpending)}</CardDescription>
          </div>
          <Tabs value={viewType} onValueChange={setViewType} className="w-[120px]">
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="bar" className="text-xs">
                Bar
              </TabsTrigger>
              <TabsTrigger value="pie" className="text-xs">
                Pie
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No expense data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="h-[300px] mt-2">
              {viewType === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={formatXAxis} fontSize={12} />
                    <YAxis type="category" dataKey="name" width={100} tickFormatter={truncateName} fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <LabelList
                        dataKey="percentage"
                        position="right"
                        formatter={(value) => `${value}%`}
                        style={{ fontSize: "12px", fill: "#888" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percentage }) => `${truncateName(name, 10)} (${percentage}%)`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-4 space-y-1">
              <h4 className="text-sm font-medium mb-2">Top Categories</h4>
              <div className="max-h-[150px] overflow-y-auto pr-2">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-1 border-b border-border/40 last:border-0"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm truncate max-w-[150px]" title={item.name}>
                        {item.name}
                        {item.isGroup && (
                          <span className="text-xs text-muted-foreground ml-1">({item.items.length} categories)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                      <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
