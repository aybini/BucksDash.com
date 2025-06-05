"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Sparkles,
  Star,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  BarChart3,
  PiggyBank,
  CreditCard,
  DollarSign,
  ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FeaturesPage() {
  const [selectedTab, setSelectedTab] = useState("ai")

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold text-rose-600">BucksDash</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Powerful Features for Your Financial Journey
                </h1>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                BucksDash Finance provides all the tools you need to take control of your financial life
                </p>
              </div>
            </div>

            {/* Core Features Section */}
            <div className="mx-auto max-w-5xl mb-20">
              <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <CardTitle>Transaction Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically categorize and track all your financial transactions in one place.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Automatic categorization
                      </li>

                      {/*  

                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Bank account integration
                      </li>
                      */}

                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Search and filter capabilities
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <CardTitle>Budget Management</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Create custom budgets for different spending categories and track your progress in real-time with
                      visual feedback.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Custom budget categories
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Visual progress tracking
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Budget alerts and notifications
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <CardTitle>Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Gain valuable insights into your spending habits with detailed reports and visualizations to
                      identify trends.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Interactive charts and graphs
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Monthly, quarterly, and yearly views
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Spending pattern analysis
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <CardTitle>Debt Management</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Take control of your debt with powerful tools designed to help you pay it off faster and save on
                      interest.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Debt snowball and avalanche calculators
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Interest savings calculations
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Payoff date projections
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <CardTitle>Subscription Management</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Never lose track of your subscriptions again. Bucksdash automatically detects recurring payments and
                      helps you manage them.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Automatic subscription detection
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Renewal reminders
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Total subscription cost analysis
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                      <PiggyBank className="h-6 w-6" />
                    </div>
                    <CardTitle>Savings Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      Set financial goals and track your progress toward achieving them with visual feedback and
                      projections.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Custom savings goals
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Progress tracking
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Target date projections
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Premium Features Section */}
            <div className="mx-auto max-w-5xl mb-20">
              <div className="flex items-center justify-center mb-12">
                <Badge className="bg-rose-600 px-3 py-1 text-base">
                  <Sparkles className="mr-2 h-4 w-4" /> UPCOMING PREMIUM FEATURES
                </Badge>
              </div>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                {/* Mobile: Dropdown selector */}
                <div className="block md:hidden mb-6">
                  <Select value={selectedTab} onValueChange={setSelectedTab}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select feature category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">🤖 AI-Powered Features</SelectItem>
                      <SelectItem value="tiktok">📱 TikTok Users</SelectItem>
                      <SelectItem value="students">🎓 Students</SelectItem>
                      <SelectItem value="professionals">💼 Professionals</SelectItem>
                      <SelectItem value="entrepreneurs">🚀 Entrepreneurs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop: Tab navigation */}
                <TabsList className="hidden md:grid w-full grid-cols-5">
                  <TabsTrigger value="ai" className="text-sm">AI-Powered</TabsTrigger>
                  <TabsTrigger value="tiktok" className="text-sm">TikTok Users</TabsTrigger>
                  <TabsTrigger value="students" className="text-sm">Students</TabsTrigger>
                  <TabsTrigger value="professionals" className="text-sm">Professionals</TabsTrigger>
                  <TabsTrigger value="entrepreneurs" className="text-sm">Entrepreneurs</TabsTrigger>
                </TabsList>

                {/* AI-Powered Tab */}
                <TabsContent value="ai" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle>AI Financial Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Get personalized recommendations based on your spending patterns and financial goals to
                          optimize your finances.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Bill Negotiation Assistant</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Tools to help lower your recurring bills and subscriptions, saving you money every month
                          without the hassle.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <CardTitle>Smart Savings Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Receive alerts for better credit card offers, lower insurance rates, and other opportunities
                          to save money.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <CardTitle>Spending Pattern Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Advanced AI analysis identifies trends in your spending and suggests actionable ways to
                          improve your financial habits.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                          <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle>Financial Education Library</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Access to courses, articles, and videos on financial literacy, tailored to your specific
                          financial situation.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Cash Flow Forecasting</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Predict upcoming cash flow based on historical patterns to help you plan ahead and avoid cash
                          shortages.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* TikTok Users Tab */}
                <TabsContent value="tiktok" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-4">
                          <Star className="h-6 w-6" />
                        </div>
                        <CardTitle>Financial Challenges</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Join trending money-saving challenges and share your progress with friends to stay motivated
                          and accountable.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-4">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle>Achievement Badges</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Earn and share badges for hitting financial milestones and building healthy money habits over
                          time.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Visual Money Stories</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Create shareable graphics of your financial wins and journey milestones to inspire your social
                          network.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600 mb-4">
                          <Star className="h-6 w-6" />
                        </div>
                        <CardTitle>Money Meme Generator</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Turn your financial insights into fun, shareable content for social media that educates and
                          entertains.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                          <Users className="h-6 w-6" />
                        </div>
                        <CardTitle>Roommate Expense Splitting</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Track shared expenses and settle up easily with roommates without awkward conversations about
                          money.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Student Loan Tracker</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Monitor your loans and see the impact of early payments on your total interest to develop an
                          optimal repayment strategy.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle>Semester Budget Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Pre-built budgets aligned with academic terms to help you manage your semester expenses
                          effectively.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Textbook Budget Tool</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Plan for course materials and find the best deals to save money on textbooks each semester.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Professionals Tab */}
                <TabsContent value="professionals" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Salary Negotiation Calculator</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          See the long-term impact of salary increases and optimize your career earnings with
                          data-driven insights.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle>401(k) Optimizer</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Maximize employer matches and visualize retirement growth with interactive projections to
                          secure your future.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                          <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle>Automated Savings Rules</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Set rules like "save 30% of every bonus automatically" to build wealth effortlessly without
                          thinking about it.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Relocation Cost Calculator</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Plan for job-related moves with cost-of-living comparisons between cities to make informed
                          career decisions.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Entrepreneurs Tab */}
                <TabsContent value="entrepreneurs" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Business Expense Tagging</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Easily mark and categorize business expenses for tax time and maintain clear separation from
                          personal finances.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle>Invoice Tracker</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Monitor outstanding invoices and payment timelines to improve cash flow management for your
                          business.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                          <Shield className="h-6 w-6" />
                        </div>
                        <CardTitle>Quarterly Tax Estimator</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Calculate and set aside money for quarterly tax payments to avoid penalties and surprises at
                          tax time.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col h-full">
                      <CardHeader className="pb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                        <CardTitle>Cash Flow Forecasting</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Predict upcoming cash flow based on historical patterns for better business planning and
                          financial stability.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* CTA Section */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Experience BucksDash Finance?</h2>
                <p className="text-lg mb-8 max-w-2xl mx-auto">
                  Start your financial journey today with our powerful tools and personalized insight.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                      Subscribe Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 BucksDash Finance. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}