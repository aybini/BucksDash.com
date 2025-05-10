"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/dashboard/bills-calendar"
import { BillsList } from "@/components/dashboard/bills-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptions, type Subscription } from "@/lib/firebase-service"

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && !loading && !user) {
      router.push("/login")
    }
  }, [hasMounted, loading, user])

  useEffect(() => {
    async function fetchSubscriptions() {
      if (!user) return

      setIsLoading(true)
      try {
        const fetchedSubscriptions = await getSubscriptions(user.uid)
        setSubscriptions(fetchedSubscriptions)
      } catch (error) {
        console.error("Error fetching subscriptions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  if (!hasMounted || loading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      
    )
  }

  return (
    
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Bills & Calendar</h2>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bills Calendar</CardTitle>
                <CardDescription>View and manage your upcoming bills and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar subscriptions={subscriptions} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bills & Payments</CardTitle>
                <CardDescription>Manage your recurring bills and one-time payments</CardDescription>
              </CardHeader>
              <CardContent>
                <BillsList subscriptions={subscriptions} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    
  )
}
