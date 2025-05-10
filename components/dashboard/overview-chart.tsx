"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import type { Transaction } from "@/lib/firebase-service"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth,
  format,
} from "date-fns"

interface ChartData {
  name: string
  income: number
  expenses: number
}

interface OverviewProps {
  transactions: Transaction[]
  timeframe: string
}

export function Overview({ transactions, timeframe = "month" }: OverviewProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    if (!transactions.length) {
      setChartData([])
      return
    }

    // Get date range based on timeframe
    const now = new Date()
    let start: Date
    let end: Date
    let intervalFunction: any
    let formatString: string
    let compareFunction: (date1: Date, date2: Date) => boolean

    switch (timeframe) {
      case "week":
        start = startOfWeek(now, { weekStartsOn: 1 }) // Start on Monday
        end = endOfWeek(now, { weekStartsOn: 1 })
        intervalFunction = eachDayOfInterval
        formatString = "EEE" // Mon, Tue, etc.
        compareFunction = isSameDay
        break
      case "year":
        start = startOfYear(now)
        end = endOfYear(now)
        intervalFunction = eachMonthOfInterval
        formatString = "MMM" // Jan, Feb, etc.
        compareFunction = isSameMonth
        break
      case "month":
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
        intervalFunction = eachWeekOfInterval
        formatString = "'Week' w" // Week 1, Week 2, etc.
        compareFunction = isSameWeek
        break
    }

    // Create intervals
    const intervals = intervalFunction({ start, end })

    // Create data points
    const dataPoints = intervals.map((interval: Date) => {
      // Filter transactions for this interval
      const intervalTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date((transaction.date as any).toDate?.() || transaction.date)
        return compareFunction(transactionDate, interval)
      })

      // Calculate totals
      let income = 0
      let expenses = 0

      intervalTransactions.forEach((transaction) => {
        if (transaction.type === "income") {
          income += transaction.amount
        } else {
          expenses += transaction.amount
        }
      })

      return {
        name: format(interval, formatString),
        income,
        expenses,
      }
    })

    setChartData(dataPoints)
  }, [transactions, timeframe])

  // Custom tooltip formatter
  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="h-full w-full">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              width={60}
            />
            <Tooltip
              formatter={formatTooltip}
              labelStyle={{ color: "#000" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No transaction data available for this {timeframe}</p>
        </div>
      )}
    </div>
  )
}
