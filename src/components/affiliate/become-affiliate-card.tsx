"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function BecomeAffiliateCard() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    setLoading(true)
    try {
      const res = await fetch("/api/affiliate/join", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Something went wrong")
        return
      }
      toast.success("Welcome to the affiliate program!")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">💰 Earn by sharing Molt Mart</CardTitle>
        <CardDescription>
          Get 7.5% commission on every sale your referrals make — for life. Free to join.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(c) => setAgreed(c === true)}
            className="mt-1"
          />
          <label htmlFor="agree" className="text-sm cursor-pointer">
            I agree to the{" "}
            <Link href="/affiliate/terms" className="underline hover:text-foreground">
              affiliate program terms
            </Link>
          </label>
        </div>
        <Button className="w-full" disabled={!agreed || loading} onClick={handleJoin}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Become an Affiliate
        </Button>
      </CardContent>
    </Card>
  )
}
