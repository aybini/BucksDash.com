"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

export function AIInsights() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Financial Insights</CardTitle>
            <CardDescription>Personalized recommendations based on your spending patterns</CardDescription>
          </div>
          <Badge className="bg-rose-600">
            <Sparkles className="mr-1 h-3 w-3" /> Premium
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Savings Opportunity</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You've spent $125 on coffee shops this month. Setting a budget of $100 could save you $300 annually.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">Subscription Alert</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Netflix subscription increased by $2 last month. Consider switching to the ad-supported plan to
                  save $60/year.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Budget Warning</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your dining out category is 85% spent with 10 days left in the month. Consider cooking at home this
                  week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
