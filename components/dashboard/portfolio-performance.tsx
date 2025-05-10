"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Sample data - in a real app, this would come from your backend
const monthlyBudgetData = [
  { month: "Jan", budget: 3000, actual: 2800, variance: -200 },
  { month: "Feb", budget: 3000, actual: 3200, variance: 200 },
  { month: "Mar", budget: 3000, actual: 3100, variance: 100 },
  { month: "Apr", budget: 3200, actual: 3400, variance: 200 },
  { month: "May", budget: 3200, actual: 3600, variance: 400 },
  { month: "Jun", budget: 3200, actual: 3000, variance: -200 },
]

const categoryPerformanceData = [
  { name: "Groceries", budget: 500, actual: 480, variance: -20, status: "under" },
  { name: "Dining", budget: 300, actual: 420, variance: 120, status: "over" },
  { name: "Transport", budget: 200, actual: 180, variance: -20, status: "under" },
  { name: "Shopping", budget: 200, actual: 350, variance: 150, status: "over" },
  { name: "Utilities", budget: 250, actual: 230, variance: -20, status: "under" },
  { name: "Entertainment", budget: 150, actual: 200, variance: 50, status: "over" },
]

const trendData = [
  { month: "Jan", spending: 2800 },
  { month: "Feb", spending: 3200 },
  { month: "Mar", spending: 3100 },
  { month: "Apr", spending: 3400 },
  { month: "May", spending: 3600 },
  { month: "Jun", spending: 3000 },
]

export function PortfolioPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-rose-600" />
          Budget Performance
        </CardTitle>
        <CardDescription>Track how your actual spending compares to your budget</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Monthly Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Spending Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="actual" name="Actual Spending" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Average Monthly Budget</div>
                  <div className="text-2xl font-bold">$3,100</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Average Spending</div>
                  <div className="text-2xl font-bold">$3,183</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Average Variance</div>
                  <div className="text-2xl font-bold text-amber-500">+$83</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {categoryPerformanceData.map((category) => (
                <Card key={category.name}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <Badge
                        variant={category.status === "over" ? "destructive" : "default"}
                        className={category.status === "over" ? "bg-red-500" : "bg-green-500"}
                      >
                        {category.status === "over" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {category.status === "over" ? "Over Budget" : "Under Budget"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Budget: ${category.budget}</span>
                      <span className="text-sm font-medium">Actual: ${category.actual}</span>
                    </div>
                    <div className="flex items-start mt-2">
                      {category.status === "over" ? (
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      <p className="text-sm">
                        {category.status === "over"
                          ? `You're $${Math.abs(category.variance)} over your ${category.name.toLowerCase()} budget`
                          : `You're $${Math.abs(category.variance)} under your ${category.name.toLowerCase()} budget`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
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
                    dataKey="spending"
                    name="Monthly Spending"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Spending Insights</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <TrendingUp className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                    <span className="text-sm">Your spending increased by 28.6% from January to May</span>
                  </li>
                  <li className="flex items-start">
                    <TrendingDown className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span className="text-sm">June spending decreased by 16.7% compared to May</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                    <span className="text-sm">Your highest spending month was May at $3,600</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
