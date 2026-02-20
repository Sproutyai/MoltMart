"use client"

import { useState } from "react"
import { PREMADE_AVATARS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AvatarPickerProps {
  currentAvatarUrl: string | null
  onAvatarChange: (url: string) => void
}

export function AvatarPicker({ currentAvatarUrl, onAvatarChange }: AvatarPickerProps) {
  const [setting, setSetting] = useState<string | null>(null)

  async function selectAvatar(avatarId: string, url: string) {
    setSetting(avatarId)
    try {
      const res = await fetch("/api/profile/set-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "premade", avatarId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to set avatar")
      }
      onAvatarChange(url)
      toast.success("Avatar updated!")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong"
      toast.error(message)
    } finally {
      setSetting(null)
    }
  }

  return (
    <div>
      <p className="text-sm font-medium mb-2">Choose an avatar</p>
      <div className="flex gap-3 flex-wrap">
        {PREMADE_AVATARS.map((avatar) => {
          const isActive = currentAvatarUrl === avatar.url
          const isLoading = setting === avatar.id
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => selectAvatar(avatar.id, avatar.url)}
              disabled={setting !== null}
              className={cn(
                "relative h-16 w-16 rounded-full overflow-hidden border-2 transition-all hover:scale-105",
                isActive
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-muted-foreground/20 hover:border-primary/50"
              )}
              title={avatar.label}
            >
              <img
                src={avatar.url}
                alt={avatar.label}
                className="h-full w-full object-cover"
              />
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
