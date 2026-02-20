"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Download, KeyRound, Bell, Mail } from "lucide-react"
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

  // Email
  const [email, setEmail] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [changingEmail, setChangingEmail] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)

  // Password cooldown
  const [passwordCooldown, setPasswordCooldown] = useState(0)

  // Notification preferences (kept for future use)
  const [notifications] = useState({
    purchases: true,
    sales: true,
    marketing: false,
    productUpdates: true,
  })

  // Load email
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [])

  // Password cooldown timer
  useEffect(() => {
    if (passwordCooldown <= 0) return
    const timer = setInterval(() => {
      setPasswordCooldown((c) => c - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [passwordCooldown])

  async function handleChangeEmail() {
    if (!newEmail || newEmail === email) return
    setChangingEmail(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      toast.success("Confirmation sent to your new email address. Check both inboxes.")
      setShowEmailChange(false)
      setNewEmail("")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update email"
      if (message.includes("rate limit")) {
        toast.error("Too many requests. Please wait a few minutes before trying again.")
      } else {
        toast.error(message)
      }
    } finally {
      setChangingEmail(false)
    }
  }

  async function handleChangePassword() {
    if (passwordCooldown > 0) return
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
      if (error) {
        if (error.message?.toLowerCase().includes("rate limit") ||
            error.message?.toLowerCase().includes("too many")) {
          toast.error("Too many requests. Please wait before trying again.")
          setPasswordCooldown(60)
        } else {
          throw error
        }
        return
      }
      toast.success("Password reset email sent! Check your inbox.")
      setPasswordCooldown(60)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to send reset email"
      toast.error(message)
    }
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

  async function handleExportData() {
    try {
      const res = await fetch("/api/account/export")
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "molt-mart-data-export.json"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    } catch {
      toast.error("Failed to export data")
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
          </CardTitle>
          <CardDescription>Your account email for login and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <code className="text-sm bg-muted px-3 py-1.5 rounded flex-1">{email || "Loading..."}</code>
            {!showEmailChange && (
              <Button variant="outline" size="sm" onClick={() => setShowEmailChange(true)}>
                Change
              </Button>
            )}
          </div>
          {showEmailChange && (
            <div className="space-y-2 max-w-md">
              <Label htmlFor="newEmail">New email address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
              />
              <p className="text-xs text-muted-foreground">
                A confirmation link will be sent to both your current and new email addresses.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleChangeEmail} disabled={changingEmail || !newEmail}>
                  {changingEmail ? "Sending..." : "Confirm Change"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowEmailChange(false); setNewEmail("") }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
          <Button variant="outline" onClick={handleChangePassword} disabled={passwordCooldown > 0}>
            {passwordCooldown > 0
              ? `Wait ${passwordCooldown}s`
              : "Send Password Reset Email"}
          </Button>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which emails you&apos;d like to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 opacity-50 pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-purchases" className="font-medium">Purchase Receipts</Label>
              <p className="text-sm text-muted-foreground">Get email confirmations for your purchases</p>
            </div>
            <Toggle id="notif-purchases" checked={notifications.purchases} onChange={() => {}} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-sales" className="font-medium">Sale Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone buys your product</p>
            </div>
            <Toggle id="notif-sales" checked={notifications.sales} onChange={() => {}} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-updates" className="font-medium">Product Updates</Label>
              <p className="text-sm text-muted-foreground">Updates about products you&apos;ve purchased</p>
            </div>
            <Toggle id="notif-updates" checked={notifications.productUpdates} onChange={() => {}} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notif-marketing" className="font-medium">Marketing &amp; Promotions</Label>
              <p className="text-sm text-muted-foreground">Tips, deals, and new features from Molt Mart</p>
            </div>
            <Toggle id="notif-marketing" checked={notifications.marketing} onChange={() => {}} />
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <p className="text-xs text-muted-foreground italic">
            Email notifications will be available once our email system is configured.
          </p>
        </div>
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
