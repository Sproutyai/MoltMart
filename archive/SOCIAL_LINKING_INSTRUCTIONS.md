# Social Account Linking — Instructions & Plan

## Current State

✅ **Already done:**
- `github_username` and `twitter_username` columns exist on `profiles` table
- Profile edit page has text inputs for both fields
- API route (`/api/profile`) accepts and saves both fields
- `SellerSocialLinks` component displays GitHub/Twitter icons linking to profiles
- Seller profile page shows these links via `SellerProfileHeader`

**What's missing:** Verification. Anyone can type any username — no proof they own the account.

---

## Recommendation: Approach C (Hybrid) ⭐

**Phase 1 (NOW — 0 effort):** Keep the current text inputs. They already work.

**Phase 2 (1-2 days):** Add OAuth verification via Supabase `linkIdentity()`. Verified accounts get a badge.

This gives you something working today while building toward trust/verification.

---

## Phase 1: What to Do RIGHT NOW (30 min)

The text input flow already works. Small improvements to make:

1. **Add a "verified" badge component** — show an unverified gray icon next to manually-entered usernames, so when verification comes, verified ones get a green checkmark
2. **Add `github_verified` and `twitter_verified` boolean columns** to profiles (default `false`)

### Migration to run:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS github_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS twitter_verified boolean DEFAULT false;
```

### Update `types.ts`:
Add to the `Profile` interface:
```ts
github_verified?: boolean
twitter_verified?: boolean
```

---

## Phase 2: OAuth Verification Setup

### How It Works (End-to-End)

1. User is logged in (email/password)
2. User clicks "Verify GitHub" button on profile page
3. App calls `supabase.auth.linkIdentity({ provider: 'github' })`
4. User is redirected to GitHub → authorizes → redirected back
5. Supabase links the GitHub identity to their account
6. Our callback page reads the linked identity, extracts the GitHub username, sets `github_verified = true`
7. Same flow for Twitter/X

---

### Step 1: Set Up GitHub OAuth App

**Thomas — do this:**

1. Go to **https://github.com/settings/developers**
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `Molt Mart`
   - **Homepage URL:** `https://molt.market` (or your domain)
   - **Authorization callback URL:** `https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback`
     - Find your project ref in Supabase Dashboard → Settings → General
     - Example: `https://abcdefghijk.supabase.co/auth/v1/callback`
4. Click **"Register application"**
5. You'll see a **Client ID** — copy it
6. Click **"Generate a new client secret"** — copy the secret immediately (you can't see it again)
7. Save both somewhere safe

### Step 2: Set Up X/Twitter OAuth

**Thomas — do this:**

1. Go to **https://developer.twitter.com/en/portal/dashboard**
2. Create a new Project & App (or use existing)
3. In the App settings, go to **"User authentication settings"** → **Set up**
4. Fill in:
   - **App permissions:** Read (that's all we need)
   - **Type of App:** Web App
   - **Callback URL:** `https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback` (same as GitHub)
   - **Website URL:** `https://molt.market`
5. Save. You'll get:
   - **Client ID** (starts with something like `abc123`)
   - **Client Secret**
6. Save both somewhere safe

> ⚠️ Twitter developer access requires an approved developer account. If you don't have one, apply at developer.twitter.com. It may take a day or two.

### Step 3: Configure Supabase

**Thomas — do this:**

1. Go to your **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **GitHub**:
   - Toggle it **ON**
   - Paste the **Client ID** and **Client Secret** from Step 1
   - Click **Save**
3. Find **Twitter**:
   - Toggle it **ON**
   - Paste the **Client ID** and **Client Secret** from Step 2
   - Click **Save**
4. Go to **Authentication** → **URL Configuration**:
   - Add your site URL: `https://molt.market`
   - Add redirect URL: `https://molt.market/auth/callback`
   - Add redirect URL: `https://molt.market/dashboard/profile`

---

### Step 4: Code Changes Needed

#### A. Auth callback route (if not exists)
`src/app/auth/callback/route.ts` — should already handle OAuth code exchange. Verify it calls `supabase.auth.exchangeCodeForSession()`.

#### B. New component: `VerifySocialButton`

```tsx
// src/components/verify-social-button.tsx
"use client"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Github, Twitter, CheckCircle } from "lucide-react"

export function VerifySocialButton({ 
  provider, 
  isVerified, 
  username 
}: { 
  provider: 'github' | 'twitter'
  isVerified: boolean
  username: string | null
}) {
  const Icon = provider === 'github' ? Github : Twitter
  const label = provider === 'github' ? 'GitHub' : 'X / Twitter'

  async function handleLink() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard/profile?linked=${provider}` }
    })
    if (error) {
      alert(error.message)
      return
    }
    if (data.url) window.location.href = data.url
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle size={16} />
        <span>{label} verified as @{username}</span>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLink}>
      <Icon size={16} className="mr-2" />
      Verify {label}
    </Button>
  )
}
```

#### C. Update profile page

On the profile edit page, after the GitHub/Twitter text inputs, add the verify buttons. When the page loads with `?linked=github`, check the user's identities and update `github_verified`:

```ts
// After OAuth redirect back, check linked identities:
const { data: { user } } = await supabase.auth.getUser()
const githubIdentity = user?.identities?.find(i => i.provider === 'github')
if (githubIdentity) {
  const ghUsername = githubIdentity.identity_data?.user_name
  await fetch('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify({ 
      github_username: ghUsername, 
      github_verified: true 
    })
  })
}
```

#### D. Update API route

Add `github_verified` and `twitter_verified` to the allowed fields in `/api/profile/route.ts`.

#### E. Update `SellerSocialLinks`

Add a small ✓ checkmark next to verified accounts.

---

## Timeline Estimate

| Task | Time | Depends On |
|------|------|------------|
| Phase 1: Add verified columns + types | 15 min | Nothing |
| Phase 1: Add unverified indicator to UI | 30 min | Nothing |
| Thomas: Set up GitHub OAuth App | 10 min | Nothing |
| Thomas: Set up Twitter OAuth | 15 min | Twitter dev account |
| Thomas: Configure Supabase providers | 5 min | OAuth apps created |
| Phase 2: VerifySocialButton component | 1 hour | Supabase configured |
| Phase 2: Profile page integration | 1 hour | Component built |
| Phase 2: Verified badge on public profiles | 30 min | Nothing |
| **Total dev work** | **~3 hours** | |

---

## Summary

| What | Status |
|------|--------|
| GitHub/Twitter text inputs | ✅ Already working |
| Social links on seller profiles | ✅ Already working |
| Verified badges | 🔜 Needs OAuth setup |
| GitHub OAuth verification | 🔜 Thomas needs to create GitHub OAuth App |
| Twitter OAuth verification | 🔜 Thomas needs Twitter dev account + OAuth App |
| Supabase `linkIdentity()` support | ✅ Built into Supabase, just needs provider config |
