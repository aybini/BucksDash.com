"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-context"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { user, userPlan } = useAuth()
  const isPremium = userPlan === "premium"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/transactions"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/transactions" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Transactions
            </Link>
            <Link
              href="/dashboard/budgets"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/budgets" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Budgets
            </Link>
            <Link
              href="/dashboard/goals"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/goals" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Goals
            </Link>
            <Link
              href="/dashboard/subscriptions"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/subscriptions" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Subscriptions
            </Link>
            <Link
              href="/dashboard/debt"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/debt" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Debt
            </Link>
            <Link
              href="/dashboard/income"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/income" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Income
            </Link>
            <Link
              href="/dashboard/reports"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/reports" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Reports
            </Link>
            <Link
              href="/dashboard/calendar"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/calendar" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Calendar
            </Link>

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

                <Link
                  href="/dashboard/premium-features"
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                    pathname === "/dashboard/premium-features" && "bg-accent",
                  )}
                  onClick={() => setOpen(false)}
                >
                  Premium Features
                </Link>

                <Link
                  href="/dashboard/connect-accounts"
                  className={cn(
                    "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                    pathname === "/dashboard/connect-accounts" && "bg-accent",
                  )}
                  onClick={() => setOpen(false)}
                >
                  Connect Accounts
                </Link>
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
              href="/dashboard/settings"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/settings" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>

            <Link
              href="/dashboard/profile"
              className={cn(
                "flex items-center px-2 py-2 text-lg font-semibold rounded-md hover:bg-accent",
                pathname === "/dashboard/profile" && "bg-accent",
              )}
              onClick={() => setOpen(false)}
            >
              Profile
            </Link>

            {!isPremium && (
              <Link
                href="/pricing"
                className="flex items-center px-2 py-2 mt-4 text-lg font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700"
                onClick={() => setOpen(false)}
              >
                Upgrade to Premium
              </Link>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
