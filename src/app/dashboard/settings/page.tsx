"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Download, KeyRound, Bell } from "lucide-react"
import { toast } from "sonner"

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function AccountSettingsPage() {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Notification preferences (placeholder — would persist to DB)
  const [notifications, setNotifications] = useState({
    purchases: true,
    sales: true,
    marketing: false,
    productUpdates: true,
  })

  function updateNotification(key: keyof typeof notifications) {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      // TODO: Persist to user profile / preferences table
      toast.success("Notification preference updated")
      return updated
    })
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return
    setDeleting(true)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete account")
      }
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
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

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which emails you&apos;d like to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-purchases" className="font-medium">Purchase Receipts</Label>
              <p className="text-sm text-muted-foreground">Get email confirmations for your purchases</p>
            </div>
            <Toggle id="notif-purchases" checked={notifications.purchases} onChange={() => updateNotification("purchases")} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-sales" className="font-medium">Sale Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone buys your product</p>
            </div>
            <Toggle id="notif-sales" checked={notifications.sales} onChange={() => updateNotification("sales")} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-updates" className="font-medium">Product Updates</Label>
              <p className="text-sm text-muted-foreground">Updates about products you&apos;ve purchased</p>
            </div>
            <Toggle id="notif-updates" checked={notifications.productUpdates} onChange={() => updateNotification("productUpdates")} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-marketing" className="font-medium">Marketing & Promotions</Label>
              <p className="text-sm text-muted-foreground">Tips, deals, and new features from Molt Mart</p>
            </div>
            <Toggle id="notif-marketing" checked={notifications.marketing} onChange={() => updateNotification("marketing")} />
          </div>
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
