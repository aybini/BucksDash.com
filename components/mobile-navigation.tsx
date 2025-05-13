"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, Home, PieChart, CreditCard, Settings, LogOut, Bell, User, Wallet, BarChart3 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function MobileNavigation() {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    // Simulated notification count for demo purposes
    setNotificationCount(Math.floor(Math.random() * 5))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!isMounted) return null

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-6 w-6" />,
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: <Wallet className="h-6 w-6" />,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: <PieChart className="h-6 w-6" />,
    },
    {
      name: "Subscriptions",
      href: "/subscriptions",
      icon: <CreditCard className="h-6 w-6" />,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-6 w-6" />,
    },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border flex items-center justify-between px-4 md:hidden">
        
        {/* Bottom Navigation Bar */}
        <div className="flex justify-around w-full">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Notification Icon */}
        <Link href="/notifications" className="relative">
          <Bell className="h-6 w-6" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white rounded-full">
              {notificationCount}
            </Badge>
          )}
        </Link>
      </div>

      {/* Sliding Menu for Profile and More Options */}
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 fixed bottom-20 right-4 z-50">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

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
