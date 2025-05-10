"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, CreditCard } from "lucide-react"
import { DebtAccountForm } from "@/components/forms/debt-account-form"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { doc, deleteDoc, addDoc, updateDoc, serverTimestamp, collection } from "firebase/firestore"
import { db } from "@/lib/firebase-init"

// Define the DebtAccount interface
interface DebtAccount {
  id?: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  type: string
  userId?: string
}

interface DebtAccountsProps {
  accounts: DebtAccount[]
  isLoading: boolean
  onAccountsChange: () => void
}

export function DebtAccounts({ accounts, isLoading, onAccountsChange }: DebtAccountsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<DebtAccount | undefined>()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleAddNew = () => {
    setSelectedAccount(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (account: DebtAccount, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedAccount(account)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAccountToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!user || !accountToDelete) return

    try {
      // Delete from Firestore
      const accountRef = doc(db, `users/${user.uid}/debtAccounts/${accountToDelete}`)
      await deleteDoc(accountRef)

      toast({
        title: "Account deleted",
        description: "Debt account has been deleted successfully.",
      })

      // Notify parent component to refresh accounts
      onAccountsChange()
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setAccountToDelete(null)
    }
  }

  const handleFormSuccess = async (account: DebtAccount) => {
    try {
      if (account.id && selectedAccount?.id) {
        // Update existing account in Firestore
        const accountRef = doc(db, `users/${user.uid}/debtAccounts/${account.id}`)
        await updateDoc(accountRef, {
          name: account.name,
          balance: account.balance,
          interestRate: account.interestRate,
          minimumPayment: account.minimumPayment,
          type: account.type,
          updatedAt: serverTimestamp(),
        })

        toast({
          title: "Account updated",
          description: "Debt account has been updated successfully.",
        })
      } else {
        // Add new account to Firestore
        const accountsRef = collection(db, `users/${user.uid}/debtAccounts`)
        await addDoc(accountsRef, {
          name: account.name,
          balance: account.balance,
          interestRate: account.interestRate,
          minimumPayment: account.minimumPayment,
          type: account.type,
          userId: user.uid,
          createdAt: serverTimestamp(),
        })

        toast({
          title: "Account added",
          description: "New debt account has been added successfully.",
        })
      }

      // Notify parent component to refresh accounts
      onAccountsChange()
      setIsFormOpen(false)
    } catch (error) {
      console.error("Error saving debt account:", error)
      toast({
        title: "Error",
        description: "Failed to save account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Debt Accounts</CardTitle>
            <CardDescription>Track and manage your debt accounts</CardDescription>
          </div>
          <Button
            className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto mt-2 sm:mt-0 touch-manipulation active:scale-95"
            onClick={handleAddNew}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No debt accounts yet</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4 px-4">
                Add your debt accounts to track balances and plan your payoff strategy
              </p>
              <Button onClick={handleAddNew} variant="outline" className="touch-manipulation active:scale-95">
                Add Your First Debt Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="mb-2 sm:mb-0 max-w-full sm:max-w-[70%]">
                    <div className="flex items-center flex-wrap gap-1">
                      <h3 className="font-medium truncate">{account.name}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        {account.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      ${account.balance.toFixed(2)} • {account.interestRate}% APR
                    </p>
                  </div>
                  <div className="flex space-x-2 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(account, e)}
                      className="h-10 w-10 p-0 touch-manipulation active:scale-95"
                      aria-label="Edit account"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(account.id!, e)}
                      className="h-10 w-10 p-0 text-red-500 hover:text-red-600 touch-manipulation active:scale-95"
                      aria-label="Delete account"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DebtAccountForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        account={selectedAccount}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Debt Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this debt account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-2 sm:mt-0 touch-manipulation active:scale-95">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 touch-manipulation active:scale-95"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
