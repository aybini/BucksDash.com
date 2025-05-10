"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PlaidSecureConnection } from "@/components/premium/plaid-secure-connection"
import { Suspense } from "react"

export default function PlaidCallbackPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div>Loading...</div>}>
        <PlaidSecureConnection />
      </Suspense>
    </DashboardShell>
  )
}
