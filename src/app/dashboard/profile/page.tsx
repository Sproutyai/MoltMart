"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { ConnectedAccounts } from "@/components/connected-accounts"
import { ImageUpload } from "@/components/image-upload"
import type { Profile } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [tagline, setTagline] = useState("")
  const [website, setWebsite] = useState("")
  const [specialties, setSpecialties] = useState("")
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
        setTagline(prof.tagline || "")
        setWebsite(prof.website || "")
        setSpecialties((prof.specialties || []).join(", "))
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
      const specialtiesArr = specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          username,
          bio,
          avatar_url: avatarUrl,
          tagline: tagline || null,
          website: website || null,
          specialties: specialtiesArr,
        }),
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{profile.is_seller ? "Edit Store" : "Edit Profile"}</h1>
        {profile.is_seller && (
          <Link href={`/sellers/${profile.username}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View seller profile <ExternalLink size={14} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader><CardTitle>{profile.is_seller ? "Store Profile" : "Profile"}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Avatar</Label>
                  <ImageUpload
                    bucket="profile-images"
                    path={`${profile.id}/avatar`}
                    currentUrl={avatarUrl || null}
                    onUploaded={(url) => setAvatarUrl(url)}
                    aspectRatio="square"
                  />
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 2MB.</p>
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase()); validateUsername(e.target.value.toLowerCase()) }} placeholder="my-username" />
                  {usernameError && <p className="text-xs text-destructive mt-1">{usernameError}</p>}
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Building the future of AI agents" maxLength={80} />
                  <p className="text-xs text-muted-foreground mt-1">Short motto displayed under your name (max 80 chars)</p>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
                </div>
                <div>
                  <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                  <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Personas, Skills, Workflows" />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <ConnectedAccounts onAvatarChange={(url) => setAvatarUrl(url)} />
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="relative h-24 w-full overflow-hidden" style={{
                background: `linear-gradient(135deg, hsl(${(username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360}, 60%, 85%), hsl(${((username || "a").split("").reduce((a, c) => a + c.charCodeAt(0), 0) + 60) % 360}, 50%, 90%))`,
              }} />
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 -mt-6">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                        {(displayName || username)?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="pt-6">
                    <p className="font-semibold text-sm">{displayName || username || "Your Name"}</p>
                    <p className="text-xs text-muted-foreground">@{username || "username"}</p>
                  </div>
                </div>
                {tagline && <p className="text-xs text-primary/80 mt-2 italic">{tagline}</p>}
                {bio && <p className="text-xs text-muted-foreground mt-1">{bio}</p>}
                {specialties && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {specialties.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
