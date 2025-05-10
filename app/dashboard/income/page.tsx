"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { IncomeSources } from "@/components/dashboard/income-sources"
import { PlusCircle } from "lucide-react"
import { IncomeSourceForm } from "@/components/forms/income-source-form"
import { getIncomeSources, type IncomeSource } from "@/lib/firebase-service"
import { useRouter } from "next/navigation"

export default function IncomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    const fetchIncomeSources = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const sources = await getIncomeSources(user.uid)
        setIncomeSources(sources)
      } catch (error) {
        console.error("Error fetching income sources:", error)
        toast({
          title: "Error",
          description: "Failed to load income sources. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchIncomeSources()
    }
  }, [user, toast])

  const handleFormSuccess = async () => {
    setIsAddIncomeOpen(false)
    if (user) {
      try {
        const sources = await getIncomeSources(user.uid)
        setIncomeSources(sources)
        toast({
          title: "Success",
          description: "Income source saved successfully.",
        })
      } catch (error) {
        console.error("Error refreshing income sources:", error)
      }
    }
  }

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Income</h1>
        <Button onClick={() => setIsAddIncomeOpen(true)} className="bg-rose-600 hover:bg-rose-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Overview</CardTitle>
          <CardDescription>Track and manage your income sources.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add your income sources to get a better understanding of your financial situation.
          </p>
          <IncomeSources
            incomeSources={incomeSources}
            isLoading={isLoading}
            onIncomesChange={setIncomeSources}
          />
        </CardContent>
      </Card>

      <IncomeSourceForm
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
