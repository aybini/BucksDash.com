"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Shield,
  Zap,
  BookOpen,
  BarChart3,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react"

export default function MorePage() {
  const { logOut, userPlan } = useAuth()
  const isPremium = userPlan === "premium"

  const menuItems = [
    {
      title: "Account",
      items: [
        { name: "Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5 mr-3" /> },
        { name: "Settings", href: "/dashboard/settings", icon: <Settings className="h-5 w-5 mr-3" /> },
        { name: "Billing", href: "/dashboard/billing", icon: <CreditCard className="h-5 w-5 mr-3" /> },
      ],
    },
    {
      title: "Features",
      items: [
        { name: "Learning Center", href: "/dashboard/learning", icon: <BookOpen className="h-5 w-5 mr-3" /> },
        { name: "Reports", href: "/dashboard/reports", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
        { name: "Income", href: "/dashboard/income", icon: <DollarSign className="h-5 w-5 mr-3" /> },
        { name: "Debt", href: "/dashboard/debt", icon: <TrendingUp className="h-5 w-5 mr-3" /> },
        { name: "Calendar", href: "/dashboard/calendar", icon: <Calendar className="h-5 w-5 mr-3" /> },
      ],
    },
  ]

  if (isPremium) {
    menuItems.push({
      title: "Premium",
      items: [
        {
          name: "Premium Features",
          href: "/dashboard/premium-features",
          icon: <Zap className="h-5 w-5 mr-3 text-yellow-500" />,
        },
        {
          name: "Connect Accounts",
          href: "/dashboard/connect-accounts",
          icon: <Shield className="h-5 w-5 mr-3" />,
        },
      ],
    })
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">More</h1>

      {menuItems.map((section) => (
        <Card key={section.title} className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {section.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center p-3 rounded-md hover:bg-muted transition-colors"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="mt-4">
        <CardContent className="pt-4">
          <Button variant="destructive" className="w-full" onClick={() => logOut()}>
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {!isPremium && (
        <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg">
          <CardContent className="pt-6">
            <CardTitle className="mb-2">Upgrade to Premium</CardTitle>
            <CardDescription className="text-white/80 mb-4">
              Get access to advanced features and connect your accounts.
            </CardDescription>
            <Button variant="secondary" className="w-full bg-white text-rose-600 hover:bg-white/90" asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
