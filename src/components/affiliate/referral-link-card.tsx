"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { getReferralUrl, getTwitterShareUrl, getLinkedInShareUrl } from "@/lib/affiliate"

export function ReferralLinkCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false)
  const url = getReferralUrl(referralCode)

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input readOnly value={url} className="font-mono text-sm" />
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Referral Code: <code className="font-mono font-medium text-foreground">{referralCode}</code>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={getTwitterShareUrl(referralCode)} target="_blank" rel="noopener noreferrer">
              𝕏 Share on X
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={getLinkedInShareUrl(referralCode)} target="_blank" rel="noopener noreferrer">
              in Share on LinkedIn
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
