"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, FileText, Calculator, Plus } from "lucide-react"
import { BusinessExpenseForm } from "@/components/forms/business-expense-form"
import { InvoiceForm } from "@/components/forms/invoice-form"

export function BusinessExpenses() {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)
  const [isTaxFormOpen, setIsTaxFormOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Expenses</CardTitle>
              <CardDescription>Track and categorize business expenses</CardDescription>
            </div>
            <Badge className="bg-purple-500">
              <Briefcase className="mr-1 h-3 w-3" /> Entrepreneur Feature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="taxes">Taxes</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">This Month</h4>
                <p className="text-sm font-medium">$1,245.67</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Office Supplies</p>
                      <p className="text-xs text-muted-foreground">Amazon - July 15, 2023</p>
                    </div>
                  </div>
                  <p className="font-medium">$85.99</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Software Subscription</p>
                      <p className="text-xs text-muted-foreground">Adobe - July 10, 2023</p>
                    </div>
                  </div>
                  <p className="font-medium">$52.99</p>
                </div>
              </div>

              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => setIsExpenseFormOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Business Expense
              </Button>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Outstanding Invoices</h4>
                <p className="text-sm font-medium text-amber-600">$3,500.00</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Client Project</p>
                      <p className="text-xs text-muted-foreground">Due in 5 days</p>
                    </div>
                  </div>
                  <p className="font-medium">$2,000.00</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Consulting Fee</p>
                      <p className="text-xs text-muted-foreground">Due in 12 days</p>
                    </div>
                  </div>
                  <p className="font-medium">$1,500.00</p>
                </div>
              </div>

              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => setIsInvoiceFormOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Create Invoice
              </Button>
            </TabsContent>

            <TabsContent value="taxes" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Quarterly Tax Estimate</h4>
                <p className="text-sm font-medium text-red-600">$875.00</p>
              </div>

              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Q3 Estimated Payment</p>
                    <p className="text-xs text-muted-foreground">Due September 15, 2023</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income (YTD):</span>
                    <span>$35,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expenses (YTD):</span>
                    <span>$12,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Profit:</span>
                    <span>$22,500.00</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => setIsTaxFormOpen(true)}>
                <Calculator className="h-4 w-4 mr-1" /> Calculate Tax Payment
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <BusinessExpenseForm isOpen={isExpenseFormOpen} onClose={() => setIsExpenseFormOpen(false)} />
      <InvoiceForm isOpen={isInvoiceFormOpen} onClose={() => setIsInvoiceFormOpen(false)} />
      <BusinessExpenseForm isOpen={isTaxFormOpen} onClose={() => setIsTaxFormOpen(false)} />
    </>
  )
}
