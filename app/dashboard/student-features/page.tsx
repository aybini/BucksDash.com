import type { Metadata } from "next"
import { RoommateExpenses } from "@/components/student/roommate-expenses"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Student Features | Rose Finance",
  description: "Special features designed for students to manage their finances better.",
}

export default function StudentFeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <PageHeader
        heading="Student Features"
        subheading="Special tools designed to help students manage their finances better"
      />

      <div className="grid gap-6">
        {/* Roommate Expense Splitter */}
        <RoommateExpenses />

        {/* Future Student Tools Placeholder */}
        <div className="text-muted-foreground text-center text-sm">
          More student tools are coming soon!
        </div>
      </div>
    </div>
  )
}
