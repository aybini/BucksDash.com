"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, PieChart, CreditCard, Settings, LogOut, Wallet, Target } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [isMounted, setIsMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, userPlan } = useAuth()
  const isPremium = userPlan === "premium"

  // Ensure component only renders client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Navigation items for bottom bar
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-6 w-6" />,
    },
    {
      name: "Transactions",
      href: "/dashboard/transactions",
      icon: <Wallet className="h-6 w-6" />,
    },
    {
      name: "Budgets",
      href: "/dashboard/budgets",
      icon: <PieChart className="h-6 w-6" />,
    },
    {
      name: "Goals",
      href: "/dashboard/goals",
      icon: <Target className="h-6 w-6" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-6 w-6" />,
    },
  ]

  // Sidebar items
  const sidebarItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Transactions", href: "/dashboard/transactions" },
    { name: "Budgets", href: "/dashboard/budgets" },
    { name: "Goals", href: "/dashboard/goals" },
    { name: "Subscriptions", href: "/dashboard/subscriptions" },
    { name: "Debt", href: "/dashboard/debt" },
    { name: "Income", href: "/dashboard/income" },
    { name: "Reports", href: "/dashboard/reports" },
    { name: "Calendar", href: "/dashboard/calendar" },
  ]

  const premiumItems = [
    { name: "Premium Features", href: "/dashboard/premium-features" },
    { name: "Connect Accounts", href: "/dashboard/connect-accounts" },
  ]

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border flex items-center justify-between px-4 md:hidden">
        <div className="grid w-full grid-cols-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-sm",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Menu Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-20 right-4 z-50 bg-background p-2 rounded-full shadow-lg"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>

        {/* Sidebar for Additional Options */}
        <SheetContent side="left" className="pr-0 sm:max-w-xs">
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                    pathname === item.href && "bg-accent"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isPremium && (
                <>
                  <div className="relative my-2 py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Premium Features</span>
                    </div>
                  </div>
                  {premiumItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                        pathname === item.href && "bg-accent"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              <div className="relative my-2 py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Settings</span>
                </div>
              </div>
              <Link
                href="/dashboard/profile"
                className={cn(
                  "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                  pathname === "/dashboard/profile" && "bg-accent"
                )}
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
