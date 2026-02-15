"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DownloadButtonProps {
  templateId: string
  isLoggedIn: boolean
  hasPurchased: boolean
}

export function DownloadButton({ templateId, isLoggedIn, hasPurchased }: DownloadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/templates/${templateId}/download`, { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Download failed")
        return
      }

      // Trigger download
      window.open(data.url, "_blank")
      toast.success("Download started!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={loading} className="w-full" size="lg">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {hasPurchased ? "Download Again" : "Download Free"}
    </Button>
  )
}
