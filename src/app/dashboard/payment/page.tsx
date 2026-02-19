"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Plus, Trash2, Star, Receipt } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { PaymentMethod, BillingAddress } from "@/lib/types/payment"

const CARD_ICONS: Record<string, string> = {
  visa: "💳 Visa",
  mastercard: "💳 Mastercard",
  amex: "💳 Amex",
  discover: "💳 Discover",
  unknown: "💳 Card",
}

export default function PaymentPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [savingAddress, setSavingAddress] = useState(false)
  const [billing, setBilling] = useState<BillingAddress>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/payments/methods")
        const data = await res.json()
        setMethods(data.methods || [])
      } catch {
        // silent
      }

      // Load billing address from profile
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("billing_address")
          .eq("id", user.id)
          .single()
        if (data?.billing_address) {
          setBilling(data.billing_address as BillingAddress)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveBillingAddress() {
    setSavingAddress(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({ billing_address: billing })
        .eq("id", user.id)

      if (error) throw error
      toast.success("Billing address saved")
    } catch (e: any) {
      toast.error(e.message || "Failed to save billing address")
    } finally {
      setSavingAddress(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold">Payment Information</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <h1 className="text-2xl font-bold">Payment Information</h1>

      {/* Saved Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved Payment Methods
          </CardTitle>
          <CardDescription>Manage your cards for purchases on Molt Mart</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No payment methods added yet</p>
              <p className="text-sm mt-1">Add a card to make purchases faster</p>
            </div>
          ) : (
            <div className="space-y-3">
              {methods.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{CARD_ICONS[m.type] || CARD_ICONS.unknown}</span>
                    <div>
                      <p className="font-medium">•••• {m.last4}</p>
                      <p className="text-xs text-muted-foreground">Expires {m.expMonth}/{m.expYear}</p>
                    </div>
                    {m.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled title="Coming soon — Stripe integration pending">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled title="Coming soon — Stripe integration pending">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button disabled className="w-full" title="Coming soon — Stripe integration pending">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
          <p className="text-xs text-center text-muted-foreground">Coming soon — Stripe integration pending</p>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>Used for receipts and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="billing-name">Full Name</Label>
              <Input id="billing-name" value={billing.name} onChange={(e) => setBilling({ ...billing, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addr1">Address Line 1</Label>
              <Input id="addr1" value={billing.addressLine1} onChange={(e) => setBilling({ ...billing, addressLine1: e.target.value })} placeholder="123 Main St" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addr2">Address Line 2</Label>
              <Input id="addr2" value={billing.addressLine2 || ""} onChange={(e) => setBilling({ ...billing, addressLine2: e.target.value })} placeholder="Apt 4B" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" value={billing.state} onChange={(e) => setBilling({ ...billing, state: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              <Input id="zip" value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} placeholder="US" />
            </div>
          </div>
          <Button className="mt-4" onClick={saveBillingAddress} disabled={savingAddress}>
            {savingAddress ? "Saving..." : "Save Billing Address"}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History Link */}
      <Card>
        <CardContent className="py-4">
          <Link href="/dashboard/transactions" className="flex items-center gap-2 text-sm font-medium hover:underline">
            <Receipt className="h-4 w-4" />
            View Transaction History →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
