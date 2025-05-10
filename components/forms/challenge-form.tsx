"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Trophy } from "lucide-react"

interface ChallengeFormProps {
  isOpen: boolean
  onClose: () => void
  challenge: {
    title: string
    description: string
  }
}

export function ChallengeForm({ isOpen, onClose, challenge }: ChallengeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Challenge started",
        description: `You've joined the ${challenge.title} challenge!`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={`Join ${challenge.title}`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="challenge-form" className="bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? "Joining..." : "Start Challenge"}
          </Button>
        </div>
      }
    >
      <form id="challenge-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
          <p className="text-center text-sm text-gray-500">{challenge.description}</p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <p>
            By joining this challenge, you commit to following the rules and tracking your progress. You can share your
            progress with friends and earn badges for completing milestones.
          </p>
        </div>
      </form>
    </Modal>
  )
}
