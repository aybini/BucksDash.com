"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/firebase-auth"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sparkles } from "lucide-react"
import { getSubscriptionDetails } from "@/lib/firebase-service"
import { Badge } from "@/components/ui/badge"

export function UserNav() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const checkSubscription = async () => {
        try {
          const subscription = await getSubscriptionDetails(user.uid)
          setIsPremium(subscription && subscription.status === "active")
        } catch (error) {
          console.error("Error checking subscription:", error)
        }
      }

      checkSubscription()
    }
  }, [user])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const navigateTo = (path: string) => {
    setIsDropdownOpen(false)
    router.push(path)
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full active:scale-95 touch-manipulation"
          aria-label="Open user menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-user.jpg" alt={user?.displayName || "User"} />
            <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          {isPremium && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white">
              <Sparkles className="h-3 w-3" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
            {isPremium && (
              <Badge className="mt-1 bg-rose-600 w-fit">
                <Sparkles className="h-3 w-3 mr-1" /> Premium
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => navigateTo("/dashboard/profile")}
            className="py-3 cursor-pointer touch-manipulation"
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigateTo("/dashboard/settings")}
            className="py-3 cursor-pointer touch-manipulation"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigateTo("/dashboard/billing")}
            className="py-3 cursor-pointer touch-manipulation"
          >
            Billing
            {isPremium && <Sparkles className="ml-2 h-3 w-3 text-rose-600" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="py-3 cursor-pointer touch-manipulation"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing out...
            </>
          ) : (
            "Log out"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
