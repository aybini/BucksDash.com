import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import Link from "next/link"

interface ShareBadgePageProps {
  params: {
    userId: string
    badgeName: string
  }
}

export async function generateMetadata({ params }: ShareBadgePageProps): Promise<Metadata> {
  const badgeName = decodeURIComponent(params.badgeName)

  return {
    title: `${badgeName} Badge | Rose Finance`,
    description: `Check out the ${badgeName} badge I earned in Rose Finance!`,
    openGraph: {
      title: `${badgeName} Badge | Rose Finance`,
      description: `Check out the ${badgeName} badge I earned in Rose Finance!`,
      images: [`/api/share/badge/${encodeURIComponent(badgeName)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${badgeName} Badge | Rose Finance`,
      description: `Check out the ${badgeName} badge I earned in Rose Finance!`,
      images: [`/api/share/badge/${encodeURIComponent(badgeName)}`],
    },
  }
}

export default async function ShareBadgePage({ params }: ShareBadgePageProps) {
  const badgeName = decodeURIComponent(params.badgeName)
  const userId = params.userId

  // In a real app, you would verify that the user has this badge
  // For now, we'll just display it

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Financial Achievement</CardTitle>
            <CardDescription>Check out this badge earned in Rose Finance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-primary p-6 rounded-full mb-4">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{badgeName}</h2>
            <p className="text-center text-muted-foreground mb-6">
              This badge was earned by completing a financial challenge in Rose Finance.
            </p>
            <div className="w-full bg-muted p-4 rounded-lg text-center">
              <p className="font-medium">Want to earn your own badges?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Join Rose Finance and start your financial journey today.
              </p>
              <Link href="/">
                <Button className="w-full">Get Started with Rose Finance</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
