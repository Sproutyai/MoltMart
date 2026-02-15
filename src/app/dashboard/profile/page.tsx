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
  const [bannerUrl, setBannerUrl] = useState("")
  const [website, setWebsite] = useState("")
  const [githubUsername, setGithubUsername] = useState("")
  const [twitterUsername, setTwitterUsername] = useState("")
  const [specialties, setSpecialties] = useState("")

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
        setBannerUrl(prof.banner_url || "")
        setWebsite(prof.website || "")
        setGithubUsername(prof.github_username || "")
        setTwitterUsername(prof.twitter_username || "")
        setSpecialties((prof.specialties || []).join(", "))
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
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
          banner_url: bannerUrl || null,
          website: website || null,
          github_username: githubUsername || null,
          twitter_username: twitterUsername || null,
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
  if (!profile) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        {profile.is_seller && (
          <Link href={`/sellers/${profile.username}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View public profile <ExternalLink size={14} />
          </Link>
        )}
      </div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="bannerUrl">Banner URL</Label>
              <Input id="bannerUrl" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
            </div>
            <div>
              <Label htmlFor="githubUsername">GitHub Username</Label>
              <Input id="githubUsername" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="username" />
            </div>
            <div>
              <Label htmlFor="twitterUsername">X / Twitter Username</Label>
              <Input id="twitterUsername" value={twitterUsername} onChange={(e) => setTwitterUsername(e.target.value)} placeholder="username" />
            </div>
            <div>
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Coding, Automation, Writing" />
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
