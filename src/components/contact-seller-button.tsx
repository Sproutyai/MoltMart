"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactSellerButtonProps {
  twitterUsername?: string | null
  githubUsername?: string | null
  website?: string | null
}

export function ContactSellerButton({ twitterUsername, githubUsername, website }: ContactSellerButtonProps) {
  const contactUrl = twitterUsername
    ? `https://twitter.com/${twitterUsername}`
    : githubUsername
    ? `https://github.com/${githubUsername}`
    : website || null

  if (!contactUrl) return null

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={contactUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-1 h-4 w-4" />
        Contact
      </a>
    </Button>
  )
}
