"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSubscription } from "@/hooks/use-subscription"
import { getStripeDashboardSession } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { useEffect } from "react"

const BillingPage = async () => {
  const { toast } = useToast()
  const { isPro, subscription } = useSubscription()

  useEffect(() => {}, [])

  const manageSubscription = async () => {
    try {
      const session = await getStripeDashboardSession()

      redirect(session.url)
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="md:max-w-[600px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            {isPro ? "You are currently on the Pro plan." : "You are on the free plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Plan details</h3>
              <p className="text-sm text-muted-foreground">
                {isPro ? (
                  <>
                    You are currently on the Pro plan. Your subscription{" "}
                    {subscription?.status === "active" ? "is active" : "is not active"}.
                  </>
                ) : (
                  "You are on the free plan. Upgrade to the Pro plan to get unlimited access."
                )}
              </p>
            </div>
            <Button onClick={manageSubscription} variant="primary" size="sm">
              {isPro ? "Manage Subscription" : "Upgrade to Pro"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BillingPage
