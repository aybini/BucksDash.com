"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingDown, DollarSign, Calendar, CreditCard, PiggyBank } from "lucide-react"

// Sample data - in a real app, this would come from your backend based on user data
const tips = [
  {
    id: 1,
    title: "Reduce Your Dining Out Expenses",
    description:
      "You've spent $420 on dining out this month, which is 40% higher than last month. Try cooking at home more often to save money.",
    icon: TrendingDown,
    category: "Spending",
    action: "View Budget",
    actionLink: "/dashboard/budgets",
  },
  {
    id: 2,
    title: "Upcoming Bill Payment",
    description: "Your rent payment of $1,200 is due in 3 days. Make sure you have sufficient funds in your account.",
    icon: Calendar,
    category: "Bills",
    action: "View Calendar",
    actionLink: "/dashboard/calendar",
  },
  {
    id: 3,
    title: "Subscription Optimization",
    description:
      "You're paying for 5 streaming services totaling $65/month. Consider consolidating to save approximately $30/month.",
    icon: DollarSign,
    category: "Subscriptions",
    action: "View Subscriptions",
    actionLink: "/dashboard/subscriptions",
  },
  {
    id: 4,
    title: "Credit Card Interest Alert",
    description:
      "You paid $45 in credit card interest last month. Consider paying more than the minimum to reduce interest charges.",
    icon: CreditCard,
    category: "Debt",
    action: "View Debt",
    actionLink: "/dashboard/debt",
  },
  {
    id: 5,
    title: "Savings Goal Progress",
    description:
      "You're 35% of the way to your emergency fund goal. Increasing your monthly contribution by $50 would help you reach your goal 2 months sooner.",
    icon: PiggyBank,
    category: "Savings",
    action: "View Goals",
    actionLink: "/dashboard/goals",
  },
]

export function PersonalizedTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
          Personalized Financial Tips
        </CardTitle>
        <CardDescription>Recommendations based on your spending patterns and financial habits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.id} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                  <tip.icon className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{tip.title}</h4>
                    <Badge variant="outline">{tip.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-rose-600 mt-2"
                    onClick={() => (window.location.href = tip.actionLink)}
                  >
                    {tip.action} →
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
