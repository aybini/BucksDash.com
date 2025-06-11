"use client"

import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SubscriptionsList } from "@/components/subscriptions/subscriptions-list"

export default function SubscriptionsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            className="group relative overflow-hidden border-primary/20 bg-background shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:shadow-md"
            asChild
          >
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium">Back to Dashboard</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Track and manage all your recurring bills in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsList />
        </CardContent>
      </Card>
    </>
  )
}
