import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DebtOverview() {
  const debts = [
    { name: "Credit Card", amount: 2500, interestRate: 15.99 },
    { name: "Student Loan", amount: 20000, interestRate: 4.5 },
    { name: "Car Loan", amount: 15000, interestRate: 3.9 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Overview</CardTitle>
        <CardDescription>Manage and track your debts</CardDescription>
      </CardHeader>
      <CardContent>
        {debts.map((debt) => (
          <div key={debt.name} className="flex justify-between mb-2">
            <span>{debt.name}</span>
            <span>
              ${debt.amount} ({debt.interestRate}%)
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
