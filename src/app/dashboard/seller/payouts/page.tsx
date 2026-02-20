"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, Loader2, ExternalLink, DollarSign, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type ConnectStatus = "not_connected" | "pending" | "active"

export default function PayoutsPage() {
  const [status, setStatus] = useState<ConnectStatus>("not_connected")
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/seller/connect")
        const data = await res.json()
        setStatus(data.status || "not_connected")
      } catch {
        // silent
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleConnect() {
    setConnecting(true)
    try {
      const res = await fetch("/api/seller/connect", { method: "POST" })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
        return
      }

      if (data.error) {
        toast.info(data.error)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>

      {/* Earnings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
          <CardDescription>Your total earnings from template sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Paid Out</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Stripe Connect
            {status === "active" && <Badge className="bg-green-100 text-green-700">Active</Badge>}
            {status === "pending" && <Badge variant="secondary">Pending</Badge>}
            {status === "not_connected" && <Badge variant="outline">Not Connected</Badge>}
          </CardTitle>
          <CardDescription>
            {status === "active"
              ? "Your Stripe account is connected and ready to receive payouts."
              : status === "pending"
                ? "Your Stripe account setup is pending. Please complete the onboarding."
                : "Connect your Stripe account to receive payouts from template sales."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "active" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Payouts enabled</span>
              </div>
              <Separator />
              <div className="text-sm space-y-2">
                <p><strong>Payout schedule:</strong> Automatic, rolling basis</p>
                <p><strong>Platform fee:</strong> 10% per transaction</p>
              </div>
              <Button variant="outline" onClick={handleConnect} disabled={connecting}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Update Account
              </Button>
            </div>
          ) : status === "pending" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Setup incomplete</span>
              </div>
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                Complete Setup
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="font-semibold">Why connect Stripe?</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    Receive payouts directly to your bank account
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    Automatic tax form generation (1099)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    Real-time payout tracking and reporting
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                    90% revenue share — only 10% platform fee
                  </li>
                </ul>
              </div>
              <Button onClick={handleConnect} disabled={connecting} className="w-full" size="lg">
                {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                Connect Stripe Account
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You&apos;ll be redirected to Stripe to complete setup
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
