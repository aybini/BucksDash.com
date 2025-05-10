"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import type { ReactNode } from "react"

// Define the form schema with validation
const retirementAccountSchema = z.object({
  accountName: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountNumber: z.string().min(4, {
    message: "Account number must be at least 4 characters.",
  }),
  institution: z.string().min(2, {
    message: "Institution name is required.",
  }),
  balance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Balance must be a valid number.",
  }),
  contributionType: z.enum(["traditional", "roth"]),
  contributionAmount: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Contribution amount must be a valid number.",
  }),
  contributionFrequency: z.enum(["biweekly", "monthly", "custom"]),
})

type RetirementAccountFormValues = z.infer<typeof retirementAccountSchema>

interface RetirementAccountEditorProps {
  accountType: "401k" | "ira"
  initialData?: RetirementAccountFormValues
  onSave: (data: RetirementAccountFormValues) => void
  buttonText?: string
  buttonIcon?: ReactNode
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function RetirementAccountEditor({
  accountType,
  initialData,
  onSave,
  buttonText,
  buttonIcon,
  buttonVariant = "outline",
}: RetirementAccountEditorProps) {
  const [open, setOpen] = useState(false)

  // Set default values based on account type and initial data
  const defaultValues: Partial<RetirementAccountFormValues> = {
    accountName: initialData?.accountName || `My ${accountType === "401k" ? "401(k)" : "Roth IRA"}`,
    accountNumber: initialData?.accountNumber || "",
    institution: initialData?.institution || "",
    balance: initialData?.balance || "0",
    contributionType: initialData?.contributionType || (accountType === "ira" ? "roth" : "traditional"),
    contributionAmount: initialData?.contributionAmount || "0",
    contributionFrequency: initialData?.contributionFrequency || "biweekly",
  }

  const form = useForm<RetirementAccountFormValues>({
    resolver: zodResolver(retirementAccountSchema),
    defaultValues,
  })

  const resetForm = () => {
    form.reset(defaultValues)
  }

  function onSubmit(data: RetirementAccountFormValues) {
    // Convert string values to numbers where appropriate
    const processedData = {
      ...data,
      balance: data.balance.trim(), // Ensure no extra spaces
      contributionAmount: data.contributionAmount.trim(),
    }

    // Call the parent component's save handler
    onSave(processedData)

    // Show success message and close dialog
    toast.success(`${accountType.toUpperCase()} account information updated successfully`)
    setOpen(false)
  }

  const displayText = buttonText || `Edit ${accountType.toUpperCase()}`
  const icon = buttonIcon || <Pencil className="h-3.5 w-3.5 mr-1" />

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (newOpen) {
          resetForm()
        }
        setOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size="sm" className="h-9 gap-1" data-account-type={accountType}>
          {icon}
          <span>{displayText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit {accountType === "401k" ? "401(k)" : "Roth IRA"} Account</DialogTitle>
          <DialogDescription>Update your retirement account information below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Retirement Account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Last 4 digits" {...field} />
                  </FormControl>
                  <FormDescription>For security, you can enter just the last 4 digits.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="Fidelity, Vanguard, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        // Only allow numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, "")
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {accountType === "401k" && (
              <FormField
                control={form.control}
                name="contributionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contribution type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="traditional">Traditional (Pre-tax)</SelectItem>
                        <SelectItem value="roth">Roth (After-tax)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="contributionAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        // Only allow numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, "")
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {accountType === "401k"
                      ? "How much you contribute each pay period."
                      : "How much you contribute to your IRA."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contributionFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
