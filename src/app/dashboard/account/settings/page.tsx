"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function AccountSettingsPage() {
  const [confirming, setConfirming] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Notification settings coming soon.</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2">Permanently delete your account and all associated data.</p>
              {!confirming ? (
                <Button variant="destructive" onClick={() => setConfirming(true)}>
                  Delete Account
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="destructive" onClick={() => { /* TODO: implement */ setConfirming(false) }}>
                    Confirm Delete
                  </Button>
                  <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
