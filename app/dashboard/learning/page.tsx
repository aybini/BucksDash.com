"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { 
  FileText, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft,
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
  Brain,
  TrendingDown,
  Calendar,
  CreditCard,
  Repeat
} from "lucide-react"
import { getTransactions, getBudgetCategories, type Transaction, type BudgetCategory } from "@/lib/firebase-service"

// Type definitions - using imported BudgetCategory type

type Insight = {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'expense' | 'opportunity' | 'achievement';
  impact: 'low' | 'medium' | 'high';
  actionable: string;
  icon: React.ReactElement;
  savings: string;
  priority: number;
}

type SpendingCategory = {
  category: string;
  amount: number;
  budget: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  monthlyChange: number;
  isOverBudget: boolean;
  daysLeft: number;
}

type ScoreBreakdown = {
  category: string;
  score: number;
  weight: number;
  insight: string;
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

// Helper function to safely get a Date from a transaction date field
function getTransactionDate(date: any): Date {
  if (date instanceof Date) return date;
  if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  if (typeof date === 'object' && date !== null && 'seconds' in date) {
    return new Date(date.seconds * 1000);
  }
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  return new Date();
}

// Enhanced function to analyze transactions with budget data
function analyzeTransactions(transactions: Transaction[], budgetCategories: BudgetCategory[]) {
  if (!transactions || transactions.length === 0) {
    return {
      spendingBreakdown: [],
      insights: [],
      healthScore: null,
      totalSpent: 0,
      totalBudget: 0,
      savingsOpportunity: 0
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
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const currentDay = now.getDate()
  const daysLeft = daysInMonth - currentDay
  
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

  // Create budget map for easier lookup - handle optional id
  const budgetMap = new Map<string, number>()
  budgetCategories.forEach(budget => {
    if (budget.name) {
      budgetMap.set(budget.name, budget.amount || 0)
    }
  })

  // Get all unique categories from transactions and budgets
  const allCategories = new Set<string>()
  currentMonthTransactions.forEach(tx => {
    if (tx.category && tx.type === 'expense') {
      allCategories.add(tx.category)
    }
  })
  budgetCategories.forEach(budget => {
    if (budget.name) {
      allCategories.add(budget.name)
    }
  })

  // Calculate category spending and compare with budgets
  const categoryData = new Map<string, {current: number, previous: number, budget: number}>()
  
  // Initialize with budget data
  allCategories.forEach(category => {
    categoryData.set(category, {
      current: 0,
      previous: 0,
      budget: budgetMap.get(category) || 0
    })
  })
  
  // Calculate current month totals
  currentMonthTransactions.forEach(tx => {
    if (tx.type === 'expense' && tx.category) {
      const current = categoryData.get(tx.category)
      if (current) {
        current.current += (tx.amount || 0)
      } else {
        categoryData.set(tx.category, {
          current: tx.amount || 0,
          previous: 0,
          budget: budgetMap.get(tx.category) || 0
        })
      }
    }
  });
  
  // Calculate previous month totals
  prevMonthTransactions.forEach(tx => {
    if (tx.type === 'expense' && tx.category) {
      const data = categoryData.get(tx.category)
      if (data) {
        data.previous += (tx.amount || 0)
      }
    }
  });
  
  // Format spending breakdown
  const spendingBreakdown: SpendingCategory[] = Array.from(categoryData.entries())
    .filter(([category, data]) => data.budget > 0 || data.current > 0) // Only show categories with budget or spending
    .map(([category, data]) => {
      const { current, previous, budget } = data;
      
      // Calculate percentage of budget used
      const percentage = budget > 0 ? Math.round((current / budget) * 100) : 0;
      
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
      } else if (current > 0) {
        trend = 'up';
        monthlyChange = 100; // New spending category
      }
      
      return {
        category,
        amount: current,
        budget,
        percentage,
        trend,
        monthlyChange,
        isOverBudget: current > budget && budget > 0,
        daysLeft
      };
    })
    .sort((a, b) => b.amount - a.amount); // Sort by amount spent (highest first)
  
  // Calculate totals
  const totalSpent = spendingBreakdown.reduce((sum, cat) => sum + cat.amount, 0)
  const totalBudget = spendingBreakdown.reduce((sum, cat) => sum + cat.budget, 0)
  const totalIncome = currentMonthTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0)

  // Generate AI-powered insights
  const insights: Insight[] = [];
  let priority = 1;
  
  // 1. Over-budget categories (High Priority)
  spendingBreakdown.forEach((category) => {
    if (category.isOverBudget && category.budget > 0) {
      const overspentAmount = Math.round(category.amount - category.budget);
      const percentOver = Math.round((overspentAmount / category.budget) * 100);
      
      insights.push({
        id: priority++,
        title: `${category.category} is Over Budget`,
        description: `You've spent $${category.amount.toFixed(0)} on ${category.category.toLowerCase()}, which is $${overspentAmount} (${percentOver}%) over your $${category.budget} budget.`,
        category: category.category,
        type: 'expense',
        impact: percentOver > 50 ? 'high' : percentOver > 20 ? 'medium' : 'low',
        actionable: getCategoryRecommendation(category.category, 'overspend'),
        icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
        savings: `$${overspentAmount}/month`,
        priority: percentOver > 50 ? 1 : percentOver > 20 ? 2 : 3
      });
    }
  });

  // 2. Significant spending increases (Medium Priority)
  spendingBreakdown.forEach((category) => {
    if (category.trend === 'up' && category.monthlyChange > 25 && category.amount > 100) {
      if (!insights.some(insight => insight.category === category.category)) {
        insights.push({
          id: priority++,
          title: `${category.category} Spending Spike`,
          description: `Your ${category.category.toLowerCase()} spending increased by ${category.monthlyChange}% this month (${category.amount > 0 ? `$${category.amount.toFixed(0)}` : 'new category'}).`,
          category: category.category,
          type: 'expense',
          impact: category.monthlyChange > 50 ? 'high' : 'medium',
          actionable: getCategoryRecommendation(category.category, 'increase'),
          icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
          savings: `Monitor and reduce by 20% = $${(category.amount * 0.2).toFixed(0)}/month`,
          priority: category.monthlyChange > 50 ? 2 : 4
        });
      }
    }
  });

  // 3. Good progress achievements (Low Priority)
  spendingBreakdown.forEach((category) => {
    if (category.budget > 0 && category.amount < category.budget * 0.8 && category.amount > 0) {
      const savedAmount = category.budget - category.amount;
      insights.push({
        id: priority++,
        title: `Great Progress on ${category.category}`,
        description: `You're staying well within your ${category.category.toLowerCase()} budget with $${savedAmount.toFixed(0)} to spare (${category.percentage}% used).`,
        category: category.category,
        type: 'achievement',
        impact: 'low',
        actionable: `Keep up the great work! Consider reallocating some of this budget to other categories if needed.`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        savings: `$${savedAmount.toFixed(0)} remaining this month`,
        priority: 6
      });
    }
  });

  // 4. Income vs Spending Analysis
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100;
    if (savingsRate < 20 && totalIncome > totalSpent) {
      insights.push({
        id: priority++,
        title: "Low Savings Rate Detected",
        description: `You're saving ${savingsRate.toFixed(1)}% of your income. Financial experts recommend 20% or more.`,
        category: "Savings",
        type: 'opportunity',
        impact: 'high',
        actionable: `Try to increase your savings rate by reducing discretionary spending or finding additional income sources.`,
        icon: <PiggyBank className="h-5 w-5 text-blue-600" />,
        savings: `Target: $${((totalIncome * 0.2) - (totalIncome - totalSpent)).toFixed(0)}/month more`,
        priority: 2
      });
    } else if (savingsRate >= 20) {
      insights.push({
        id: priority++,
        title: "Excellent Savings Rate!",
        description: `You're saving ${savingsRate.toFixed(1)}% of your income - that's fantastic financial discipline!`,
        category: "Savings",
        type: 'achievement',
        impact: 'high',
        actionable: `Consider investing these savings for long-term growth or building an emergency fund.`,
        icon: <Target className="h-5 w-5 text-green-600" />,
        savings: `$${(totalIncome - totalSpent).toFixed(0)}/month saved`,
        priority: 7
      });
    }
  }

  // 5. Subscription optimization opportunity
  const subscriptionSpending = currentMonthTransactions
    .filter(tx => tx.type === 'expense' && tx.category?.toLowerCase().includes('subscription'))
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
  if (subscriptionSpending > 50) {
    insights.push({
      id: priority++,
      title: "Review Your Subscriptions",
      description: `You spent $${subscriptionSpending.toFixed(0)} on subscriptions this month. Review and cancel unused services.`,
      category: "Subscriptions",
      type: 'opportunity',
      impact: 'medium',
      actionable: "Audit all subscriptions and cancel those you haven't used in the past month.",
      icon: <Repeat className="h-5 w-5 text-purple-600" />,
      savings: `Potential: $${(subscriptionSpending * 0.3).toFixed(0)}/month`,
      priority: 3
    });
  }

  // Sort insights by priority and impact
  insights.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const impactValues = { high: 3, medium: 2, low: 1 };
    return impactValues[b.impact] - impactValues[a.impact];
  });

  // Generate health score
  const healthScore = generateHealthScore(spendingBreakdown, totalSpent, totalBudget, totalIncome, insights);
  
  // Calculate potential savings
  const savingsOpportunity = insights
    .filter(insight => insight.type === 'expense' || insight.type === 'opportunity')
    .reduce((total, insight) => {
      const match = insight.savings.match(/\$(\d+)/);
      return total + (match ? parseInt(match[1]) : 0);
    }, 0);

  return {
    spendingBreakdown,
    insights: insights.slice(0, 8), // Limit to top 8 insights
    healthScore,
    totalSpent,
    totalBudget,
    savingsOpportunity
  };
}

// Enhanced recommendation system
function getCategoryRecommendation(category: string, type: 'overspend' | 'increase'): string {
  const recommendations: Record<string, Record<string, string>> = {
    "Food & Dining": {
      overspend: "Try meal prepping on weekends and limit dining out to 1-2 times per week. Cook more meals at home.",
      increase: "Review recent restaurant and grocery receipts to identify where the increase occurred."
    },
    "Groceries": {
      overspend: "Create a detailed shopping list, use coupons, and stick to store brands for non-essential items.",
      increase: "Check if prices have increased or if you're buying more items than usual."
    },
    "Shopping": {
      overspend: "Implement a 24-hour rule for non-essential purchases and unsubscribe from retailer email lists.",
      increase: "Review recent purchases to identify any large or unnecessary items that drove up spending."
    },
    "Entertainment": {
      overspend: "Look for free activities like hiking, museums on free days, or home movie nights instead of theaters.",
      increase: "Consider lower-cost entertainment options and set a weekly entertainment budget."
    },
    "Transportation": {
      overspend: "Combine trips, use public transport when possible, or consider carpooling to save on fuel costs.",
      increase: "Check if gas prices increased or if you've been driving more than usual."
    },
    "Utilities": {
      overspend: "Reduce usage during peak hours, unplug electronics when not in use, and consider energy-efficient alternatives.",
      increase: "Check for seasonal changes in usage or consider a energy audit of your home."
    },
    "Subscriptions": {
      overspend: "Audit all subscription services and cancel those you haven't used in the past 30 days.",
      increase: "Review new subscriptions and consider if they're providing good value for money."
    }
  };
  
  const categoryRecs = recommendations[category];
  if (categoryRecs) {
    return categoryRecs[type];
  }
  
  return type === 'overspend' 
    ? "Review your expenses in this category and identify areas where you can cut back."
    : "Analyze what caused the increase in spending and consider if it's sustainable.";
}

// Enhanced health score calculation
function generateHealthScore(
  spendingBreakdown: SpendingCategory[], 
  totalSpent: number,
  totalBudget: number,
  totalIncome: number,
  insights: Insight[]
): HealthScoreData {
  // Budget adherence score (40% weight)
  let budgetScore = 100;
  const overBudgetCategories = spendingBreakdown.filter(cat => cat.isOverBudget).length;
  const totalCategories = spendingBreakdown.filter(cat => cat.budget > 0).length;
  
  if (totalBudget > 0) {
    const budgetUtilization = totalSpent / totalBudget;
    if (budgetUtilization > 1) {
      budgetScore = Math.max(0, 100 - (budgetUtilization - 1) * 200);
    } else {
      budgetScore = 100 - Math.abs(0.85 - budgetUtilization) * 200; // Optimal utilization around 85%
    }
  }
  budgetScore -= overBudgetCategories * 10; // Penalty for over-budget categories
  
  // Savings rate score (30% weight)
  let savingsScore = 50; // Default if no income data
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100;
    if (savingsRate >= 20) {
      savingsScore = 100;
    } else if (savingsRate >= 10) {
      savingsScore = 50 + (savingsRate - 10) * 5; // 50-100 range
    } else if (savingsRate >= 0) {
      savingsScore = savingsRate * 5; // 0-50 range
    } else {
      savingsScore = 0; // Spending more than earning
    }
  }
  
  // Spending trend score (20% weight)
  const increasingCategories = spendingBreakdown.filter(cat => cat.trend === 'up').length;
  const decreasingCategories = spendingBreakdown.filter(cat => cat.trend === 'down').length;
  let trendScore = 70; // Neutral baseline
  trendScore += decreasingCategories * 10 - increasingCategories * 5;
  trendScore = Math.max(0, Math.min(100, trendScore));
  
  // Financial habits score (10% weight)
  const highImpactIssues = insights.filter(i => i.impact === 'high' && i.type === 'expense').length;
  let habitsScore = 80 - highImpactIssues * 20;
  habitsScore = Math.max(0, Math.min(100, habitsScore));
  
  const scoreBreakdown: ScoreBreakdown[] = [
    { 
      category: "Budget Control", 
      score: Math.round(budgetScore), 
      weight: 0.4,
      insight: totalBudget > 0 
        ? `Using ${((totalSpent/totalBudget)*100).toFixed(1)}% of budget with ${overBudgetCategories} categories over limit`
        : "Set up budgets to improve financial control"
    },
    { 
      category: "Savings Rate", 
      score: Math.round(savingsScore), 
      weight: 0.3,
      insight: totalIncome > 0 
        ? `Saving ${(((totalIncome - totalSpent)/totalIncome)*100).toFixed(1)}% of income`
        : "Track income to calculate savings rate"
    },
    { 
      category: "Spending Trends", 
      score: Math.round(trendScore), 
      weight: 0.2,
      insight: `${increasingCategories} categories increasing, ${decreasingCategories} decreasing`
    },
    { 
      category: "Financial Habits", 
      score: Math.round(habitsScore), 
      weight: 0.1,
      insight: highImpactIssues > 0 
        ? `${highImpactIssues} high-impact issues to address`
        : "Good financial habits maintained"
    }
  ];
  
  const currentScore = Math.round(
    scoreBreakdown.reduce((sum, item) => sum + item.score * item.weight, 0)
  );
  
  // Simulate previous score (in real app, this would be stored)
  const previousScore = Math.max(0, currentScore + Math.floor(Math.random() * 20) - 10);
  
  // Generate next goals based on current performance
  const nextGoals: string[] = [];
  
  if (budgetScore < 70) {
    nextGoals.push("Bring all spending categories within budget limits");
  }
  if (savingsScore < 60) {
    nextGoals.push("Increase savings rate to at least 15% of income");
  }
  if (overBudgetCategories > 0) {
    nextGoals.push(`Reduce spending in ${overBudgetCategories} over-budget categories`);
  }
  if (highImpactIssues > 0) {
    nextGoals.push("Address high-impact spending issues identified");
  }
  
  // Default goals if doing well
  if (nextGoals.length === 0) {
    nextGoals.push(
      "Maintain current positive spending habits",
      "Consider increasing investment contributions",
      "Build emergency fund to 6 months of expenses"
    );
  }
  
  return {
    current: currentScore,
    previous: previousScore,
    change: currentScore - previousScore,
    breakdown: scoreBreakdown,
    nextGoals: nextGoals.slice(0, 3)
  };
}

export default function FinancialInsightsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spendingBreakdown, setSpendingBreakdown] = useState<SpendingCategory[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [activeInsightId, setActiveInsightId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [savingsOpportunity, setSavingsOpportunity] = useState(0);

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

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch both transactions and budget categories
        const [transactionsData, budgetData] = await Promise.all([
          getTransactions(user.uid),
          getBudgetCategories(user.uid)
        ]);
        
        setTransactions(transactionsData);
        setBudgetCategories(budgetData);
        
        // Analyze the data
        const analysis = analyzeTransactions(transactionsData, budgetData);
        setSpendingBreakdown(analysis.spendingBreakdown);
        setInsights(analysis.insights);
        setHealthScore(analysis.healthScore);
        setTotalSpent(analysis.totalSpent);
        setTotalBudget(analysis.totalBudget);
        setSavingsOpportunity(analysis.savingsOpportunity);
        
        console.log('Financial analysis completed:', {
          transactions: transactionsData.length,
          budgets: budgetData.length,
          insights: analysis.insights.length,
          healthScore: analysis.healthScore?.current
        });
        
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Error",
          description: "Failed to load financial data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  // Show loading state during SSR or data fetching
  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden">
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

  // Calculate key metrics
  const isOverBudget = totalSpent > totalBudget && totalBudget > 0;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overBudgetCategories = spendingBreakdown.filter(cat => cat.isOverBudget).length;

  // Function to render insight icon based on type and impact
  const renderInsightIcon = (insight: Insight) => {
    const backgroundColor = 
      insight.type === "expense" 
        ? "bg-rose-100 dark:bg-rose-900/30" 
        : insight.type === "opportunity"
          ? "bg-blue-100 dark:bg-blue-900/30"
          : "bg-green-100 dark:bg-green-900/30";
    
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
            : insight.type === "opportunity"
              ? "from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent"
              : "from-green-500/5 via-transparent to-green-500/5 dark:from-green-500/10 dark:to-transparent"
        } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            {renderInsightIcon(insight)}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{insight.title}</h3>
                <Badge 
                  variant={insight.impact === "high" ? "destructive" : insight.impact === "medium" ? "default" : "secondary"} 
                  className="ml-2"
                >
                  {insight.impact} impact
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{insight.description}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/30 mb-4">
            <div className="flex items-start">
              <Lightbulb className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{insight.actionable}</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="font-semibold mr-2 text-gray-900 dark:text-white">Potential savings:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {insight.savings}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveInsightId(insight.id === activeInsightId ? null : insight.id)}
              className="hover:bg-white/50 dark:hover:bg-white/10 text-sm"
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
          
          {isActive && insight.category && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Category: {insight.category}</h4>
                <p className="mb-2">This insight is based on your spending patterns and budget allocations for this category.</p>
                {insight.type === 'expense' && (
                  <p className="text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Action needed to improve your financial health score
                  </p>
                )}
                {insight.type === 'achievement' && (
                  <p className="text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Great job maintaining good financial habits!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to render the spending breakdown section
  const renderSpendingBreakdown = () => {
    if (spendingBreakdown.length === 0) {
      return (
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No spending data yet</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Start by adding some transactions and setting up budgets to see your breakdown here
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Link href="/dashboard/transactions">
                <DollarSign className="w-4 h-4 mr-2" />
                Add Transactions
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 dark:from-blue-500/10 dark:to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Spending vs Budget</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time analysis of your spending categories this month</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {spendingBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{item.category}</span>
                    {item.trend === "up" && item.monthlyChange > 0 && (
                      <div className="flex items-center ml-2">
                        <TrendingUp className="h-3 w-3 text-rose-500" />
                        <span className="text-xs text-rose-500 ml-1">
                          +{item.monthlyChange}%
                        </span>
                      </div>
                    )}
                    {item.trend === "down" && (
                      <div className="flex items-center ml-2">
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500 ml-1">
                          {item.monthlyChange}%
                        </span>
                      </div>
                    )}
                    {item.isOverBudget && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Over Budget
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-right">
                    <span className={`font-mono ${item.isOverBudget ? "text-rose-600 font-medium" : "text-gray-900 dark:text-white"}`}>
                      ${item.amount.toFixed(0)}
                    </span>
                    {item.budget > 0 && (
                      <span className="text-gray-500 dark:text-gray-400"> / ${item.budget}</span>
                    )}
                  </div>
                </div>
                {item.budget > 0 && (
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.isOverBudget ? "bg-rose-500" : item.percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    ></div>
                  </div>
                )}
                {item.budget === 0 && item.amount > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    No budget set for this category
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white">Total This Month</h4>
              <div>
                <span className="font-mono font-medium text-gray-900 dark:text-white">${totalSpent.toFixed(0)}</span>
                {totalBudget > 0 && (
                  <span className="text-gray-500 dark:text-gray-400"> / ${totalBudget.toFixed(0)}</span>
                )}
              </div>
            </div>
            {totalBudget > 0 && (
              <>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-rose-500" : budgetUtilization > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs">
                  {isOverBudget ? (
                    <p className="text-rose-600 font-medium">
                      You're ${(totalSpent - totalBudget).toFixed(0)} over your monthly budget ({budgetUtilization.toFixed(1)}% used)
                    </p>
                  ) : (
                    <p className="text-emerald-600 font-medium">
                      You have ${(totalBudget - totalSpent).toFixed(0)} remaining this month ({budgetUtilization.toFixed(1)}% used)
                    </p>
                  )}
                </div>
              </>
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
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Financial Health Score</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered assessment based on your real spending data</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{healthScore.current}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">out of 100</div>
                  </div>
                </div>
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${healthScore.current * 2.51} 251`}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${
                      healthScore.current >= 80 ? 'text-green-500' :
                      healthScore.current >= 60 ? 'text-amber-500' : 'text-rose-500'
                    }`}
                  />
                </svg>
              </div>
              <div className="mt-2">
                <Badge variant={healthScore.change > 0 ? "default" : "destructive"} className="font-mono">
                  {healthScore.change > 0 ? "+" : ""}{healthScore.change} pts
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">from last calculation</p>
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
                        className={`h-full rounded-full transition-all duration-500 ${
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
                    <li key={index} className="flex items-start text-sm">
                      <Target className="h-3 w-3 mr-2 text-purple-600 flex-shrink-0 mt-0.5" />
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
    // Get the top 3 highest priority insights
    const priorityInsights = [...insights]
      .sort((a, b) => {
        // Sort by priority first, then by impact
        if (a.priority !== b.priority) return a.priority - b.priority;
        const impactValues = { high: 3, medium: 2, low: 1 };
        return impactValues[b.impact] - impactValues[a.impact];
      })
      .slice(0, 3);
      
    if (priorityInsights.length === 0) {
      return (
        <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl">
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No action items yet</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep spending and we'll generate personalized action items for you
            </p>
          </div>
        </div>
      );
    }

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
              <p className="text-sm text-gray-600 dark:text-gray-400">Based on your spending data - tackle these for maximum impact</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {priorityInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/20 dark:to-gray-700/20 border border-gray-200/50 dark:border-gray-700/30">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0
                  ${insight.impact === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
                    insight.impact === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {insight.actionable}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      className={`text-xs ${
                        insight.impact === 'high' 
                          ? 'bg-rose-500 hover:bg-rose-600' 
                          : insight.impact === 'medium' 
                            ? 'bg-amber-500 hover:bg-amber-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {insight.impact} impact
                    </Badge>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {insight.savings}
                    </span>
                  </div>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 flex-shrink-0">
                  Start
                </Button>
              </div>
            ))}
          </div>
          
          {insights.length > 3 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" className="bg-white/50 dark:bg-white/5">
                View All {insights.length} Insights
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render potential savings summary
  const renderSavingsSummary = () => {
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
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${savingsOpportunity > 0 ? savingsOpportunity.toFixed(0) : "0"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {savingsOpportunity > 0 
                  ? "by following our recommendations" 
                  : "Great job! No major savings opportunities detected"}
              </div>
            </div>
            {savingsOpportunity > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Annual Impact</div>
                <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                  ${(savingsOpportunity * 12).toFixed(0)}
                </div>
              </div>
            )}
          </div>
          
          {overBudgetCategories > 0 && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
              <div className="flex items-center text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  {overBudgetCategories} categories over budget this month
                </span>
              </div>
            </div>
          )}
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

      <div className={`relative z-10 p-4 sm:p-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Enhanced Header */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="group bg-white/50 dark:bg-white/5 border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300"
                  asChild
                >
                  <Link href="/dashboard" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </Button>

                <div className="flex items-center space-x-2">
                  {healthScore && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <Brain className="w-3 h-3 mr-1" />
                      Score: {healthScore.current}/100
                    </Badge>
                  )}
                  {overBudgetCategories > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {overBudgetCategories} Over Budget
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent mb-2">
                  Financial Insights
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  AI-powered analysis of your spending patterns with personalized recommendations
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-white/20 shadow-2xl h-48 flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <p className="text-gray-600 dark:text-gray-300">Loading insights...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Top Row: Health Score and Spending Breakdown */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  {renderHealthScore()}
                </div>
                <div className="md:col-span-1">
                  {renderSpendingBreakdown()}
                </div>
              </div>

              {/* Second Row: Action Items and Savings */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  {renderActionItems()}
                </div>
                <div className="md:col-span-1">
                  {renderSavingsSummary()}
                </div>
              </div>

              {/* Full Width: All Insights */}
              {insights.length > 0 && (
                <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/50 dark:border-white/20 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 dark:from-purple-500/10 dark:to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                        All Financial Insights
                      </h3>
                      <div className="relative">
                        <Zap className="w-5 h-5 text-purple-500 animate-pulse" />
                        <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping opacity-75" />
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {insights.length} insights generated
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {insights.map(insight => renderInsightCard(insight))}
                    </div>
                    
                    {insights.length === 0 && (
                      <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Building Your Insights
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Add more transactions and set up budgets to get personalized financial insights
                        </p>
                        <div className="flex justify-center space-x-4">
                          <Button asChild>
                            <Link href="/dashboard/transactions">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Add Transactions
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href="/dashboard/budgets">
                              <Target className="w-4 h-4 mr-2" />
                              Set Budgets
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-indigo-200/50 dark:border-indigo-700/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Want to improve your financial health?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Take action on your insights and track your progress over time
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/budgets">
                        <Target className="w-4 h-4 mr-2" />
                        Manage Budgets
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/transactions">
                        <Activity className="w-4 h-4 mr-2" />
                        View Transactions
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get More Insights
                    </Button>
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