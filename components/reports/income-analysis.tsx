"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

export function IncomeAnalysis({ transactions }) {
  const [incomeData, setIncomeData] = useState([])
  const [incomeBySource, setIncomeBySource] = useState([])
  const [incomeOverTime, setIncomeOverTime] = useState([])
  const [activeTab, setActiveTab] = useState("sources")

  // Colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setIncomeData([])
      setIncomeBySource([])
      setIncomeOverTime([])
      return
    }

    // Filter to only include income transactions
    const incomeTransactions = transactions.filter((t) => t.type === "income")

    if (incomeTransactions.length === 0) {
      setIncomeData([])
      setIncomeBySource([])
      setIncomeOverTime([])
      return
    }

    // Process income by source/category
    const sourceMap = incomeTransactions.reduce((acc, transaction) => {
      const category = transaction.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          count: 0,
        }
      }
      acc[category].value += Number(transaction.amount) || 0
      acc[category].count += 1
      return acc
    }, {})

    // Convert to array and sort by amount
    const sourceData = Object.values(sourceMap).sort((a, b) => b.value - a.value)

    // Calculate percentages
    const totalIncome = sourceData.reduce((sum, item) => sum + item.value, 0)
    const sourcesWithPercentage = sourceData.map((item) => ({
      ...item,
      percentage: ((item.value / totalIncome) * 100).toFixed(1),
    }))

    setIncomeBySource(sourcesWithPercentage)

    // Process income over time (monthly)
    const monthlyData = incomeTransactions.reduce((acc, transaction) => {
      // Convert Firestore timestamp to Date if needed
      const date = transaction.date instanceof Date ? transaction.date : transaction.date?.toDate?.() || new Date()

      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          total: 0,
          displayMonth: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          sources: {},
        }
      }

      const category = transaction.category || "Uncategorized"
      if (!acc[monthYear].sources[category]) {
        acc[monthYear].sources[category] = 0
      }

      acc[monthYear].sources[category] += Number(transaction.amount) || 0
      acc[monthYear].total += Number(transaction.amount) || 0

      return acc
    }, {})

    // Convert to array and sort by month
    const timeData = Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month))

    // Calculate moving average (3-month)
    const timeDataWithAverage = timeData.map((item, index, array) => {
      let movingAvg = item.total
      let count = 1

      // Look back up to 2 months if available
      for (let i = 1; i <= 2; i++) {
        if (index - i >= 0) {
          movingAvg += array[index - i].total
          count++
        }
      }

      return {
        ...item,
        movingAverage: movingAvg / count,
      }
    })

    setIncomeOverTime(timeDataWithAverage)

    // Prepare data for the main income analysis
    setIncomeData({
      totalIncome: totalIncome,
      averageMonthlyIncome: timeData.length > 0 ? totalIncome / timeData.length : 0,
      topSource: sourcesWithPercentage.length > 0 ? sourcesWithPercentage[0] : null,
      monthlyData: timeData,
      sourceData: sourcesWithPercentage,
    })
  }, [transactions])

  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p>{`${payload[0].payload.percentage}% of income`}</p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for the time charts
  const CustomTimeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">Income: {formatCurrency(payload[0].value)}</p>
          {payload.length > 1 && <p className="text-purple-600">3-Month Avg: {formatCurrency(payload[1].value)}</p>}
        </div>
      )
    }
    return null
  }

  if (!transactions || transactions.length === 0 || !incomeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Analysis</CardTitle>
          <CardDescription>Breakdown of your income sources and trends.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No income data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Analysis</CardTitle>
        <CardDescription>Breakdown of your income sources and trends over time.</CardDescription>
      </CardHeader>
      <CardContent>
        {incomeBySource.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No income data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold">{formatCurrency(incomeData.totalIncome || 0)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Monthly Average</p>
                <p className="text-2xl font-bold">{formatCurrency(incomeData.averageMonthlyIncome || 0)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Top Income Source</p>
                <p className="text-2xl font-bold">{incomeData.topSource?.name || "None"}</p>
                <p className="text-sm">{incomeData.topSource ? `${incomeData.topSource.percentage}% of total` : ""}</p>
              </div>
            </div>

            <Tabs defaultValue="sources" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sources">Income Sources</TabsTrigger>
                <TabsTrigger value="trends">Income Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="space-y-4 pt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeBySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeBySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Income Sources Breakdown</h4>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Source</th>
                          <th className="text-right py-2">Amount</th>
                          <th className="text-right py-2">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomeBySource.map((source, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 flex items-center">
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></span>
                              {source.name}
                            </td>
                            <td className="text-right py-2">{formatCurrency(source.value)}</td>
                            <td className="text-right py-2">{source.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4 pt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={incomeOverTime}
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
                        tickFormatter={(value) =>
                          `$${Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                        }
                      />
                      <Tooltip content={<CustomTimeTooltip />} />
                      <Legend />
                      <Bar dataKey="total" name="Monthly Income" fill="#0088FE" />
                      <Line
                        type="monotone"
                        dataKey="movingAverage"
                        name="3-Month Average"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Monthly Income Breakdown</h4>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Month</th>
                          <th className="text-right py-2">Income</th>
                          <th className="text-right py-2">3-Month Avg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomeOverTime.map((month, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{month.displayMonth}</td>
                            <td className="text-right py-2">{formatCurrency(month.total)}</td>
                            <td className="text-right py-2">{formatCurrency(month.movingAverage)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
