"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/image-upload"
import { AvatarPicker } from "@/components/avatar-picker"
import type { Profile } from "@/lib/types"

export default function EditPersonalProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [usernameError, setUsernameError] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (p) {
        const prof = p as Profile
        setProfile(prof)
        setDisplayName(prof.display_name || "")
        setUsername(prof.username || "")
        setBio(prof.bio || "")
        setAvatarUrl(prof.avatar_url || "")
      }
      setLoading(false)
    }
    load()
  }, [router])

  function validateUsername(value: string) {
    if (!value) { setUsernameError(""); return }
    if (!/^[a-z0-9_-]{3,30}$/.test(value)) {
      setUsernameError("3-30 characters, lowercase letters, numbers, hyphens, underscores only")
    } else {
      setUsernameError("")
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
      toast.error("Invalid username format")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName, username, bio, avatar_url: avatarUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Update failed")
        return
      }
      toast.success("Profile updated!")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <p className="text-muted-foreground">Failed to load profile.</p>
      <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Avatar</Label>
              <div className="mt-1">
                {profile.is_seller ? (
                  <ImageUpload
                    bucket="profile-images"
                    path={`${profile.id}/avatar`}
                    currentUrl={avatarUrl || null}
                    onUploaded={(url) => setAvatarUrl(url)}
                    aspectRatio="square"
                  />
                ) : (
                  <AvatarPicker
                    currentAvatarUrl={avatarUrl || null}
                    onAvatarChange={(url) => setAvatarUrl(url)}
                  />
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase()); validateUsername(e.target.value.toLowerCase()) }} />
              {usernameError && <p className="text-xs text-destructive mt-1">{usernameError}</p>}
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
