"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Home, PieChart, CreditCard, Settings, LogOut, Bell, User, Wallet } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function MobileNavigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Close the sheet when the pathname changes (navigation occurs)
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    // Fetch notification count
    if (user) {
      fetchNotificationCount()
    }
  }, [user])

  const fetchNotificationCount = async () => {
    // This would be implemented to fetch from your backend
    // For now, we'll simulate with a random number
    setNotificationCount(Math.floor(Math.random() * 5))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      name: "Subscriptions",
      href: "/subscriptions",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border flex items-center justify-between px-4 md:hidden">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>

        <div className="flex space-x-6">
          <Link href="/dashboard" className={pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}>
            <Home className="h-6 w-6" />
          </Link>
          <Link
            href="/transactions"
            className={pathname === "/transactions" ? "text-primary" : "text-muted-foreground"}
          >
            <Wallet className="h-6 w-6" />
          </Link>
          <Link href="/analytics" className={pathname === "/analytics" ? "text-primary" : "text-muted-foreground"}>
            <PieChart className="h-6 w-6" />
          </Link>
        </div>

        <Link href="/notifications" className="relative">
          <Bell className="h-6 w-6" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
              {notificationCount}
            </Badge>
          )}
        </Link>
      </div>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
              <AvatarFallback>{user?.displayName ? getInitials(user.displayName) : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.displayName || user?.email}</p>
              <p className="text-sm text-muted-foreground">Premium Member</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="space-y-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors ${
                pathname === item.href
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-6 space-y-4">
          <Link
            href="/account"
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <User className="h-5 w-5" />
            Account
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
