"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface AddGoalButtonProps {
  onClick: () => void
}

export function AddGoalButton({ onClick }: AddGoalButtonProps) {
  return (
    <Button className="bg-rose-600 hover:bg-rose-700" onClick={onClick}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Goal
    </Button>
  )
}
