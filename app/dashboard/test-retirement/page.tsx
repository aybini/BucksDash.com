import { RetirementAccounts } from "@/components/accounts/retirement-accounts"
import { PageHeader } from "@/components/page-header"

export default function TestRetirementPage() {
  return (
    <main className="container mx-auto py-10 space-y-8">
      <PageHeader
        heading="Test Retirement Accounts"
        subheading="This page is used to test and verify editing of retirement account details."
      />

      <RetirementAccounts />
    </main>
  )
}
