import { PageHeader } from "@/components/page-header"
import { RetirementAccounts } from "@/components/accounts/retirement-accounts"
import { Card, CardContent } from "@/components/ui/card"
import { Edit } from "lucide-react"

export default function InvestmentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader heading="Investments" subheading="Track and manage your investment accounts" />

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Edit className="h-4 w-4" />
            <p>
              You can now edit your 401(k) and Roth IRA account information. Click the edit buttons to update your
              accounts.
            </p>
          </div>
        </CardContent>
      </Card>

      <RetirementAccounts />

      {/* Other investment components would go here */}
    </div>
  )
}
