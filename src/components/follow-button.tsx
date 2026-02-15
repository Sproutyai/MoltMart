"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"

interface FollowButtonProps {
  sellerId: string
  initialFollowing: boolean
}

export function FollowButton({ sellerId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const prev = following
    setFollowing(!prev)
    try {
      const res = await fetch(`/api/sellers/${sellerId}/follow`, { method: "POST" })
      if (!res.ok) {
        setFollowing(prev)
      } else {
        const data = await res.json()
        setFollowing(data.following)
      }
    } catch {
      setFollowing(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : following ? (
        <UserMinus className="mr-1 h-4 w-4" />
      ) : (
        <UserPlus className="mr-1 h-4 w-4" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  )
}
