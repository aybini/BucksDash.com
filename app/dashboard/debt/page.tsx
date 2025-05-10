"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DebtAccounts } from "@/components/dashboard/debt-accounts"
import { DebtPayoffCalculator } from "@/components/dashboard/debt-payoff-calculator"
import { useAuth } from "@/lib/auth-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-init"

interface DebtAccount {
  id?: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  type: string
  userId?: string
}

export default function DebtPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [accounts, setAccounts] = useState<DebtAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchDebtAccounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const accountsRef = collection(db, `users/${user.uid}/debtAccounts`)
      const snapshot = await getDocs(accountsRef)

      const fetchedAccounts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DebtAccount[]

      setAccounts(fetchedAccounts)
    } catch (error) {
      console.error("Error fetching debt accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAccounts = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    setIsClient(true)
    if (!loading && !user && isClient) {
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  useEffect(() => {
    if (user && isClient) {
      fetchDebtAccounts()
    }
  }, [user, isClient, refreshTrigger])

  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Debt Management</h2>
      </div>

      <div id="debt-accounts">
        <DebtAccounts accounts={accounts} isLoading={isLoading} onAccountsChange={refreshAccounts} />
      </div>

      <DebtPayoffCalculator accounts={accounts} isLoading={isLoading} />
    </div>
  )
}
