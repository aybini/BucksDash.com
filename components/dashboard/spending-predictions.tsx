"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample data - in a real app, this would come from your backend
const predictedExpenses = [
  { month: "Jan", actual: 2400, predicted: 2400 },
  { month: "Feb", actual: 2100, predicted: 2100 },
  { month: "Mar", actual: 2800, predicted: 2800 },
  { month: "Apr", actual: 2700, predicted: 2700 },
  { month: "May", actual: 2900, predicted: 2900 },
  { month: "Jun", actual: 3100, predicted: 3100 },
  { month: "Jul", actual: null, predicted: 3300 },
  { month: "Aug", actual: null, predicted: 3500 },
  { month: "Sep", actual: null, predicted: 3200 },
]

const categoryPredictions = [
  {
    category: "Groceries",
    currentSpend: 420,
    predictedSpend: 480,
    trend: "up",
    message: "Your grocery spending is trending 14% higher than last month",
  },
  {
    category: "Entertainment",
    currentSpend: 180,
    predictedSpend: 150,
    trend: "down",
    message: "Your entertainment spending is trending 17% lower than last month",
  },
  {
    category: "Transportation",
    currentSpend: 150,
    predictedSpend: 200,
    trend: "up",
    message: "Your transportation costs are expected to increase by 33%",
  },
  {
    category: "Dining Out",
    currentSpend: 350,
    predictedSpend: 400,
    trend: "up",
    message: "Your dining out expenses are trending 14% higher than usual",
  },
]

export function SpendingPredictions() {
  const [timeframe, setTimeframe] = useState("3months")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-rose-600" />
          Spending Predictions
        </CardTitle>
        <CardDescription>
          AI-powered predictions of your future expenses based on your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Spending Forecast</TabsTrigger>
            <TabsTrigger value="categories">Category Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="flex justify-end space-x-2 mb-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-xs rounded border px-2 py-1"
              >
                <option value="3months">Next 3 Months</option>
                <option value="6months">Next 6 Months</option>
                <option value="12months">Next 12 Months</option>
              </select>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictedExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#8884d8"
                    name="Actual Spending"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#82ca9d"
                    name="Predicted Spending"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              <p>
                <span className="font-medium">Prediction Method:</span> Our AI analyzes your past 6 months of spending
                patterns, recurring bills, and seasonal trends to forecast future expenses.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {categoryPredictions.map((item) => (
                <Card key={item.category} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{item.category}</CardTitle>
                      <Badge
                        variant={item.trend === "up" ? "destructive" : "default"}
                        className={item.trend === "up" ? "bg-red-500" : "bg-green-500"}
                      >
                        {item.trend === "up" ? "↑" : "↓"} Trend
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current: ${item.currentSpend}</span>
                      <span className="text-sm font-medium">Predicted: ${item.predictedSpend}</span>
                    </div>
                    <div className="flex items-start mt-2 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-amber-500" />
                      <p>{item.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
