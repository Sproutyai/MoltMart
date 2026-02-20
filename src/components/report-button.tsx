"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const REASONS = [
  { value: "malicious", label: "Malicious content", desc: "Contains harmful code or malware" },
  { value: "misleading", label: "Misleading listing", desc: "Description or screenshots don't match the product" },
  { value: "copyright", label: "Copyright infringement", desc: "Uses stolen or unauthorized content" },
  { value: "other", label: "Other", desc: "Another issue not listed above" },
] as const

export function ReportButton({ templateId, isLoggedIn }: { templateId: string; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!reason) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId, reason, details }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to submit report")
      } else {
        setSubmitted(true)
      }
    } catch {
      setError("Failed to submit report")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag size={14} className="mr-1" /> Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Template</DialogTitle>
          <DialogDescription>
            Help keep Molt Mart safe by reporting problematic content.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-4 text-center">
            <p className="text-green-600 font-medium">Thank you for your report.</p>
            <p className="text-sm text-muted-foreground mt-1">We&apos;ll review it shortly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === r.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-sm">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <textarea
              placeholder="Additional details (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-md border bg-background p-3 text-sm min-h-[80px] resize-none"
              maxLength={2000}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {!submitted && (
            <Button onClick={handleSubmit} disabled={!reason || loading} variant="destructive">
              {loading ? "Submitting…" : "Submit Report"}
            </Button>
          )}
          <Button variant="outline" onClick={() => setOpen(false)}>
            {submitted ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
