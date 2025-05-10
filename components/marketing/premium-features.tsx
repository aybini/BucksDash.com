import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Sparkles, GraduationCap, Briefcase, Rocket } from "lucide-react"

export function PremiumFeatures() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Premium Features Worth Every Penny</h2>
        <p className="text-muted-foreground">Designed for modern financial needs across different life stages</p>
      </div>

      {/* For TikTok Users */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">For Social Media Enthusiasts</CardTitle>
            <Badge className="bg-pink-500">
              <Sparkles className="h-3 w-3 mr-1" /> TikTok Generation
            </Badge>
          </div>
          <CardDescription>Features that make finance engaging and shareable</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Financial Challenges</p>
                <p className="text-sm text-muted-foreground">
                  Join trending money-saving challenges and share your progress
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Achievement Badges</p>
                <p className="text-sm text-muted-foreground">Earn and share badges for hitting financial milestones</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Visual Money Stories</p>
                <p className="text-sm text-muted-foreground">Create shareable graphics of your financial wins</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Money Meme Generator</p>
                <p className="text-sm text-muted-foreground">
                  Turn your financial insights into fun, shareable content
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* For College Students */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">For College Students</CardTitle>
            <Badge className="bg-blue-500">
              <GraduationCap className="h-3 w-3 mr-1" /> Student Life
            </Badge>
          </div>
          <CardDescription>Tools to manage limited budgets and student-specific expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Roommate Expense Splitting</p>
                <p className="text-sm text-muted-foreground">
                  Track shared expenses and settle up easily with roommates
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Student Loan Tracker</p>
                <p className="text-sm text-muted-foreground">Monitor your loans and see the impact of early payments</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Textbook Budget Tool</p>
                <p className="text-sm text-muted-foreground">Plan for course materials and find the best deals</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Semester Budget Templates</p>
                <p className="text-sm text-muted-foreground">Pre-built budgets aligned with academic terms</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* For Early Professionals */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">For Early Professionals</CardTitle>
            <Badge className="bg-green-500">
              <Briefcase className="h-3 w-3 mr-1" /> Career Growth
            </Badge>
          </div>
          <CardDescription>Features to build wealth as your career advances</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Salary Negotiation Calculator</p>
                <p className="text-sm text-muted-foreground">See the long-term impact of salary increases</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">401(k) Optimizer</p>
                <p className="text-sm text-muted-foreground">
                  Maximize employer matches and visualize retirement growth
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Automated Savings Rules</p>
                <p className="text-sm text-muted-foreground">Set rules like "save 30% of every bonus automatically"</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Relocation Cost Calculator</p>
                <p className="text-sm text-muted-foreground">
                  Plan for job-related moves with cost-of-living comparisons
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* For Entrepreneurs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">For Entrepreneurs</CardTitle>
            <Badge className="bg-purple-500">
              <Rocket className="h-3 w-3 mr-1" /> Business Growth
            </Badge>
          </div>
          <CardDescription>Tools to separate personal and business finances</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Business Expense Tagging</p>
                <p className="text-sm text-muted-foreground">
                  Easily mark and categorize business expenses for tax time
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Invoice Tracker</p>
                <p className="text-sm text-muted-foreground">Monitor outstanding invoices and payment timelines</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Quarterly Tax Estimator</p>
                <p className="text-sm text-muted-foreground">
                  Calculate and set aside money for quarterly tax payments
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Cash Flow Forecasting</p>
                <p className="text-sm text-muted-foreground">Predict upcoming cash flow based on historical patterns</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Universal Premium Features */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Universal Premium Features</CardTitle>
            <Badge className="bg-rose-600">Everyone Loves These</Badge>
          </div>
          <CardDescription>Features that make the subscription worthwhile for everyone</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">AI Financial Insights</p>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations based on your spending patterns
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Bill Negotiation Assistant</p>
                <p className="text-sm text-muted-foreground">
                  Tools to help lower your recurring bills and subscriptions
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Money-Saving Opportunities</p>
                <p className="text-sm text-muted-foreground">
                  Alerts for better credit card offers, lower insurance rates, etc.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Financial Education Library</p>
                <p className="text-sm text-muted-foreground">
                  Access to courses, articles, and videos on financial literacy
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
