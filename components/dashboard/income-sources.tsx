"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { deleteIncomeSource, type IncomeSource } from "@/lib/firebase-service"
import { IncomeSourceForm } from "@/components/forms/income-source-form"
import { Edit, Trash2, DollarSign, AlertCircle } from "lucide-react"
import { format } from "date-fns"
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

interface IncomeSourcesProps {
  incomeSources: IncomeSource[]
  isLoading: boolean
  onIncomesChange: (incomeSources: IncomeSource[]) => void
}

export function IncomeSources({ incomeSources = [], isLoading = false, onIncomesChange }: IncomeSourcesProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedIncomeSource, setSelectedIncomeSource] = useState<IncomeSource | undefined>(undefined)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleEdit = (incomeSource: IncomeSource) => {
    setSelectedIncomeSource(incomeSource)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setIncomeToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!user || !incomeToDelete) return

    try {
      await deleteIncomeSource(user.uid, incomeToDelete)

      // Update local state
      const updatedSources = incomeSources.filter((source) => source.id !== incomeToDelete)
      onIncomesChange(updatedSources)

      toast({
        title: "Income source deleted",
        description: "The income source has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting income source:", error)
      toast({
        title: "Error",
        description: "Failed to delete income source. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setIncomeToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading income sources...</p>
            </div>
          ) : incomeSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No income sources yet</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Add your sources of income to track your earnings</p>
            </div>
          ) : (
            <div className="space-y-6">
              {incomeSources.length >= 4 && (
                <div className="flex items-center p-3 bg-amber-50 text-amber-800 rounded-md mb-4">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">You've reached the maximum of 4 income sources for the basic plan.</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {incomeSources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{source.name}</h3>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(source)}
                          className="h-8 w-8 p-0 touch-manipulation active:scale-95"
                          aria-label={`Edit ${source.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(source.id!)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 touch-manipulation active:scale-95"
                          aria-label={`Delete ${source.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-rose-600 mb-1">{formatCurrency(source.amount)}</p>
                    <p className="text-sm text-gray-500">
                      {source.frequency.charAt(0).toUpperCase() + source.frequency.slice(1)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Entry date:{" "}
                      {format(new Date((source.entryDate as any).toDate?.() || source.entryDate), "MMM d, yyyy")}
                    </p>
                    {source.notes && <p className="text-sm mt-2 border-t pt-2">{source.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <IncomeSourceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        incomeSource={selectedIncomeSource}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this income source. This action cannot be undone.
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
