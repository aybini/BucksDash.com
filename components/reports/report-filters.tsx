"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ReportFiltersProps {
  dateRange: { startDate: Date; endDate: Date }
  onDateRangeChange: (newRange: { startDate: Date; endDate: Date }) => void
}

export function ReportFilters({ dateRange, onDateRangeChange }: ReportFiltersProps) {
  const [date, setDate] = useState({
    from: dateRange.startDate,
    to: dateRange.endDate,
  })

  // Predefined date ranges
  const handlePredefinedRange = (range: string) => {
    const now = new Date()
    let from, to

    switch (range) {
      case "7days":
        from = new Date(now)
        from.setDate(now.getDate() - 7)
        to = now
        break
      case "30days":
        from = new Date(now)
        from.setDate(now.getDate() - 30)
        to = now
        break
      case "90days":
        from = new Date(now)
        from.setDate(now.getDate() - 90)
        to = now
        break
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = now
        break
      case "lastMonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "thisYear":
        from = new Date(now.getFullYear(), 0, 1)
        to = now
        break
      default:
        return
    }

    setDate({ from, to })
    onDateRangeChange({ startDate: from, endDate: to })
  }

  // Apply custom date range
  const handleApplyRange = () => {
    if (date.from && date.to) {
      onDateRangeChange({
        startDate: date.from,
        endDate: date.to,
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Date Range</p>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !date.from && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                  <div className="flex items-center justify-end gap-2 p-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setDate({ from: undefined, to: undefined })}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={handleApplyRange}>
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">&nbsp;</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePredefinedRange("7days")}>
                Last 7 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePredefinedRange("30days")}>
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePredefinedRange("thisMonth")}>
                This Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePredefinedRange("lastMonth")}>
                Last Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePredefinedRange("thisYear")}>
                This Year
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
