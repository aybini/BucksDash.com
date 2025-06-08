import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BudgetsList } from "@/components/budgets/budgets-list"

export const metadata: Metadata = {
  title: "Budgets | BucksDash",
  description: "Manage your monthly budgets and track your spending",
}

export default function BudgetsPage() {
  return (
    
<BudgetsList />
    
  )
}
