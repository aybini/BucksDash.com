"use client";
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, DollarSign, PieChart, Target, Settings } from "lucide-react"

interface DashboardShellProps {
  children: ReactNode
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/dashboard/transactions", icon: DollarSign },
  { name: "Budgets", href: "/dashboard/budgets", icon: PieChart },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="text-2xl font-bold text-rose-600 mb-6">BucksDash</div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive ? "bg-gray-100 dark:bg-gray-800 text-rose-600" : "text-gray-700 dark:text-gray-300"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Optional Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-900">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 space-y-4 p-6 bg-gray-50 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  )
}
