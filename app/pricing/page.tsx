"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft, Sparkles, Star, Crown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function PricingPage() {
  const [planType, setPlanType] = useState("monthly")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-white dark:from-gray-900 dark:via-rose-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/20 dark:bg-green-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/10 dark:bg-rose-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-rose-400 to-green-400 rounded-full animate-pulse shadow-lg opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className={`container mx-auto px-4 py-12 relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Enhanced Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 bg-white/90 dark:bg-white/10 backdrop-blur-xl border-gray-200/50 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 hover:shadow-lg group rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Enhanced Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 via-rose-600 to-green-600 bg-clip-text text-transparent drop-shadow-lg">
            Choose Your Plan
          </h1>
          <div className="relative inline-block">
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-rose-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <p className="text-center text-gray-600 dark:text-gray-300 text-xl">
            Flexible pricing for every financial journey.
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400">
            More premium options coming soon..
          </p>
        </div>

        {/* Enhanced Toggle Group */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-gray-200/50 dark:border-white/20 shadow-xl">
            <ToggleGroup 
              type="single" 
              value={planType} 
              onValueChange={(val) => setPlanType(val || "monthly")}
              className="bg-transparent"
            >
              <ToggleGroupItem 
                value="monthly" 
                className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-rose-500 data-[state=on]:to-green-500 data-[state=on]:text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold"
              >
                One-Time Plan
              </ToggleGroupItem>
              {/*<ToggleGroupItem value="one-time">One-Time Access</ToggleGroupItem> */}
            </ToggleGroup>
          </div>
        </div>

        {/* Enhanced Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto mb-16">
          {/* Enhanced One-Time Card */}
          <Card className="border-2 border-green-400/50 dark:border-green-500/50 bg-white/90 dark:bg-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500 rounded-3xl">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <CardHeader className="text-center relative z-10 pb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-6 h-6 text-green-500 animate-pulse" />
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">One-Time Access</CardTitle>
                <Star className="w-6 h-6 text-green-500 animate-pulse" />
              </div>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Pay once, use forever
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 relative z-10">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl">
                <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  $5.99
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">One-time payment</p>
                <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Best Value
                </Badge>
              </div>
              
              <ul className="space-y-3 text-left">
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">💰 Income/Expense Tracking</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">📊 Budget Management with Due Dates</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">🎯 Financial Goal Setting</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">🔄 Transaction Importing</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">🏦 Add Income Source</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">💳 Debt Management & Payment Options</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">📅 Subscription Tracking</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">🗓️ Bill Calendar & Reminders</span>
                </li>
                <li className="flex items-center group/item">
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 group-hover/item:scale-110 transition-transform duration-300" /> 
                  <span className="text-gray-700 dark:text-gray-300">📈 Spending Forecast</span>
                </li>
                {/*<li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 📚 Educational Financial Content</li>*/}
                {/*<li className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> 💬 Community Support & Discussions</li>*/}
              </ul>
            </CardContent>
            
            <div className="px-6 pt-4 pb-6 text-center relative z-10">
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-green-600 via-green-600 to-emerald-700 hover:from-green-700 hover:via-green-700 hover:to-emerald-800 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/25 relative overflow-hidden group text-lg"
              >
                <Link href="/register">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center space-x-2">
                    <span>Get Started</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </span>
                </Link>
              </Button>
            </div>
          </Card>

          {/* PRESERVED COMMENTED PREMIUM CARD */}
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

        {/* PRESERVED COMMENTED COMPARE TABLE */}
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

        {/* Enhanced FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-green-600 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-green-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-green-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <Accordion type="single" collapsible className="relative z-10">
              <AccordionItem value="q1" className="border-gray-200/50 dark:border-white/20">
                <AccordionTrigger className="text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 text-lg font-semibold">
                  Can I cancel my account anytime?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  Yes, you can cancel anytime from your account settings. You'll retain access until your account is deleted.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q2" className="border-gray-200/50 dark:border-white/20">
                <AccordionTrigger className="text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 text-lg font-semibold">
                  Does the one-time plan receive updates?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  Yes, all bug fixes and core improvements are included. Premium-only features will be excluded.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="q3" className="border-gray-200/50 dark:border-white/20">
                <AccordionTrigger className="text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-300 text-lg font-semibold">
                  Is my data secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                  Absolutely. Your financial data is encrypted, protected, and never shared. We follow industry-leading security standards to keep your information safe.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}