"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { 
  FileText, 
  Lightbulb, 
  ArrowRight, 
  BarChart3, 
  Wallet, 
  PiggyBank, 
  FileQuestion, 
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  Sparkles,
  Target,
  Zap,
  Activity,
  Brain
} from "lucide-react"
import { getTransactions, type Transaction } from "@/lib/firebase-service" // Import from firebase service

// Type definitions
type Insight = {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'expense' | 'opportunity';
  impact: 'low' | 'medium' | 'high';
  actionable: string;
  icon: React.ReactElement;
  savings: string;
}

type SpendingCategory = {
  category: string;
  amount: number;
  limit: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  monthlyChange: number; // Percent change from previous month
}

type ScoreBreakdown = {
  category: string;
  score: number;
  weight: number;
  insight: string; // Brief explanation of the score
}

type HealthScoreData = {
  current: number;
  previous: number;
  change: number;
  breakdown: ScoreBreakdown[];
  nextGoals: string[];
}

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

// Helper function to safely get a Date from a transaction date field (handles Firestore Timestamp)
function getTransactionDate(date: any): Date {
  // If it's already a Date
  if (date instanceof Date) return date;
  
  // If it's a Firestore Timestamp
  if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // If it's a string or number
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  
  // Default case
  return new Date();
}

// Helper function to analyze transactions
function analyzeTransactions(transactions: Transaction[]) {
  if (!transactions || transactions.length === 0) {
    return {
      spendingBreakdown: [],
      insights: [],
      healthScore: null
    }
  }
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = getTransactionDate(a.date).getTime();
    const dateB = getTransactionDate(b.date).getTime();
    return dateB - dateA;
  });

  // Get current month transactions
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const currentMonthTransactions = sortedTransactions.filter(transaction => {
    const transactionDate = getTransactionDate(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  // Get previous month transactions
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  const prevMonthTransactions = sortedTransactions.filter(transaction => {
    const transactionDate = getTransactionDate(transaction.date);
    return transactionDate.getMonth() === prevMonth && 
           transactionDate.getFullYear() === prevYear;
  });

  // Calculate category spending
  const categoryTotals: Record<string, {current: number, previous: number, limit: number}> = {
    "Food & Dining": {current: 0, previous: 0, limit: 500},
    "Shopping": {current: 0, previous: 0, limit: 300},
    "Entertainment": {current: 0, previous: 0, limit: 200},
    "Transportation": {current: 0, previous: 0, limit: 200},
    "Utilities": {current: 0, previous: 0, limit: 350},
    "Subscriptions": {current: 0, previous: 0, limit: 50},
    "Other": {current: 0, previous: 0, limit: 400},
  }
  
  // Calculate current month totals
  currentMonthTransactions.forEach(tx => {
    if (tx.type === 'expense') {
      if (tx.category in categoryTotals) {
        categoryTotals[tx.category].current += tx.amount;
      } else {
        categoryTotals["Other"].current += tx.amount;
      }
    }
  });
  
  // Calculate previous month totals
  prevMonthTransactions.forEach(tx => {
    if (tx.type === 'expense') {
      if (tx.category in categoryTotals) {
        categoryTotals[tx.category].previous += tx.amount;
      } else {
        categoryTotals["Other"].previous += tx.amount;
      }
    }
  });
  
  // Format spending breakdown
  const spendingBreakdown: SpendingCategory[] = Object.entries(categoryTotals).map(([category, data]) => {
    const { current, previous, limit } = data;
    
    // Calculate percentage of total spending
    const totalSpending = Object.values(categoryTotals)
      .reduce((total, cat) => total + cat.current, 0);
    const percentage = totalSpending > 0 ? Math.round((current / totalSpending) * 100) : 0;
    
    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let monthlyChange = 0;
    
    if (previous > 0) {
      const percentChange = ((current - previous) / previous) * 100;
      monthlyChange = Math.round(percentChange);
      
      if (percentChange > 5) {
        trend = 'up';
      } else if (percentChange < -5) {
        trend = 'down';
      }
    }
    
    return {
      category,
      amount: current,
      limit,
      percentage,
      trend,
      monthlyChange
    };
  }).sort((a, b) => b.amount - a.amount); // Sort by amount (highest first)
  
  // Generate insights based on the data
  const insights: Insight[] = [];
  
  // Check for overspending categories
  spendingBreakdown.forEach((category, index) => {
    if (category.amount > category.limit && category.amount > 0) {
      const overspentAmount = Math.round(category.amount - category.limit);
      const percentOver = Math.round((overspentAmount / category.limit) * 100);
      
      insights.push({
        id: index + 1,
        title: `Reduce Your ${category.category} Expenses`,
        description: `You've spent $${category.amount} on ${category.category.toLowerCase()} this month, which is $${overspentAmount} (${percentOver}%) over your budget.`,
        category: category.category,
        type: 'expense',
        impact: percentOver > 30 ? 'high' : 'medium',
        actionable: getCategoryRecommendation(category.category),
        icon: <FileText className="h-5 w-5 text-rose-600" />,
        savings: `$${overspentAmount}/month`
      });
    }
  });
  
  // Check for significant increases
  spendingBreakdown.forEach((category, index) => {
    if (category.trend === 'up' && category.monthlyChange > 20) {
      // Only add if we don't already have an insight for this category
      if (!insights.some(insight => insight.category === category.category)) {
        insights.push({
          id: insights.length + 1,
          title: `${category.category} Expenses Increased`,
          description: `Your ${category.category.toLowerCase()} spending has increased by ${category.monthlyChange}% compared to last month.`,
          category: category.category,
          type: 'expense',
          impact: category.monthlyChange > 40 ? 'high' : 'medium',
          actionable: `Review your recent ${category.category.toLowerCase()} expenses to identify what's driving this increase.`,
          icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
          savings: `Varies based on spending reduction`
        });
      }
    }
  });
  
  // Add savings opportunity if they have recurring expenses
  const hasSubscriptions = categoryTotals["Subscriptions"].current > 0;
  if (hasSubscriptions) {
    insights.push({
      id: insights.length + 1,
      title: "Optimize Your Subscription Services",
      description: `You're spending $${categoryTotals["Subscriptions"].current.toFixed(0)}/month on subscriptions${categoryTotals["Subscriptions"].current > categoryTotals["Subscriptions"].limit ? `, which is $${(categoryTotals["Subscriptions"].current - categoryTotals["Subscriptions"].limit).toFixed(0)} over your budget` : ''}.`,
      category: "Subscriptions",
      type: 'expense',
      impact: 'medium',
      actionable: "Review your subscription services and consider canceling those you rarely use.",
      icon: <Wallet className="h-5 w-5 text-amber-600" />,
      savings: `$${Math.round(categoryTotals["Subscriptions"].current * 0.3)}/month (estimated)`
    });
  }
  
  // Add debt opportunity insight
  insights.push({
    id: insights.length + 1,
    title: "Potential Debt Payoff Strategy",
    description: "Applying the debt avalanche method to your current debts could save you money in interest payments.",
    category: "Debt",
    type: 'opportunity',
    impact: 'high',
    actionable: "Focus on paying off your highest interest debt first while making minimum payments on other debts.",
    icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
    savings: "Varies based on current debt"
  });
  
  // Generate health score
  const healthScore = generateHealthScore(spendingBreakdown, categoryTotals, insights);
  
  return {
    spendingBreakdown,
    insights: insights.slice(0, 6), // Limit to top 6 insights
    healthScore
  };
}

// Helper function to provide actionable recommendations for categories
function getCategoryRecommendation(category: string): string {
  const recommendations: Record<string, string> = {
    "Food & Dining": "Try meal prepping on weekends and limit dining out to once per week to reduce expenses.",
    "Shopping": "Create a shopping list before purchases and implement a 24-hour rule for non-essential items.",
    "Entertainment": "Look for free or low-cost entertainment alternatives and set a weekly entertainment budget.",
    "Transportation": "Consider carpooling, public transport, or combining trips to save on fuel and transportation costs.",
    "Utilities": "Reduce usage during peak hours and consider energy-efficient alternatives to lower monthly bills.",
    "Subscriptions": "Review all your subscription services and cancel those you use less than once per month.",
    "Other": "Categorize these expenses more specifically to better understand your spending patterns."
  };
  
  return recommendations[category] || "Review your expenses in this category to identify potential savings.";
}

// Generate financial health score based on spending patterns
function generateHealthScore(
  spendingBreakdown: SpendingCategory[], 
  categoryTotals: Record<string, {current: number, previous: number, limit: number}>,
  insights: Insight[]
): HealthScoreData {
  // Calculate spending score (0-100)
  const totalSpent = Object.values(categoryTotals).reduce((sum, category) => sum + category.current, 0);
  const totalLimit = Object.values(categoryTotals).reduce((sum, category) => sum + category.limit, 0);
  
  const spendingRatio = totalLimit > 0 ? totalSpent / totalLimit : 1;
  let spendingScore = 100 - Math.min(100, Math.max(0, (spendingRatio - 0.8) * 200));
  
  // Over-budget categories reduce score
  const overBudgetCategories = spendingBreakdown.filter(cat => cat.amount > cat.limit).length;
  spendingScore -= overBudgetCategories * 5;
  
  // Calculate savings score (placeholder - in real app would use actual savings data)
  const savingsScore = 60;
  
  // Calculate debt score (placeholder - in real app would use actual debt data)
  const debtScore = 75;
  
  // Calculate investment score (placeholder - in real app would use actual investment data)
  const investmentScore = 70;
  
  // Calculate overall score (weighted average)
  const scoreBreakdown: ScoreBreakdown[] = [
    { 
      category: "Spending", 
      score: Math.round(spendingScore), 
      weight: 0.3,
      insight: `You're ${spendingRatio < 1 ? 'within' : 'exceeding'} your overall budget with ${overBudgetCategories} categories over limit.`
    },
    { 
      category: "Saving", 
      score: savingsScore, 
      weight: 0.2,
      insight: "Your emergency fund is growing but still below the recommended 3-month expenses."
    },
    { 
      category: "Debt", 
      score: debtScore, 
      weight: 0.3,
      insight: "Your debt-to-income ratio is improving but could be optimized further."
    },
    { 
      category: "Investment", 
      score: investmentScore, 
      weight: 0.2,
      insight: "You're on track with retirement contributions but could diversify more."
    }
  ];
  
  const currentScore = Math.round(
    scoreBreakdown.reduce((sum, item) => sum + item.score * item.weight, 0)
  );
  
  // Previous score (for demo; in real app would be stored from last calculation)
  const previousScore = currentScore - 6;
  
  // Generate next goals based on insights
  const nextGoals = insights
    .filter(insight => insight.impact === 'high')
    .map(insight => insight.actionable)
    .slice(0, 3);
  
  return {
    current: currentScore,
    previous: previousScore,
    change: currentScore - previousScore,
    breakdown: scoreBreakdown,
    nextGoals: nextGoals.length > 0 ? nextGoals : [
      "Reduce overall spending by 10%",
      "Increase emergency fund by $1,000",
      "Pay off high-interest credit card"
    ]
  };
}

export default function FinancialInsightsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spendingBreakdown, setSpendingBreakdown] = useState<SpendingCategory[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [activeInsightId, setActiveInsightId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles only on client side to prevent hydration mismatch
    const generatedParticles = [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4
    }))
    setParticles(generatedParticles)
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  useEffect(() => {
    setIsClient(true);

    // If not loading and no user, redirect to login
    if (!loading && !user && isClient) {
      router.push("/login");
    }
  }, [user, loading, router, isClient]);

  // Fetch transactions when user is available
  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Get transactions from Firebase
        const data = await getTransactions(user.uid);
        setTransactions(data);
        
        // Analyze the transaction data
        const analysis = analyzeTransactions(data);
        setSpendingBreakdown(analysis.spendingBreakdown);
        setInsights(analysis.insights);
        setHealthScore(analysis.healthScore);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTransactionData();
    }
  }, [user]);

  // Show loading state or nothing during SSR
  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex items-center justify-center h-screen">
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl animate-pulse" />
            <div className="relative z-10 flex items-center justify-center space-x-4 text-gray-900 dark:text-white">
              <Loader2 className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xl font-semibold animate-pulse">Loading your financial insights...</span>
              <Brain className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total spending
  const totalSpending = spendingBreakdown.reduce((sum, category) => sum + category.amount, 0);
  const totalBudget = spendingBreakdown.reduce((sum, category) => sum + category.limit, 0);
  const isOverBudget = totalSpending > totalBudget;

  // Function to render insight icon based on type and impact
  const renderInsightIcon = (insight: Insight) => {
    const backgroundColor = 
      insight.type === "expense" 
        ? "bg-rose-100 dark:bg-rose-900/30" 
        : insight.impact === "high" 
          ? "bg-green-100 dark:bg-green-900/30" 
          : "bg-blue-100 dark:bg-blue-900/30";
    
    return (
      <div className={`rounded-full ${backgroundColor} p-3`}>
        {insight.icon}
      </div>
    );
  };

  // Function to render insight card
  const renderInsightCard = (insight: Insight) => {
    const isActive = activeInsightId === insight.id;
    
    return (
      <div 
        key={insight.id} 
        className={`bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500 ${isActive ? 'ring-2 ring-purple-400' : ''}`}
      >
        {/* Card Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${
          insight.type === "expense" 
            ? "from-rose-500/5 via-transparent to-rose-500/5 dark:from-rose-500/10 dark:to-transparent" 
            : "from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent"
        } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            {renderInsightIcon(insight)}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{insight.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
            </div>
            <Badge 
              variant={insight.type === "expense" ? "destructive" : "default"} 
              className="ml-auto"
            >
              {insight.category}
            </Badge>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/30 mb-4">
            <div className="flex items-center">
              <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.actionable}</p>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="font-semibold mr-2 text-gray-900 dark:text-white">Potential savings:</span>
              <Badge variant={insight.type === "expense" ? "outline" : "secondary"} className="font-mono">
                {insight.savings}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveInsightId(insight.id === activeInsightId ? null : insight.id)}
              className="hover:bg-white/50 dark:hover:bg-white/10"
            >
              <FileQuestion className="h-4 w-4 mr-2" />
              {isActive ? "Show Less" : "More Details"}
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Take Action
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Function to render the spending breakdown section
  const renderSpendingBreakdown = () => {
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Spending Breakdown</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overview of your spending categories compared to your budget limits</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {spendingBreakdown.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{item.category}</span>
                    {item.trend === "up" && (
                      <div className="flex items-center ml-1">
                        <TrendingUp className="h-3 w-3 text-rose-500" />
                        <span className="text-xs text-rose-500 ml-0.5">
                          {item.monthlyChange > 0 ? `+${item.monthlyChange}%` : `${item.monthlyChange}%`}
                        </span>
                      </div>
                    )}
                    {item.trend === "down" && (
                      <div className="flex items-center ml-1">
                        <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />
                        <span className="text-xs text-green-500 ml-0.5">
                          {item.monthlyChange > 0 ? `+${item.monthlyChange}%` : `${item.monthlyChange}%`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-right">
                    <span className={`font-mono ${item.amount > item.limit ? "text-rose-600 font-medium" : "text-gray-900 dark:text-white"}`}>
                      ${item.amount.toFixed(0)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400"> / ${item.limit}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.amount > item.limit ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (item.amount / item.limit) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white">Total Spending</h4>
              <div>
                <span className="font-mono font-medium text-gray-900 dark:text-white">${totalSpending.toFixed(0)}</span>
                <span className="text-gray-500 dark:text-gray-400"> / ${totalBudget}</span>
              </div>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isOverBudget ? "bg-rose-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, (totalSpending/totalBudget) * 100)}%` }}
              ></div>
            </div>
            {isOverBudget ? (
              <p className="text-xs text-rose-600 mt-1 font-medium">
                You're ${(totalSpending - totalBudget).toFixed(0)} over your monthly budget
              </p>
            ) : (
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                You're ${(totalBudget - totalSpending).toFixed(0)} under your monthly budget
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Function to render the financial health score section
  const renderHealthScore = () => {
    if (!healthScore) return null;
    
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Financial Health Score</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">A comprehensive assessment of your financial wellbeing</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{healthScore.current}</div>
                </div>
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={`${healthScore.current * 2.51} 251`}
                    className="text-purple-500"
                  />
                </svg>
              </div>
              <div className="mt-2">
                <Badge variant={healthScore.change > 0 ? "secondary" : "destructive"} className="font-mono">
                  {healthScore.change > 0 ? "+" : ""}{healthScore.change} pts
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">from last month</p>
              </div>
            </div>

            <div className="flex-1 ml-8">
              <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Score Breakdown</h4>
              <div className="space-y-3">
                {healthScore.breakdown.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">{item.category}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.score < 60 ? "bg-rose-500" : item.score < 75 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.insight}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Your Next Goals</h4>
                <ul className="space-y-1">
                  {healthScore.nextGoals.map((goal, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <ArrowRight className="h-3 w-3 mr-1 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to render action items based on insights
  const renderActionItems = () => {
    // Get the top 3 insights by impact
    const priorityInsights = [...insights]
      .sort((a, b) => {
        const impactValues = { high: 3, medium: 2, low: 1 };
        return impactValues[b.impact as keyof typeof impactValues] - impactValues[a.impact as keyof typeof impactValues];
      })
      .slice(0, 3);
      
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 dark:from-amber-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Priority Action Items</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">These actions will have the biggest impact on improving your financial health</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {priorityInsights.map((insight, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full 
                  ${insight.type === 'expense' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.actionable}
                  </p>
                </div>
                <Badge 
                  className={`mr-2 ${
                    insight.impact === 'high' 
                      ? 'bg-rose-500' 
                      : insight.impact === 'medium' 
                        ? 'bg-amber-500' 
                        : 'bg-blue-500'
                  }`}
                >
                  {insight.impact === 'high' ? 'High Impact' : insight.impact === 'medium' ? 'Medium Impact' : 'Low Impact'}
                </Badge>
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render potential savings summary
  const renderSavingsSummary = () => {
    // Calculate total potential savings from insights
    let totalSavings = 0;
    let savingsText = "Varies";
    
    // Try to extract numeric savings values
    insights.forEach(insight => {
      const savingsMatch = insight.savings.match(/\$(\d+)/);
      if (savingsMatch && savingsMatch[1]) {
        const amount = parseInt(savingsMatch[1], 10);
        if (!isNaN(amount)) {
          totalSavings += amount;
        }
      }
    });
    
    if (totalSavings > 0) {
      savingsText = `${totalSavings.toFixed(0)}`;
    }
    
    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 dark:from-emerald-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Potential Monthly Savings</h3>
          </div>
          
          <div className="flex items-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{savingsText}</div>
            <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
              {totalSavings > 0 
                ? "by implementing all recommendations" 
                : "savings will vary based on your specific situation"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse shadow-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-pulse shadow-2xl" style={{ animationDelay: '4s' }} />
      </div>

      {/* Fixed Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse shadow-lg opacity-40"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 p-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="flex flex-col space-y-8">

          {/* Enhanced Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
                    Financial Insights
                  </h2>
                  <div className="absolute -top-1 -right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <Brain className="w-6 h-6 text-purple-500 animate-pulse drop-shadow-lg" />
                  </div>
                  {/* Glow effect behind text */}
                  <div className="absolute inset-0 text-4xl font-bold text-purple-500/20 blur-lg animate-pulse">
                    Financial Insights
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700/50">
                  <Shield className="w-4 h-4 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Powered</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700/50">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Smart Analysis</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Track Progress
                </Button>
              </div>
            </div>

            {/* Subtitle */}
            <div className="mt-4 relative z-10">
              <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                <span>AI-powered analysis of your spending patterns and personalized recommendations</span>
                <Target className="w-5 h-5 text-purple-500 animate-pulse" />
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl h-64 flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <p className="text-gray-600 dark:text-gray-300">Loading your financial health score...</p>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl h-64 flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <p className="text-gray-600 dark:text-gray-300">Loading spending data...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  {renderHealthScore()}
                </div>
                <div className="md:col-span-1">
                  {renderSpendingBreakdown()}
                </div>
              </div>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2">
                  {renderActionItems()}
                </div>
                <div className="md:col-span-1">
                  {renderSavingsSummary()}
                </div>
              </div>

              <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent drop-shadow-sm">
                      Personalized Financial Insights
                    </h3>
                    <div className="relative">
                      <Zap className="w-6 h-6 text-purple-500 animate-pulse drop-shadow-lg group-hover:animate-bounce transition-all duration-300" />
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map(insight => renderInsightCard(insight))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}