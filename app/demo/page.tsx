"use client"

import Link from "next/link"
import { 
  ArrowRight, BarChart3, ChevronLeft, CreditCard, 
  PieChart, Wallet, Zap 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

interface StepCardProps {
  number: string
  title: string
  description: string
}

interface TestimonialCardProps {
  quote: string
  author: string
}

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      
      {/* Back to Home */}
      <Button
      asChild
      variant="outline"
      className="mb-8"
    >
      <Link href="/" className="flex items-center">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
    </Button>

      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Experience BucksDash Finance</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Take a tour of our powerful financial management tools designed for young professionals and students
        </p>
      </section>

      {/* Demo Video/Screenshot */}
      <section className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl p-8">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-bold">Interactive Demo</h2>
          <p className="text-muted-foreground">See how BucksDash helps you take control of your finances</p>
        </div>
        <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto max-w-4xl flex items-center justify-center">
          <p className="text-muted-foreground">Demo video coming soon</p>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Key Features You Can Try</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Wallet className="h-8 w-8 text-rose-500" />} 
            title="Expense Tracking" 
            description="Categorize and track all your expenses in one place with our intuitive interface." 
          />
          <FeatureCard 
            icon={<BarChart3 className="h-8 w-8 text-rose-500" />} 
            title="Budget Management" 
            description="Create custom budgets and see real-time updates as you spend throughout the month." 
          />
          <FeatureCard 
            icon={<PieChart className="h-8 w-8 text-rose-500" />} 
            title="Financial Reports" 
            description="Get visual insights into your spending habits with detailed charts and reports." 
          />
          <FeatureCard 
            icon={<CreditCard className="h-8 w-8 text-rose-500" />} 
            title="Debt Tracking" 
            description="Monitor your loans, credit cards, and other debts with payoff projections." 
          />
          <FeatureCard 
            icon={<Zap className="h-8 w-8 text-rose-500" />} 
            title="Financial Goals" 
            description="Set savings goals and track your progress toward achieving them." 
          />
          <FeatureCard 
            icon={<ArrowRight className="h-8 w-8 text-rose-500" />} 
            title="And Much More" 
            description="Discover all the premium features available with us." 
          />
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">How BucksDash Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <StepCard 
            number="1" 
            title="Connect Your Accounts" 
            description="Import your bank transactions safely and securely." 
          />
          <StepCard 
            number="2" 
            title="Categorize & Budget" 
            description="Set up your budget categories and spending limits based on your goals." 
          />
          <StepCard 
            number="3" 
            title="Track & Optimize" 
            description="Monitor your financial progress and receive personalized insights." 
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <TestimonialCard 
            quote="BucksDash helped me pay off my student loans 2 years earlier than expected. The debt payoff calculator was a game-changer!" 
            author="Alex K., Software Engineer" 
          />
          <TestimonialCard 
            quote="As a recent graduate, I was struggling to manage my finances. BucksDash made budgeting simple and even enjoyable!" 
            author="Jamie T., Marketing Associate" 
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Subscribe today and experience all the premium features BucksDash Finance has to offer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">Subscribe Now</Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="bg-transparent text-white border-white hover:bg-white/10"
          >
            <Link href="/features">Learn More</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}

// Components

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col items-center text-center">
      <CardHeader className="flex flex-col items-center">
        {icon}
        <CardTitle className="mt-4">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="bg-rose-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author }: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-4xl text-rose-300 mb-2">"</div>
        <p className="mb-4 italic">{quote}</p>
        <p className="text-right font-medium">— {author}</p>
      </CardContent>
    </Card>
  )
}
