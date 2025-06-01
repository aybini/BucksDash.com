"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function PricingPage() {
  const [planType, setPlanType] = useState("monthly")

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back to Dashboard */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-2 text-center">Choose Your Plan</h1>
      <p className="text-center text-muted-foreground mb-10">Flexible pricing for every financial journey.</p>
      <p className="text-center text-muted-foreground mb-10">More premium options coming soon..🏦</p>

      <div className="flex justify-center mb-10">
        <ToggleGroup type="single" value={planType} onValueChange={(val) => setPlanType(val || "monthly")}>
          <ToggleGroupItem value="monthly">One-Time Plan</ToggleGroupItem>
          {/*<ToggleGroupItem value="one-time">One-Time Access</ToggleGroupItem> */}
        </ToggleGroup>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto mb-16">
        {/* One-Time Card */}
        <Card className="border-2 border-green-500 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">One-Time Access</CardTitle>
            <CardDescription>Pay once, use forever</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">$5.99</div>
              <p className="text-muted-foreground">One-time payment</p>
            </div>
            <ul className="space-y-2 text-left">
            <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 💰 Income/Expense Tracking</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 📊 Budget Management with Due Dates</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 🎯 Financial Goal Setting</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 🔄 Transaction Importing</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 🏦 Income Source Registration</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 💳 Debt Management & Payment Options</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 📅 Subscription Tracking</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 🗓️ Bill Calendar & Reminders</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 📈 Financial Reports & Insights</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 📚 Educational Financial Content</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 💬 Community Support & Discussions</li>

            </ul>
          </CardContent>
          <div className="px-6 pt-4 pb-6 text-center">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </Card>

        {/* Premium Card 
        <Card className="border-2 border-rose-600 shadow-md relative">
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-rose-600 text-white">Best Value</Badge>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Premium Monthly</CardTitle>
            <CardDescription>Full access to everything</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-rose-600">$7.99</div>
              <p className="text-muted-foreground">per month</p>
            </div>
            <ul className="space-y-2 text-left">
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-rose-600" /> Everything in One-Time Plan</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-rose-600" /> Bank Syncing via Plaid</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-rose-600" /> AI-Powered Insights</li>
              <li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-rose-600" /> Access to Premium Community</li>
            </ul>
          </CardContent>
          <div className="px-6 pt-4 pb-6 text-center">
            <Button asChild className="w-full bg-rose-600 hover:bg-rose-700">
              <Link href="/register">Upgrade to Premium</Link>
            </Button>
          </div>
        </Card>
        */}
      </div>

      {/* Compare Table
      <div className="max-w-5xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-4 text-center">Compare Plans</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4">Feature</th>
                <th className="px-6 py-4">One-Time</th>
                <th className="px-6 py-4">Premium Monthly</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Track Expenses & Income", true, true],
                ["Create Budgets", true, true],
                ["Set Savings Goals", true, true],
                ["Connect Bank Accounts", false, true],
                ["Real-Time Insights", false, true],
                ["AI Spending Advice", false, true],
                ["Community Challenges", false, true],
              ].map(([feature, oneTime, premium], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                  <td className="px-6 py-4">{feature}</td>
                  <td className="px-6 py-4">{oneTime ? "✅" : "❌"}</td>
                  <td className="px-6 py-4">{premium ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      */}

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="q1">
            <AccordionTrigger>Can I cancel my account anytime?</AccordionTrigger>
            <AccordionContent>Yes, cancel anytime from your account. You’ll keep access until you delete your account.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>Does the one-time plan receive updates?</AccordionTrigger>
            <AccordionContent>Yes, all bug fixes and core improvements are included. Premium-only features will be excluded.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Is my data secure?</AccordionTrigger>
            <AccordionContent>100%. Your financial data is encrypted and never shared. We comply with top-tier data practices.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
