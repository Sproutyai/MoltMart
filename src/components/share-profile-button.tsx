"use client"

import { Share2, Copy, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ShareProfileButtonProps {
  username: string
  displayName: string
}

export function ShareProfileButton({ username, displayName }: ShareProfileButtonProps) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/sellers/${username}` : `/sellers/${username}`

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${displayName} on Molt Mart`, url })
        return
      } catch {
        // User cancelled or not supported, fall through to dropdown
      }
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url)
    toast.success("Link copied!")
  }

  function shareOnX() {
    const text = encodeURIComponent(`Check out ${displayName} on Molt Mart!`)
    const encodedUrl = encodeURIComponent(url)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, "_blank")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyLink}>
          <Copy className="mr-2 h-4 w-4" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnX}>
          <Twitter className="mr-2 h-4 w-4" /> Share on X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
