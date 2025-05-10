"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-init"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Calendar,
  BookOpen,
  Settings,
  Target,
  Wallet,
  Receipt,
  Crown,
  User,
  BarcodeIcon,
  LogOut,
  BanknoteIcon,
  PiggyBank,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function MorePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isCheckingPremium, setIsCheckingPremium] = useState(true)

  useEffect(() => {
    setIsClient(true)

    // If not loading and no user, redirect to login
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  // Check if user has premium subscription
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) return

      setIsCheckingPremium(true)
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setIsPremium(userData.plan === "premium" && userData.subscription?.status === "active")
        }
      } catch (error) {
        console.error("Error checking premium status:", error)
      } finally {
        setIsCheckingPremium(false)
      }
    }

    if (user) {
      checkPremiumStatus()
    }
  }, [user])

  // Show loading state or nothing during SSR
  if (loading || !isClient || isCheckingPremium) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </DashboardShell>
    )
  }

  // Define all routes
  const allRoutes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Overview",
      description: "View your financial summary",
    },
    {
      href: "/dashboard/transactions",
      icon: Receipt,
      title: "Transactions",
      description: "Manage your transactions",
    },
    {
      href: "/dashboard/budgets",
      icon: Wallet,
      title: "Budgets",
      description: "Track your spending by category",
    },
    {
      href: "/dashboard/goals",
      icon: Target,
      title: "Goals",
      description: "Set and track financial goals",
    },
    {
      href: "/dashboard/debt",
      icon: CreditCard,
      title: "Debt",
      description: "Manage and pay down debt",
    },
    {
      href: "/dashboard/income",
      icon: DollarSign,
      title: "Income",
      description: "Track your income sources",
    },
    {
      href: "/dashboard/subscriptions",
      icon: BarChart3,
      title: "Subscriptions",
      description: "Manage recurring payments",
    },
    {
      href: "/dashboard/calendar",
      icon: Calendar,
      title: "Calendar",
      description: "View upcoming bills and payments",
    },
    {
      href: "/dashboard/reports",
      icon: PiggyBank,
      title: "Reports",
      description: "Analyze your financial data",
    },
    {
      href: "/dashboard/learning",
      icon: BookOpen,
      title: "Learning",
      description: "Financial education resources",
    },
  ]

  // Premium routes
  const premiumRoutes = [
    {
      href: "/dashboard/premium",
      icon: Crown,
      title: "Premium Dashboard",
      description: "Access premium features",
      isPremium: true,
    },
    {
      href: "/dashboard/connect-accounts",
      icon: BanknoteIcon,
      title: "Bank Accounts",
      description: "Connect and manage bank accounts",
      isPremium: true,
    },
    {
      href: "/dashboard/premium-features",
      icon: Crown,
      title: "Premium Features",
      description: "Explore premium features",
      isPremium: true,
    },
  ]

  // Account routes
  const accountRoutes = [
    {
      href: "/dashboard/profile",
      icon: User,
      title: "Profile",
      description: "Manage your profile",
    },
    {
      href: "/dashboard/billing",
      icon: BarcodeIcon,
      title: "Billing",
      description: "Manage your subscription",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
      description: "Configure app settings",
    },
  ]

  // Combine routes based on premium status
  const displayRoutes = isPremium
    ? [...allRoutes, ...premiumRoutes, ...accountRoutes]
    : [...allRoutes, ...accountRoutes]

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">More Options</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center p-4 rounded-lg border hover:bg-accent",
                route.isPremium ? "border-rose-200 dark:border-rose-800" : "",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full mr-4",
                  route.isPremium ? "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400" : "bg-muted",
                )}
              >
                <route.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className={cn("font-medium", route.isPremium ? "text-rose-600 dark:text-rose-400" : "")}>
                  {route.title}
                </h3>
                <p className="text-sm text-muted-foreground">{route.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <button onClick={() => signOut()} className="flex items-center p-4 rounded-lg border hover:bg-accent mt-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 mr-4">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">Log Out</h3>
            <p className="text-sm text-muted-foreground">Sign out of your account</p>
          </div>
        </button>
      </div>
    </DashboardShell>
  )
}
