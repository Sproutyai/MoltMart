"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CheckoutModalProps {
  templateId: string
  title: string
  priceCents: number
  children: React.ReactNode
}

export function CheckoutModal({ templateId, title, priceCents, children }: CheckoutModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
        return
      }

      if (data.error) {
        toast.info(data.error)
        setOpen(false)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Template</DialogTitle>
          <DialogDescription>Complete your purchase to download this template.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="font-medium min-w-0 truncate">{title}</span>
            <span className="text-lg font-bold shrink-0">${(priceCents / 100).toFixed(2)}</span>
          </div>
          <Button onClick={handleCheckout} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Pay with Card
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
