"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getSubscriptionDetails } from "@/lib/firebase-service"

export default function PremiumFeaturesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return

      try {
        const subscription = await getSubscriptionDetails(user.uid)
        if (subscription && subscription.status === "active") {
          // Redirect premium users to the community page
          router.push("/dashboard/community")
        }
      } catch (error) {
        console.error("Error checking subscription status:", error)
      }
    }

    if (user && !loading) {
      checkStatus()
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Premium Features</h2>
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unlock Premium Features</AlertTitle>
        <AlertDescription>
          To access premium features, you need a premium account. Since you are currently on the basic plan, you would
          need to delete your current account and create a new one with a premium subscription.
        </AlertDescription>
      </Alert>
    </div>
  )
}
