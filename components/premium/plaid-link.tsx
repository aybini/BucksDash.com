"use client"

import { useState, useCallback, useEffect } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPlaidLinkToken } from "@/lib/plaid-actions"

interface PlaidLinkProps {
  userId: string
  onSuccess: (publicToken: string, metadata: any) => void
  onExit?: () => void
  isUpdate?: boolean
  itemId?: string
  buttonText?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function PlaidLink({
  userId,
  onSuccess,
  onExit,
  isUpdate = false,
  itemId,
  buttonText = "Connect your accounts",
  className,
  variant = "default",
}: PlaidLinkProps) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState<() => void>(() => {})

  useEffect(() => {
    if (token) {
      const config = {
        token: token || "",
        onSuccess: (public_token: string, metadata: any) => {
          try {
            // Ensure metadata is properly structured before passing it
            const safeMetadata = metadata || {}
            onSuccess(public_token, safeMetadata)
          } catch (err) {
            console.error("Error in Plaid onSuccess callback:", err)
            setError("Error processing bank connection")
          }
        },
        onExit: () => {
          try {
            if (onExit) {
              onExit()
            }
          } catch (err) {
            console.error("Error in Plaid onExit callback:", err)
          }
        },
      }

      const { open: plaidOpen, ready: plaidReady } = usePlaidLink(config)
      setOpen(() => plaidOpen)
      setReady(plaidReady)
    } else {
      setOpen(() => () => {})
      setReady(false)
    }
  }, [token, onSuccess, onExit])

  const fetchToken = useCallback(async () => {
    if (!userId) {
      setError("User ID is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await createPlaidLinkToken(userId, isUpdate, itemId)

      if (response.success && response.linkToken) {
        setToken(response.linkToken)
      } else {
        // If we get an error from the server, check if we should use mock mode
        if (response.error && response.error.includes("PLAID_API")) {
          console.log("Using mock mode due to Plaid API error")
          setIsMockMode(true)
        } else {
          setError(response.error || "Failed to create link token")
        }
      }
    } catch (err: any) {
      console.error("Error fetching token:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [userId, isUpdate, itemId])

  useEffect(() => {
    if (userId) {
      fetchToken()
    }
  }, [fetchToken, userId])

  const handleMockSuccess = useCallback(() => {
    // Create a mock public token and metadata
    const mockPublicToken = "mock-public-token-" + Math.random().toString(36).substring(2, 15)
    const mockMetadata = {
      institution: {
        institution_id: "mock-institution",
        name: "Mock Bank",
      },
      accounts: [
        {
          id: "mock-account-1",
          name: "Mock Checking",
          type: "depository",
          subtype: "checking",
          mask: "1234",
        },
      ],
    }

    // Call onSuccess with the mock data
    onSuccess(mockPublicToken, mockMetadata)
  }, [onSuccess])

  const handleClick = useCallback(() => {
    try {
      if (isMockMode) {
        handleMockSuccess()
      } else if (ready && token) {
        open()
      } else {
        fetchToken()
      }
    } catch (err) {
      console.error("Error handling click:", err)
      setError("Failed to open bank connection dialog")
    }
  }, [ready, token, open, fetchToken, isMockMode, handleMockSuccess])

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isMockMode && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Using mock mode due to Plaid API issues. This will simulate connecting a bank account.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleClick}
        disabled={(!ready && !isMockMode) || isLoading}
        className={className}
        variant={variant}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  )
}
