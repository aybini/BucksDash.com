"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { auth } from "@/lib/firebase-init"
import { signOut } from "@/lib/firebase-auth"
import { deleteUserAccount } from "@/lib/firebase-service"
import { AlertCircle, Loader2 } from "lucide-react"
import {
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (auth.currentUser) {
      setName(auth.currentUser.displayName || "")
      setEmail(auth.currentUser.email || "")
    }
  }, [])

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      toast({ title: "Signed out", description: "You have been signed out." })
      setTimeout(() => router.push("/login"), 1000)
    } catch {
      toast({ title: "Error", description: "Failed to sign out", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!auth.currentUser) return
    setIsLoading(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name })
      toast({ title: "Success", description: "Profile updated." })
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!auth.currentUser?.email) return

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPassword)
      toast({ title: "Success", description: "Password updated." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")
    if (confirmText !== "delete my account") {
      setDeleteError("Please type 'delete my account' to confirm.")
      return
    }

    setIsDeleting(true)
    try {
      if (!auth.currentUser) throw new Error("No user is signed in")
      await deleteUserAccount(auth.currentUser.uid)
      toast({ title: "Account deleted" })
      setTimeout(() => router.push("/"), 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete account."
      setDeleteError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Account Settings</h1>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your name</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <Label className="mt-4" htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleProfileUpdate} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Secure your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handlePasswordUpdate} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your session and account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...
                </>
              ) : (
                "Sign Out"
              )}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent. Please type <strong>delete my account</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete my account"
          />
          {deleteError && (
            <div className="flex items-center text-sm text-red-500 mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setConfirmText("")
                setDeleteError("")
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== "delete my account"}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
