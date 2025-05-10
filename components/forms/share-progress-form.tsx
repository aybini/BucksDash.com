"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Share2, Facebook, Twitter, Instagram } from "lucide-react"

interface ShareProgressFormProps {
  isOpen: boolean
  onClose: () => void
  challenge: {
    title: string
    progress: number
  }
}

export function ShareProgressForm({ isOpen, onClose, challenge }: ShareProgressFormProps) {
  const [platform, setPlatform] = useState("twitter")
  const [message, setMessage] = useState(
    `I'm ${challenge.progress}% through the ${challenge.title} challenge with Rose Finance! #PersonalFinance #FinancialGoals`,
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Progress shared",
        description: `Your progress has been shared on ${platform}!`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Share Your Progress"
      description="Let your friends know about your financial journey."
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="share-form" className="bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
            {isLoading ? "Sharing..." : "Share Progress"}
          </Button>
        </div>
      }
    >
      <form id="share-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="platform">Share to</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twitter">
                <div className="flex items-center">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </div>
              </SelectItem>
              <SelectItem value="facebook">
                <div className="flex items-center">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center">
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Preview</span>
          </div>
          <div className="text-sm text-gray-600 border rounded-md p-3 bg-white">{message}</div>
        </div>
      </form>
    </Modal>
  )
}
