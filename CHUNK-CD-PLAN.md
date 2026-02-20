# Chunk C+D Implementation Plan: Profile Avatars & Account Settings

Generated: 2026-02-20

---

## Pre-work Complete

### ✅ Avatar Images Generated
5 premade avatars saved to `public/avatars/`:
- `avatar-chameleon.webp` (84KB) — stylized chameleon, neon green/purple, circuit patterns
- `avatar-geometric.webp` (47KB) — abstract polygon wireframe face, cyan/magenta
- `avatar-robot.webp` (16KB) — sleek robot head, glowing blue LEDs
- `avatar-cosmic.webp` (76KB) — nebula silhouette, purple/blue space
- `avatar-pixel.webp` (22KB) — retro 8-bit character, neon green

---

## CHUNK C: Profile Avatars (Premade Picker)

### Overview
Currently the profile page (`/dashboard/profile`) has:
1. `ImageUpload` component — uploads custom images to Supabase `profile-images` bucket
2. `ConnectedAccounts` component — "Use as photo" buttons for GitHub/Twitter avatars
3. `set-avatar` API route — only supports `github` | `twitter` sources

**Goal:** Add a premade avatar picker grid. Keep existing upload + social options.

### Step 1: Create Avatar Constants

**File: `src/lib/constants.ts`** (create new or append)

```ts
export const PREMADE_AVATARS = [
  { id: "chameleon", url: "/avatars/avatar-chameleon.webp", label: "Chameleon" },
  { id: "geometric", url: "/avatars/avatar-geometric.webp", label: "Geometric" },
  { id: "robot", url: "/avatars/avatar-robot.webp", label: "Robot" },
  { id: "cosmic", url: "/avatars/avatar-cosmic.webp", label: "Cosmic" },
  { id: "pixel", url: "/avatars/avatar-pixel.webp", label: "Pixel" },
] as const

export type PremadeAvatarId = (typeof PREMADE_AVATARS)[number]["id"]
```

### Step 2: Update `set-avatar` API Route

**File: `src/app/api/profile/set-avatar/route.ts`**

Replace the entire file:

```ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PREMADE_AVATARS } from "@/lib/constants"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { source, avatarId } = body as {
    source: "github" | "twitter" | "premade"
    avatarId?: string
  }

  let avatarUrl: string | null = null

  if (source === "premade") {
    const avatar = PREMADE_AVATARS.find((a) => a.id === avatarId)
    if (!avatar) return NextResponse.json({ error: "Invalid avatar" }, { status: 400 })
    avatarUrl = avatar.url
  } else if (source === "github" || source === "twitter") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("github_verified, github_avatar_url, twitter_verified, twitter_avatar_url")
      .eq("id", user.id)
      .single()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    if (source === "github") {
      if (!profile.github_verified) return NextResponse.json({ error: "GitHub not connected" }, { status: 400 })
      avatarUrl = profile.github_avatar_url
    } else {
      if (!profile.twitter_verified) return NextResponse.json({ error: "Twitter not connected" }, { status: 400 })
      avatarUrl = profile.twitter_avatar_url
    }
  }

  if (!avatarUrl) return NextResponse.json({ error: "No avatar available" }, { status: 400 })

  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, avatar_url: avatarUrl })
}
```

### Step 3: Create Avatar Picker Component

**File: `src/components/avatar-picker.tsx`** (new file)

```tsx
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
    } catch (e: any) {
      toast.error(e.message || "Something went wrong")
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
```

### Step 4: Update Profile Page

**File: `src/app/dashboard/profile/page.tsx`**

Add import at top:
```tsx
import { AvatarPicker } from "@/components/avatar-picker"
```

Replace the Avatar section in the form (the `<div>` containing `<Label>Avatar</Label>` and `<ImageUpload ...>`):

```tsx
<div>
  <Label>Avatar</Label>
  <div className="space-y-3 mt-1">
    <AvatarPicker
      currentAvatarUrl={avatarUrl}
      onAvatarChange={(url) => setAvatarUrl(url)}
    />
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">or upload custom</span>
      </div>
    </div>
    <ImageUpload
      bucket="profile-images"
      path={`${profile.id}/avatar`}
      currentUrl={avatarUrl || null}
      onUploaded={(url) => setAvatarUrl(url)}
      aspectRatio="square"
    />
  </div>
  <p className="text-xs text-muted-foreground mt-1">Pick a premade avatar or upload your own (JPG, PNG, WebP, max 2MB)</p>
</div>
```

### Step 5: Verify `user-avatar.tsx` Compatibility

The `UserAvatar` component uses `<AvatarImage src={avatarUrl}>` which will work with both `/avatars/avatar-chameleon.webp` (static) and Supabase storage URLs. **No changes needed.**

### Risks & Edge Cases
- **Cache:** Static files in `/public` are served with default caching. Users selecting a premade avatar will see it instantly since it's a local path — no CDN delays.
- **Profile save:** The profile page sends `avatar_url` via PATCH to `/api/profile`. The premade picker calls `set-avatar` directly, which updates the DB. Then the form state also updates via `onAvatarChange`. If the user then clicks "Save Profile" the avatar_url is included — this is fine, it's idempotent.
- **ConnectedAccounts "Use as photo":** This component directly updates the DB and calls `onAvatarChange` — it'll override a premade selection. This is expected behavior.

---

## CHUNK D: Account Settings Fixes

### Overview
The settings page (`/dashboard/settings`) currently has:
1. Change Password — sends reset email via `resetPasswordForEmail()`
2. Email Notifications — toggle preferences (no actual email system yet)
3. Export Data
4. Delete Account

**Missing:** Current email display, email change, rate limit handling, "Coming Soon" for notifications.

### Step 1: Show Current Email + Email Change

**File: `src/app/dashboard/settings/page.tsx`**

Add state variables after existing state declarations:
```tsx
const [email, setEmail] = useState("")
const [newEmail, setNewEmail] = useState("")
const [changingEmail, setChangingEmail] = useState(false)
const [showEmailChange, setShowEmailChange] = useState(false)
```

Add `Mail` to lucide imports:
```tsx
import { AlertTriangle, Download, KeyRound, Bell, Mail } from "lucide-react"
```

Add useEffect to load email (after existing useEffect):
```tsx
useEffect(() => {
  const supabase = createClient()
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user?.email) setEmail(user.email)
  })
}, [])
```

Add email change handler:
```tsx
async function handleChangeEmail() {
  if (!newEmail || newEmail === email) return
  setChangingEmail(true)
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw error
    toast.success("Confirmation sent to your new email address. Check both inboxes.")
    setShowEmailChange(false)
    setNewEmail("")
  } catch (e: any) {
    if (e.message?.includes("rate limit")) {
      toast.error("Too many requests. Please wait a few minutes before trying again.")
    } else {
      toast.error(e.message || "Failed to update email")
    }
  } finally {
    setChangingEmail(false)
  }
}
```

Add new Card before the Change Password card (right after `<h1>`):
```tsx
{/* Email */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Mail className="h-5 w-5" />
      Email Address
    </CardTitle>
    <CardDescription>Your account email for login and notifications</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex items-center gap-3">
      <code className="text-sm bg-muted px-3 py-1.5 rounded flex-1">{email || "Loading..."}</code>
      {!showEmailChange && (
        <Button variant="outline" size="sm" onClick={() => setShowEmailChange(true)}>
          Change
        </Button>
      )}
    </div>
    {showEmailChange && (
      <div className="space-y-2 max-w-md">
        <Label htmlFor="newEmail">New email address</Label>
        <Input
          id="newEmail"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="new@example.com"
        />
        <p className="text-xs text-muted-foreground">
          A confirmation link will be sent to both your current and new email addresses.
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleChangeEmail} disabled={changingEmail || !newEmail}>
            {changingEmail ? "Sending..." : "Confirm Change"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setShowEmailChange(false); setNewEmail("") }}>
            Cancel
          </Button>
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

### Step 2: Fix Password Change Rate Limit

In the same file, replace `handleChangePassword`:

```tsx
const [passwordCooldown, setPasswordCooldown] = useState(0)

// Add this useEffect for the countdown timer
useEffect(() => {
  if (passwordCooldown <= 0) return
  const timer = setInterval(() => {
    setPasswordCooldown((c) => c - 1)
  }, 1000)
  return () => clearInterval(timer)
}, [passwordCooldown])

async function handleChangePassword() {
  if (passwordCooldown > 0) return
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      toast.error("No email associated with this account")
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      if (error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many")) {
        toast.error("Too many requests. Please wait before trying again.")
        setPasswordCooldown(60)
      } else {
        throw error
      }
      return
    }
    toast.success("Password reset email sent! Check your inbox.")
    setPasswordCooldown(60) // prevent spamming
  } catch (e: any) {
    toast.error(e.message || "Failed to send reset email")
  }
}
```

Update the password button in the JSX:
```tsx
<Button variant="outline" onClick={handleChangePassword} disabled={passwordCooldown > 0}>
  {passwordCooldown > 0
    ? `Wait ${passwordCooldown}s`
    : "Send Password Reset Email"}
</Button>
```

### Step 3: Mark Notifications as "Coming Soon"

Replace the Email Notifications Card:

```tsx
{/* Email Notifications */}
<Card className="relative">
  <div className="absolute top-4 right-4 z-10">
    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
  </div>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Bell className="h-5 w-5" />
      Email Notifications
    </CardTitle>
    <CardDescription>Choose which emails you&apos;d like to receive</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4 opacity-50 pointer-events-none">
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="notif-purchases" className="font-medium">Purchase Receipts</Label>
        <p className="text-sm text-muted-foreground">Get email confirmations for your purchases</p>
      </div>
      <Toggle id="notif-purchases" checked={notifications.purchases} onChange={() => {}} />
    </div>
    <Separator />
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="notif-sales" className="font-medium">Sale Notifications</Label>
        <p className="text-sm text-muted-foreground">Get notified when someone buys your product</p>
      </div>
      <Toggle id="notif-sales" checked={notifications.sales} onChange={() => {}} />
    </div>
    <Separator />
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="notif-updates" className="font-medium">Product Updates</Label>
        <p className="text-sm text-muted-foreground">Updates about products you&apos;ve purchased</p>
      </div>
      <Toggle id="notif-updates" checked={notifications.productUpdates} onChange={() => {}} />
    </div>
    <Separator />
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="notif-marketing" className="font-medium">Marketing & Promotions</Label>
        <p className="text-sm text-muted-foreground">Tips, deals, and new features from Molt Mart</p>
      </div>
      <Toggle id="notif-marketing" checked={notifications.marketing} onChange={() => {}} />
    </div>
  </CardContent>
  <div className="px-6 pb-4">
    <p className="text-xs text-muted-foreground italic">
      Email notifications will be available once our email system is configured.
    </p>
  </div>
</Card>
```

Add `Badge` to imports:
```tsx
import { Badge } from "@/components/ui/badge"
```

Remove the `saveNotifications` callback, `updateNotification` function, and the notification fetch `useEffect` (since they're disabled). Or keep them for when the feature is enabled — simpler to just keep the code and only disable the UI.

### Summary of All File Changes

| File | Action | What |
|------|--------|------|
| `public/avatars/avatar-*.webp` | ✅ Created | 5 premade avatar images |
| `src/lib/constants.ts` | Create/append | `PREMADE_AVATARS` array |
| `src/app/api/profile/set-avatar/route.ts` | Modify | Add `premade` source type |
| `src/components/avatar-picker.tsx` | Create new | Premade avatar grid picker |
| `src/app/dashboard/profile/page.tsx` | Modify | Add `AvatarPicker` above `ImageUpload` |
| `src/app/dashboard/settings/page.tsx` | Modify | Add email display/change, fix password cooldown, disable notifications |

### Impact on Other Parts of Site
- **No breaking changes.** All changes are additive.
- `UserAvatar` component works with any URL string — no changes needed.
- Nav/header avatar display will update automatically since it reads `avatar_url` from the profile.
- Seller store pages show avatar via the same `avatar_url` field — premade paths work fine.
- The `set-avatar` API change is backward compatible (existing `github`/`twitter` sources still work).

### Testing Checklist
- [ ] Select each premade avatar → verify it saves and displays
- [ ] Upload custom avatar → verify it overrides premade
- [ ] Use GitHub/Twitter avatar → verify it overrides premade
- [ ] Switch back to premade → verify it works
- [ ] Check avatar shows correctly on: profile page, nav bar, seller store, template cards
- [ ] Email displays on settings page
- [ ] Email change sends confirmation
- [ ] Password reset shows cooldown after click
- [ ] Password reset shows friendly error on rate limit
- [ ] Notification toggles are visually disabled with "Coming Soon" badge
- [ ] All existing settings (export, delete) still work
