"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { SubscriptionForm } from "@/components/forms/subscription-form"
import type { Subscription } from "@/lib/firebase-service"
import { isSameDay } from "date-fns"

interface CalendarProps {
  subscriptions: Subscription[]
  isLoading: boolean
}

export function Calendar({ subscriptions, isLoading }: CalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Function to get subscriptions due on a specific date
  const getSubscriptionsForDate = (date: Date | undefined) => {
    if (!date) return []

    return subscriptions.filter((subscription) => {
      const billingDate = new Date((subscription.nextBillingDate as any).toDate?.() || subscription.nextBillingDate)
      return isSameDay(billingDate, date)
    })
  }

  // Function to render the day contents in the calendar
  const renderDayContents = (day: Date) => {
    const subscriptionsOnDay = subscriptions.filter((subscription) => {
      const billingDate = new Date((subscription.nextBillingDate as any).toDate?.() || subscription.nextBillingDate)
      return isSameDay(billingDate, day)
    })

    return (
      <div className="relative h-full w-full">
        <div>{day.getDate()}</div>
        {subscriptionsOnDay.length > 0 && (
          <div className="absolute bottom-0 right-0">
            <Badge className="bg-rose-600">{subscriptionsOnDay.length}</Badge>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{date?.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
        <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading calendar data...</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              components={{
                DayContent: ({ date }) => renderDayContents(date),
              }}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Bills due on {date?.toLocaleDateString()}</h3>
            <div className="space-y-2">
              {getSubscriptionsForDate(date).length > 0 ? (
                getSubscriptionsForDate(date).map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <h4 className="font-medium">{subscription.name}</h4>
                      <p className="text-sm text-muted-foreground">{subscription.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${subscription.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No bills due on this date</p>
              )}
            </div>
          </div>
        </>
      )}

      <SubscriptionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  )
}
