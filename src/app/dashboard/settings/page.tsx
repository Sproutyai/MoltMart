"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Download, KeyRound } from "lucide-react"
import { toast } from "sonner"

export default function AccountSettingsPage() {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return
    setDeleting(true)
    try {
      // TODO: Implement server-side account deletion
      // 1. Delete user data from all tables
      // 2. Cancel Stripe subscriptions if any
      // 3. supabase.auth.admin.deleteUser(userId)
      toast.error("Account deletion is not yet implemented. Contact support.")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  async function handleChangePassword() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        toast.error("No email associated with this account")
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      toast.success("Password reset email sent! Check your inbox.")
    } catch (e: any) {
      toast.error(e.message || "Failed to send reset email")
    }
  }

  async function handleExportData() {
    // TODO: Implement data export (GDPR compliance)
    // Collect all user data from profiles, purchases, etc. and return as JSON/CSV
    toast.info("Data export is coming soon")
  }

  return (
    <div className="flex-1 space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Send a password reset link to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleChangePassword}>
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>Download a copy of all your data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportData}>
            Export Data
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-3 max-w-md">
              <p className="text-sm text-muted-foreground">
                Type <span className="font-mono font-bold">DELETE</span> to confirm account deletion:
              </p>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  disabled={deleteInput !== "DELETE" || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </Button>
                <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
