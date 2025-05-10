"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  BanknoteIcon,
  PiggyBank,
  Users,
} from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Overview",
    },
    {
      href: "/dashboard/transactions",
      icon: Receipt,
      title: "Transactions",
    },
    {
      href: "/dashboard/budgets",
      icon: Wallet,
      title: "Budgets",
    },
    {
      href: "/dashboard/goals",
      icon: Target,
      title: "Goals",
    },
    {
      href: "/dashboard/debt",
      icon: CreditCard,
      title: "Debt",
    },
    {
      href: "/dashboard/income",
      icon: DollarSign,
      title: "Income",
    },
    {
      href: "/dashboard/subscriptions",
      icon: BarChart3,
      title: "Subscriptions",
    },
    {
      href: "/dashboard/calendar",
      icon: Calendar,
      title: "Calendar",
    },
    {
      href: "/dashboard/reports",
      icon: PiggyBank,
      title: "Reports",
    },
    {
      href: "/dashboard/learning",
      icon: BookOpen,
      title: "Learning",
    },
    {
      href: "/dashboard/connect-accounts",
      icon: BanknoteIcon,
      title: "Bank Accounts",
    },
    {
      href: "/dashboard/community",
      icon: Users,
      title: "Community",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route, index) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === route.href ? "bg-accent" : "transparent",
          )}
        >
          <route.icon className="mr-2 h-4 w-4" />
          <span>{route.title}</span>
        </Link>
      ))}
    </nav>
  )
}
