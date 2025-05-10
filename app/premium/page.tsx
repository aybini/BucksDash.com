import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { AIRecommendations } from "@/components/premium/ai-recommendations"
import { SocialChallenges } from "@/components/premium/social-challenges"

export const metadata: Metadata = {
  title: "Premium Features | Rose Finance",
  description: "Access exclusive premium features to supercharge your financial journey.",
}

export default function PremiumPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Premium Features</h1>
          <p className="text-muted-foreground mt-2">
            Exclusive tools and insights to accelerate your financial growth.
          </p>
        </div>

        <div className="grid gap-8">
          <AIRecommendations />
          <SocialChallenges />
        </div>
      </div>
    </DashboardShell>
  )
}
