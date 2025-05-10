"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"

// Sample tutorial data
const budgetingTutorial = {
  title: "Creating Your First Budget",
  description: "Learn how to create a personalized budget in 5 simple steps",
  steps: [
    {
      id: 1,
      title: "Calculate Your Income",
      content: (
        <div className="space-y-4">
          <p>The first step in creating a budget is to determine your total monthly income after taxes.</p>
          <p>Include all sources of income:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Salary or wages</li>
            <li>Freelance or side hustle income</li>
            <li>Investment income</li>
            <li>Any other regular income</li>
          </ul>
          <div className="space-y-2 mt-4">
            <Label htmlFor="monthly-income">Your Monthly Income</Label>
            <Input id="monthly-income" placeholder="0.00" type="number" />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Track Your Expenses",
      content: (
        <div className="space-y-4">
          <p>Next, track all your expenses for at least one month to understand your spending patterns.</p>
          <p>Categorize your expenses into:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fixed expenses (rent, utilities, insurance)</li>
            <li>Variable necessities (groceries, transportation)</li>
            <li>Discretionary spending (entertainment, dining out)</li>
          </ul>
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <p className="font-medium">Pro Tip</p>
            <p>
              Use Rose Finance's transaction categorization feature to automatically track and categorize your expenses.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Set Financial Goals",
      content: (
        <div className="space-y-4">
          <p>Establish clear financial goals to guide your budgeting decisions.</p>
          <p>Common financial goals include:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Building an emergency fund (3-6 months of expenses)</li>
            <li>Paying off debt</li>
            <li>Saving for major purchases</li>
            <li>Investing for retirement</li>
          </ul>
          <div className="space-y-2 mt-4">
            <Label htmlFor="goal-1">Your Primary Financial Goal</Label>
            <Input id="goal-1" placeholder="e.g., Build emergency fund" />
            <Label htmlFor="goal-amount" className="mt-2">
              Target Amount
            </Label>
            <Input id="goal-amount" placeholder="0.00" type="number" />
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Create Your Budget Plan",
      content: (
        <div className="space-y-4">
          <p>Now it's time to allocate your income to different categories based on your expenses and goals.</p>
          <p>A popular budgeting method is the 50/30/20 rule:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>50%</strong> for needs (housing, food, utilities)
            </li>
            <li>
              <strong>30%</strong> for wants (entertainment, dining out)
            </li>
            <li>
              <strong>20%</strong> for savings and debt repayment
            </li>
          </ul>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Needs (50%)</Label>
              <Progress value={50} className="h-4 mt-1" />
            </div>
            <div>
              <Label>Wants (30%)</Label>
              <Progress value={30} className="h-4 mt-1" />
            </div>
            <div>
              <Label>Savings/Debt (20%)</Label>
              <Progress value={20} className="h-4 mt-1" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Review and Adjust",
      content: (
        <div className="space-y-4">
          <p>The final step is to regularly review your budget and make adjustments as needed.</p>
          <p>Best practices for budget maintenance:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Review your budget weekly</li>
            <li>Track your spending daily</li>
            <li>Adjust category allocations as your needs change</li>
            <li>Celebrate your progress and small wins</li>
          </ul>
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200 mt-4">
            <p className="font-medium">Congratulations!</p>
            <p>
              You've completed the budgeting tutorial. You now have the knowledge to create and maintain a successful
              budget.
            </p>
          </div>
        </div>
      ),
    },
  ],
}

export function InteractiveTutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const steps = budgetingTutorial.steps

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setCompleted(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-rose-600" />
              {budgetingTutorial.title}
            </CardTitle>
            <CardDescription>{budgetingTutorial.description}</CardDescription>
          </div>
          {completed && (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="h-5 w-5 mr-1" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!completed ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">
                Step {currentStep + 1}: {steps[currentStep].title}
              </h3>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-4" />

            <div className="min-h-[300px]">{steps[currentStep].content}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-green-800">Tutorial Completed!</h3>
              <p className="mt-2 text-green-700">
                You've successfully completed the budgeting tutorial. Ready to put your knowledge into practice?
              </p>
            </div>

            <Tabs defaultValue="summary" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="next">Next Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 mt-4">
                <h4 className="font-medium">Key Takeaways</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Calculate your total monthly income</li>
                  <li>Track and categorize your expenses</li>
                  <li>Set clear financial goals</li>
                  <li>Allocate your income using the 50/30/20 rule</li>
                  <li>Regularly review and adjust your budget</li>
                </ul>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4 mt-4">
                <h4 className="font-medium">Additional Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-rose-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Budgeting Templates
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-rose-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Advanced Budgeting Strategies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-rose-600 hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Budgeting for Irregular Income
                    </a>
                  </li>
                </ul>
              </TabsContent>

              <TabsContent value="next" className="space-y-4 mt-4">
                <h4 className="font-medium">Recommended Next Steps</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Button variant="outline" size="icon" className="h-6 w-6 mr-2 mt-0.5">
                      1
                    </Button>
                    <span>Create your first budget in Rose Finance</span>
                  </li>
                  <li className="flex items-start">
                    <Button variant="outline" size="icon" className="h-6 w-6 mr-2 mt-0.5">
                      2
                    </Button>
                    <span>Set up automatic tracking for your expenses</span>
                  </li>
                  <li className="flex items-start">
                    <Button variant="outline" size="icon" className="h-6 w-6 mr-2 mt-0.5">
                      3
                    </Button>
                    <span>Create your first savings goal</span>
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!completed ? (
          <>
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Complete"
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleReset}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Restart Tutorial
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700">Apply to My Budget</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
