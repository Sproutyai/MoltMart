"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Loader2, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { InstallGuide } from "@/components/install-guide"

interface DownloadButtonProps {
  templateId: string
  templateSlug?: string
  templateName?: string
  isLoggedIn: boolean
  hasPurchased: boolean
  priceCents?: number
}

export function DownloadButton({ templateId, templateSlug, templateName, isLoggedIn, hasPurchased, priceCents = 0 }: DownloadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  async function handleDownload() {
    if (priceCents > 0 && !hasPurchased) {
      toast.info("Paid downloads coming soon!")
      return
    }

    if (!isLoggedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    setLoading(true)
    try {
      // Record the purchase/download, then trigger download via direct navigation
      // Using window.location.href avoids the async user-gesture trust chain issue
      const res = await fetch(`/api/templates/${templateId}/download`, { method: "POST" })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Download failed")
        return
      }

      // Use GET endpoint for actual file download — avoids blob/click blocking
      window.location.href = `/api/templates/${templateId}/download`

      toast.success("Download started!")
      setShowGuide(true)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <Button onClick={handleDownload} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {hasPurchased
            ? "Download Again"
            : priceCents > 0
              ? `Purchase — $${(priceCents / 100).toFixed(2)}`
              : "Download Free"}
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowGuide(true)}>
          <BookOpen className="mr-2 h-4 w-4" />
          How to Install
        </Button>
      </div>
      <InstallGuide
        open={showGuide}
        onOpenChange={setShowGuide}
        templateName={templateName || "this template"}
        templateSlug={templateSlug || "template"}
      />
    </>
  )
}
