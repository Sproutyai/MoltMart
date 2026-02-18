# Social Trust Implementation Plan

## Section 1: Database Migration

**File:** `supabase/migrations/social_trust.sql` (CREATE)

```sql
-- Social Trust & Verification Migration

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS github_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS twitter_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS github_avatar_url text,
  ADD COLUMN IF NOT EXISTS github_repos_count integer,
  ADD COLUMN IF NOT EXISTS github_followers_count integer,
  ADD COLUMN IF NOT EXISTS github_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS twitter_followers_count integer,
  ADD COLUMN IF NOT EXISTS twitter_tweet_count integer,
  ADD COLUMN IF NOT EXISTS social_stats_updated_at timestamptz;

-- Auto-compute is_verified from social verifications
CREATE OR REPLACE FUNCTION public.update_is_verified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified = COALESCE(NEW.github_verified, false) OR COALESCE(NEW.twitter_verified, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_is_verified ON public.profiles;
CREATE TRIGGER trg_update_is_verified
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_is_verified();
```

---

## Section 2: OAuth Linking Flow

The OAuth flow uses Supabase `linkIdentity()` which is a **client-side** browser redirect. There are no server API routes for initiating the flow — it happens entirely via the Supabase JS client.

### Flow:
1. User clicks "Connect GitHub" on dashboard profile page
2. Client calls `supabase.auth.linkIdentity({ provider: 'github' })`
3. Browser redirects to GitHub OAuth → back to callback URL
4. Supabase stores identity in `auth.identities`
5. Browser lands on `/dashboard/profile?connected=github`
6. Profile page detects `?connected=github`, calls `/api/profile/link-social` to extract username from identity and fetch stats

### Post-Connect API Route

**File:** `src/app/api/profile/link-social/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchGitHubStats, fetchTwitterStats } from "@/lib/social-stats"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { provider } = await request.json() as { provider: "github" | "twitter" }

  // Find the linked identity for this provider
  const identity = user.identities?.find((i) => i.provider === provider)
  if (!identity) {
    return NextResponse.json({ error: `No ${provider} identity linked` }, { status: 400 })
  }

  // Extract username from identity_data
  const identityData = identity.identity_data as Record<string, unknown>

  if (provider === "github") {
    const username = (identityData.user_name || identityData.preferred_username) as string
    if (!username) return NextResponse.json({ error: "Could not extract GitHub username" }, { status: 400 })

    // Fetch stats from GitHub API
    const stats = await fetchGitHubStats(username)

    const { error } = await supabase.from("profiles").update({
      github_username: username,
      github_verified: true,
      github_avatar_url: stats?.avatar_url || (identityData.avatar_url as string) || null,
      github_repos_count: stats?.public_repos ?? null,
      github_followers_count: stats?.followers ?? null,
      github_created_at: stats?.created_at ?? null,
      social_stats_updated_at: new Date().toISOString(),
    }).eq("id", user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, username })
  }

  if (provider === "twitter") {
    // Twitter identity_data uses different field names
    const username = (identityData.user_name || identityData.preferred_username || identityData.name) as string
    if (!username) return NextResponse.json({ error: "Could not extract Twitter username" }, { status: 400 })

    const stats = await fetchTwitterStats(username)

    const { error } = await supabase.from("profiles").update({
      twitter_username: username,
      twitter_verified: true,
      twitter_followers_count: stats?.followers_count ?? null,
      twitter_tweet_count: stats?.tweet_count ?? null,
      social_stats_updated_at: new Date().toISOString(),
    }).eq("id", user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, username })
  }

  return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
}
```

### Disconnect Flow

**File:** `src/app/api/profile/unlink-social/route.ts` (CREATE)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { provider } = await request.json() as { provider: "github" | "twitter" }

  // Find identity to unlink
  const identity = user.identities?.find((i) => i.provider === provider)
  if (!identity) {
    return NextResponse.json({ error: `No ${provider} identity linked` }, { status: 400 })
  }

  // Must have at least one other identity or email login
  if ((user.identities?.length ?? 0) <= 1) {
    return NextResponse.json({ error: "Cannot unlink your only login method" }, { status: 400 })
  }

  const { error: unlinkError } = await supabase.auth.unlinkIdentity(identity)
  if (unlinkError) return NextResponse.json({ error: unlinkError.message }, { status: 500 })

  if (provider === "github") {
    await supabase.from("profiles").update({
      github_username: null,
      github_verified: false,
      github_avatar_url: null,
      github_repos_count: null,
      github_followers_count: null,
      github_created_at: null,
    }).eq("id", user.id)
  } else if (provider === "twitter") {
    await supabase.from("profiles").update({
      twitter_username: null,
      twitter_verified: false,
      twitter_followers_count: null,
      twitter_tweet_count: null,
    }).eq("id", user.id)
  }

  return NextResponse.json({ success: true })
}
```

---

## Section 3: Stats Fetching

**File:** `src/lib/social-stats.ts` (CREATE)

```typescript
interface GitHubStats {
  avatar_url: string
  public_repos: number
  followers: number
  created_at: string
}

interface TwitterStats {
  followers_count: number
  tweet_count: number
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    const headers: Record<string, string> = { "Accept": "application/vnd.github.v3+json" }
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers, next: { revalidate: 0 } })
    if (!res.ok) return null
    const data = await res.json()
    return {
      avatar_url: data.avatar_url,
      public_repos: data.public_repos,
      followers: data.followers,
      created_at: data.created_at,
    }
  } catch {
    return null
  }
}

export async function fetchTwitterStats(username: string): Promise<TwitterStats | null> {
  try {
    const token = process.env.TWITTER_BEARER_TOKEN
    if (!token) return null
    const res = await fetch(
      `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics`,
      { headers: { "Authorization": `Bearer ${token}` }, next: { revalidate: 0 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const metrics = data.data?.public_metrics
    if (!metrics) return null
    return {
      followers_count: metrics.followers_count,
      tweet_count: metrics.tweet_count,
    }
  } catch {
    return null
  }
}
```

### Refresh Endpoint

**File:** `src/app/api/profile/refresh-social/route.ts` (CREATE)

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchGitHubStats, fetchTwitterStats } from "@/lib/social-stats"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("github_username, github_verified, twitter_username, twitter_verified").eq("id", user.id).single()
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const updates: Record<string, unknown> = { social_stats_updated_at: new Date().toISOString() }

  if (profile.github_verified && profile.github_username) {
    const stats = await fetchGitHubStats(profile.github_username)
    if (stats) {
      updates.github_avatar_url = stats.avatar_url
      updates.github_repos_count = stats.public_repos
      updates.github_followers_count = stats.followers
      updates.github_created_at = stats.created_at
    }
  }

  if (profile.twitter_verified && profile.twitter_username) {
    const stats = await fetchTwitterStats(profile.twitter_username)
    if (stats) {
      updates.twitter_followers_count = stats.followers_count
      updates.twitter_tweet_count = stats.tweet_count
    }
  }

  await supabase.from("profiles").update(updates).eq("id", user.id)
  return NextResponse.json({ success: true })
}
```

---

## Section 4: Dashboard Profile Page

**File:** `src/app/dashboard/profile/page.tsx` (MODIFY)

Replace the GitHub/Twitter text inputs with a `ConnectedAccounts` component. Remove the `githubUsername`/`twitterUsername` state variables and their corresponding form fields.

### Replace this block (lines ~87-94 in the form):
```tsx
<div>
  <Label htmlFor="githubUsername">GitHub Username</Label>
  <Input id="githubUsername" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="username" />
</div>
<div>
  <Label htmlFor="twitterUsername">X / Twitter Username</Label>
  <Input id="twitterUsername" value={twitterUsername} onChange={(e) => setTwitterUsername(e.target.value)} placeholder="username" />
</div>
```

### With:
```tsx
</form>
</CardContent>
</Card>

<ConnectedAccounts />
```

(Move the `ConnectedAccounts` section outside the main form card, as a separate card below it.)

Also remove `github_username` and `twitter_username` from the `handleSave` body — those are now managed via OAuth only.

### ConnectedAccounts Component

**File:** `src/components/connected-accounts.tsx` (CREATE)

```tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Twitter, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface SocialState {
  github_username: string | null
  github_verified: boolean
  github_repos_count: number | null
  github_followers_count: number | null
  twitter_username: string | null
  twitter_verified: boolean
  twitter_followers_count: number | null
  twitter_tweet_count: number | null
  social_stats_updated_at: string | null
}

export function ConnectedAccounts() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<SocialState | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    loadState()
  }, [])

  // Handle post-OAuth redirect
  useEffect(() => {
    const connected = searchParams.get("connected")
    if (connected === "github" || connected === "twitter") {
      handlePostConnect(connected)
    }
  }, [searchParams])

  async function loadState() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("profiles")
      .select("github_username, github_verified, github_repos_count, github_followers_count, twitter_username, twitter_verified, twitter_followers_count, twitter_tweet_count, social_stats_updated_at")
      .eq("id", user.id)
      .single()
    if (data) setState(data as SocialState)
    setLoading(false)
  }

  async function handlePostConnect(provider: "github" | "twitter") {
    try {
      const res = await fetch("/api/profile/link-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`${provider === "github" ? "GitHub" : "X"} connected! Your verified badge is now live.`)
        await loadState()
      } else {
        toast.error(data.error || `Failed to link ${provider}`)
      }
    } catch {
      toast.error("Something went wrong")
    }
    // Clean URL params
    window.history.replaceState({}, "", "/dashboard/profile")
  }

  async function handleConnect(provider: "github" | "twitter") {
    setConnecting(provider)
    const supabase = createClient()
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard/profile?connected=${provider}`,
      },
    })
    if (error) {
      toast.error(error.message)
      setConnecting(null)
    }
    // If no error, browser redirects away
  }

  async function handleDisconnect(provider: "github" | "twitter") {
    if (!confirm(`Disconnect your ${provider === "github" ? "GitHub" : "X"} account?`)) return
    try {
      const res = await fetch("/api/profile/unlink-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })
      if (res.ok) {
        toast.success("Account disconnected")
        await loadState()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to disconnect")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleRefresh() {
    const res = await fetch("/api/profile/refresh-social", { method: "POST" })
    if (res.ok) {
      toast.success("Stats refreshed")
      await loadState()
    }
  }

  if (loading) return null

  function formatCount(n: number | null): string {
    if (n == null) return "—"
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  return (
    <Card className="max-w-2xl mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connected Accounts</CardTitle>
          {(state?.github_verified || state?.twitter_verified) && (
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} className="mr-1" /> Refresh Stats
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitHub */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Github size={24} />
            <div>
              {state?.github_verified ? (
                <>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle size={16} className="text-green-500" />
                    Connected as @{state.github_username}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(state.github_repos_count)} repos · {formatCount(state.github_followers_count)} followers
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">GitHub</p>
                  <p className="text-xs text-muted-foreground">Connect your GitHub to build trust with buyers</p>
                </>
              )}
            </div>
          </div>
          {state?.github_verified ? (
            <Button variant="outline" size="sm" onClick={() => handleDisconnect("github")}>Disconnect</Button>
          ) : (
            <Button size="sm" onClick={() => handleConnect("github")} disabled={connecting === "github"}>
              {connecting === "github" && <Loader2 size={14} className="mr-1 animate-spin" />}
              Connect GitHub
            </Button>
          )}
        </div>

        {/* Twitter */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Twitter size={24} />
            <div>
              {state?.twitter_verified ? (
                <>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle size={16} className="text-green-500" />
                    Connected as @{state.twitter_username}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(state.twitter_followers_count)} followers · {formatCount(state.twitter_tweet_count)} tweets
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">X / Twitter</p>
                  <p className="text-xs text-muted-foreground">Connect your X account to build trust with buyers</p>
                </>
              )}
            </div>
          </div>
          {state?.twitter_verified ? (
            <Button variant="outline" size="sm" onClick={() => handleDisconnect("twitter")}>Disconnect</Button>
          ) : (
            <Button size="sm" onClick={() => handleConnect("twitter")} disabled={connecting === "twitter"}>
              {connecting === "twitter" && <Loader2 size={14} className="mr-1 animate-spin" />}
              Connect X
            </Button>
          )}
        </div>

        {state?.social_stats_updated_at && (
          <p className="text-xs text-muted-foreground text-right">
            Stats last updated {new Date(state.social_stats_updated_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Section 5: Trust Badge Component

**File:** `src/components/trust-badge.tsx` (CREATE)

```tsx
import { CheckCircle, Github, Twitter } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrustBadgeProps {
  githubVerified?: boolean
  twitterVerified?: boolean
  variant?: "inline" | "full"
}

export function TrustBadge({ githubVerified, twitterVerified, variant = "inline" }: TrustBadgeProps) {
  if (!githubVerified && !twitterVerified) return null

  if (variant === "inline") {
    const platforms = [
      githubVerified && "GitHub",
      twitterVerified && "X",
    ].filter(Boolean).join(" & ")

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle className="inline h-3.5 w-3.5 text-blue-500 ml-1" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Verified seller — {platforms} connected</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // full variant
  return (
    <div className="flex items-center gap-2">
      {githubVerified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
          <Github size={12} /> Verified
        </span>
      )}
      {twitterVerified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <Twitter size={12} /> Verified
        </span>
      )}
    </div>
  )
}
```

---

## Section 6: Seller Trust Section

**File:** `src/components/seller-trust-section.tsx` (CREATE)

```tsx
import { Github, Twitter, ExternalLink } from "lucide-react"

interface SellerTrustSectionProps {
  github_verified?: boolean
  github_username?: string | null
  github_avatar_url?: string | null
  github_repos_count?: number | null
  github_followers_count?: number | null
  github_created_at?: string | null
  twitter_verified?: boolean
  twitter_username?: string | null
  twitter_followers_count?: number | null
  twitter_tweet_count?: number | null
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return "—"
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export function SellerTrustSection(props: SellerTrustSectionProps) {
  const hasGithub = props.github_verified && props.github_username
  const hasTwitter = props.twitter_verified && props.twitter_username
  if (!hasGithub && !hasTwitter) return null

  const ghYear = props.github_created_at
    ? new Date(props.github_created_at).getFullYear()
    : null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Verified Accounts</h3>

      {hasGithub && (
        <a
          href={`https://github.com/${props.github_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
        >
          {props.github_avatar_url ? (
            <img src={props.github_avatar_url} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <Github size={24} className="mt-1" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Github size={14} className="text-green-500" />
              @{props.github_username}
              <ExternalLink size={12} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCount(props.github_repos_count)} repos · {formatCount(props.github_followers_count)} followers
              {ghYear && ` · Since ${ghYear}`}
            </p>
          </div>
        </a>
      )}

      {hasTwitter && (
        <a
          href={`https://x.com/${props.twitter_username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
        >
          <Twitter size={24} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Twitter size={14} className="text-blue-500" />
              @{props.twitter_username}
              <ExternalLink size={12} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCount(props.twitter_followers_count)} followers · {formatCount(props.twitter_tweet_count)} tweets
            </p>
          </div>
        </a>
      )}
    </div>
  )
}
```

---

## Section 7: Template Card & Detail Updates

### Template Card

**File:** `src/components/template-card.tsx` (MODIFY)

Add `TrustBadge` import and pass seller verification status. The template query must include `is_verified` from the seller join.

**Change the seller join** in pages that fetch templates. In `src/app/sellers/[username]/page.tsx` line for template query, change:

```typescript
// FROM:
.select("*, seller:profiles!seller_id(username, display_name)")
// TO:
.select("*, seller:profiles!seller_id(username, display_name, is_verified)")
```

Same change in `src/app/templates/[slug]/page.tsx` for `moreBySeller` query.

**In `template-card.tsx`**, update the interface and SellerLink area:

After the `<SellerLink>` block inside CardContent, add:
```tsx
import { TrustBadge } from "@/components/trust-badge"

// In the seller section:
{template.seller && (
  <div className="mt-2 flex items-center">
    <SellerLink
      username={template.seller.username}
      displayName={template.seller.display_name}
    />
    {(template.seller as any).is_verified && (
      <TrustBadge githubVerified twitterVerified={false} variant="inline" />
    )}
  </div>
)}
```

### Template Detail Page

**File:** `src/app/templates/[slug]/page.tsx` (MODIFY)

Add seller trust section in the sticky sidebar. Change the seller query:

```typescript
// FROM:
.select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
// TO:
.select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, github_username, github_avatar_url, github_repos_count, github_followers_count, github_created_at, twitter_verified, twitter_username, twitter_followers_count, twitter_tweet_count)")
```

Add after the install `<code>` block in the sidebar:

```tsx
import { SellerTrustSection } from "@/components/seller-trust-section"

{/* Inside the sticky sidebar, after the Install section: */}
<Separator />
<div>
  <h3 className="mb-2 text-sm font-semibold">About the Seller</h3>
  <SellerTrustSection
    github_verified={(t.seller as any).github_verified}
    github_username={(t.seller as any).github_username}
    github_avatar_url={(t.seller as any).github_avatar_url}
    github_repos_count={(t.seller as any).github_repos_count}
    github_followers_count={(t.seller as any).github_followers_count}
    github_created_at={(t.seller as any).github_created_at}
    twitter_verified={(t.seller as any).twitter_verified}
    twitter_username={(t.seller as any).twitter_username}
    twitter_followers_count={(t.seller as any).twitter_followers_count}
    twitter_tweet_count={(t.seller as any).twitter_tweet_count}
  />
</div>
```

### Seller Profile Page

**File:** `src/app/sellers/[username]/page.tsx` (MODIFY)

Add trust section after social links in `SellerProfileHeader`, or add it as a standalone section on the profile page. Since SellerProfileHeader already receives the full profile, add to `seller-profile-header.tsx`:

**File:** `src/components/seller-profile-header.tsx` (MODIFY)

After the `<SellerSocialLinks>` block, add:

```tsx
import { SellerTrustSection } from "@/components/seller-trust-section"

{/* After SellerSocialLinks div */}
<div className="px-4">
  <SellerTrustSection
    github_verified={(profile as any).github_verified}
    github_username={profile.github_username}
    github_avatar_url={(profile as any).github_avatar_url}
    github_repos_count={(profile as any).github_repos_count}
    github_followers_count={(profile as any).github_followers_count}
    github_created_at={(profile as any).github_created_at}
    twitter_verified={(profile as any).twitter_verified}
    twitter_username={profile.twitter_username}
    twitter_followers_count={(profile as any).twitter_followers_count}
    twitter_tweet_count={(profile as any).twitter_tweet_count}
  />
</div>
```

---

## Section 8: Update Types

**File:** `src/lib/types.ts` (MODIFY)

Add to the `Profile` interface:

```typescript
export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url?: string | null
  website?: string | null
  github_username?: string | null
  twitter_username?: string | null
  github_verified?: boolean
  twitter_verified?: boolean
  github_avatar_url?: string | null
  github_repos_count?: number | null
  github_followers_count?: number | null
  github_created_at?: string | null
  twitter_followers_count?: number | null
  twitter_tweet_count?: number | null
  social_stats_updated_at?: string | null
  specialties?: string[]
  is_seller: boolean
  is_verified?: boolean
  follower_count?: number
  created_at: string
}
```

---

## Section 9: Implementation Order

| # | File | Action | Dependencies | Notes |
|---|------|--------|-------------|-------|
| 1 | `supabase/migrations/social_trust.sql` | CREATE | None | Run migration first. Adds columns + trigger. |
| 2 | `src/lib/types.ts` | MODIFY | None | Add new Profile fields (see Section 8). |
| 3 | `src/lib/social-stats.ts` | CREATE | None | GitHub/Twitter stats fetching functions. |
| 4 | `src/app/api/profile/link-social/route.ts` | CREATE | #3 | Post-OAuth endpoint to extract username + fetch stats. |
| 5 | `src/app/api/profile/unlink-social/route.ts` | CREATE | None | Disconnect endpoint. |
| 6 | `src/app/api/profile/refresh-social/route.ts` | CREATE | #3 | Refresh cached stats. |
| 7 | `src/components/connected-accounts.tsx` | CREATE | #4, #5 | Dashboard OAuth connect/disconnect UI. |
| 8 | `src/app/dashboard/profile/page.tsx` | MODIFY | #7 | Remove GitHub/Twitter text inputs. Add `<ConnectedAccounts />` below the form card. Remove `githubUsername`/`twitterUsername` state. Remove those fields from `handleSave`. |
| 9 | `src/app/api/profile/route.ts` | MODIFY | None | Remove `github_username` and `twitter_username` from the `allowed` array (now managed via OAuth only). |
| 10 | `src/components/trust-badge.tsx` | CREATE | None | Inline/full verified badge. |
| 11 | `src/components/seller-trust-section.tsx` | CREATE | None | Verified accounts display card. |
| 12 | `src/components/seller-profile-header.tsx` | MODIFY | #11 | Add `<SellerTrustSection>` after social links. |
| 13 | `src/components/template-card.tsx` | MODIFY | #10 | Add TrustBadge next to seller name. Update seller join queries in parent pages. |
| 14 | `src/app/templates/[slug]/page.tsx` | MODIFY | #11 | Expand seller select, add SellerTrustSection to sidebar. |
| 15 | `src/app/sellers/[username]/page.tsx` | MODIFY | None | Expand template seller select to include `is_verified`. |

### Environment Variables Needed
- `GITHUB_TOKEN` — optional, increases rate limit from 60→5000/hr
- `TWITTER_BEARER_TOKEN` — required for Twitter stats fetching

### Supabase Dashboard Setup
- Enable GitHub OAuth provider (needs GitHub OAuth App client ID + secret)
- Enable Twitter OAuth provider (needs Twitter OAuth 2.0 client ID + secret)
- Set callback URL in both providers to `https://<your-supabase-project>.supabase.co/auth/v1/callback`
