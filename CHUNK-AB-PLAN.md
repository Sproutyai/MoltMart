# CHUNK A+B Implementation Plan: Rate Limiting & Auth Email Branding

Generated: 2026-02-20

---

## CHUNK A: Rate Limiting

### Current State Analysis

**What exists:** `src/middleware.ts` has an in-memory `Map`-based rate limiter — 30 req/min/IP on select routes.

**Problems:**
1. **Resets on every deploy** — Vercel serverless instances don't share memory
2. **Doesn't work across instances** — multiple serverless functions = multiple Maps = no real limiting
3. **No per-route granularity** — everything is 30 req/min
4. **No per-user limiting** — only IP-based
5. **No rate limit headers** returned to clients
6. **Signup is client-side** — calls `supabase.auth.signUp()` directly from browser, bypassing middleware entirely

**What works:** The route matching pattern and IP extraction are fine. The `setInterval` cleanup is pointless in serverless but harmless.

### Decision: Upstash vs Simpler Alternatives

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Upstash Redis** | Production-grade, works across instances, `@upstash/ratelimit` has sliding window built-in | Another service to manage, env vars | ✅ **Recommended** |
| **Vercel KV** | Same as Upstash (it IS Upstash under the hood), integrated billing | Vercel lock-in, same thing with extra steps | Skip |
| **Keep in-memory** | Zero setup | Doesn't actually work in serverless | ❌ |
| **Supabase built-in auth rate limits** | No code needed for auth endpoints | Only covers auth, not API routes | Use as complement |

**Decision: Use Upstash for API rate limiting + Supabase dashboard rate limits for auth.**

Supabase has built-in rate limiting at Dashboard → Auth → Rate Limits. These apply to `supabase.auth.signUp()` calls regardless of whether they go through our middleware. **This is the primary defense for signup abuse** since signup happens client-side.

### Implementation Steps

#### Step 1: Set Up Upstash Redis (Thomas or automated)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database (free tier, select region closest to Vercel deployment)
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Add to `.env.local` and Vercel env vars

#### Step 2: Install Dependencies

```bash
cd /Users/growthchain/.openclaw/workspace/molt-mart
npm install @upstash/redis @upstash/ratelimit
```

#### Step 3: Create Rate Limit Utility

**New file: `src/lib/rate-limit.ts`**

```ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Lazy init to avoid errors when env vars missing during build
let redis: Redis | null = null
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

// Strict: auth, account delete, signup-related
export const strictLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "rl:strict",
  analytics: true,
})

// Medium: checkout, file operations
export const mediumLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:medium",
  analytics: true,
})

// Default: general API
export const defaultLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "rl:default",
  analytics: true,
})

// Very strict: data export, account deletion
export const exportLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(2, "1 h"),
  prefix: "rl:export",
  analytics: true,
})
```

**⚠️ Issue with lazy init:** `Ratelimit` constructor needs Redis immediately. Fix: use a factory pattern instead.

**Revised `src/lib/rate-limit.ts`:**

```ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function createRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export function getRateLimiter(tier: "strict" | "medium" | "default" | "export") {
  const configs = {
    strict: { limiter: Ratelimit.slidingWindow(5, "1 m"), prefix: "rl:strict" },
    medium: { limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:medium" },
    default: { limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:default" },
    export: { limiter: Ratelimit.slidingWindow(2, "1 h"), prefix: "rl:export" },
  }
  const config = configs[tier]
  return new Ratelimit({
    redis: createRedis(),
    limiter: config.limiter,
    prefix: config.prefix,
    analytics: true,
  })
}
```

**Note:** Creating Redis/Ratelimit per-call is fine — `@upstash/redis` uses REST (HTTP), not persistent connections. No connection pooling concerns.

#### Step 4: Rewrite Middleware Rate Limiting

**File: `src/middleware.ts`**

Replace the entire rate limiting section. Keep Supabase auth refresh and affiliate tracking.

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// --- Rate Limiting Config ---
type RateTier = { requests: number; window: string; prefix: string }

const RATE_TIERS: Record<string, RateTier> = {
  strict:  { requests: 5,  window: "1 m",  prefix: "rl:strict" },
  medium:  { requests: 10, window: "1 m",  prefix: "rl:medium" },
  default: { requests: 60, window: "1 m",  prefix: "rl:default" },
  export:  { requests: 2,  window: "1 h",  prefix: "rl:export" },
}

const ROUTE_TIER_MAP: Array<[string, string]> = [
  ['/api/account/export', 'export'],
  ['/api/account/delete', 'strict'],
  ['/api/auth', 'strict'],
  ['/api/profile', 'strict'],
  ['/api/checkout', 'medium'],
  ['/api/templates/upload', 'medium'],
  ['/api/templates/replace-file', 'medium'],
  ['/api/affiliate/join', 'strict'],
  ['/api/', 'default'],  // catch-all for any /api/ route
]

function getTierForRoute(pathname: string): RateTier | null {
  for (const [prefix, tierName] of ROUTE_TIER_MAP) {
    if (pathname.startsWith(prefix)) {
      return RATE_TIERS[tierName]
    }
  }
  return null
}

// Cache limiter instances per tier
const limiterCache = new Map<string, Ratelimit>()

function getLimiter(tier: RateTier): Ratelimit {
  if (!limiterCache.has(tier.prefix)) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    limiterCache.set(tier.prefix, new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tier.requests, tier.window as any),
      prefix: tier.prefix,
      analytics: true,
    }))
  }
  return limiterCache.get(tier.prefix)!
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // --- Rate Limiting ---
  if (pathname.startsWith('/api/')) {
    const tier = getTierForRoute(pathname)
    if (tier && process.env.UPSTASH_REDIS_REST_URL) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      const limiter = getLimiter(tier)
      const { success, limit, remaining, reset } = await limiter.limit(ip)

      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        )
      }
      // We'll add headers to the final response below
    }
  }

  // --- Supabase Auth Refresh ---
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // --- Affiliate Referral Tracking ---
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode && !request.cookies.get('molt_ref')) {
    response.cookies.set('molt_ref', refCode, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**Key difference from current:** Rate limit headers returned on 429, graceful fallback if Upstash not configured (`process.env.UPSTASH_REDIS_REST_URL` check), tiered limits.

#### Step 5: Supabase Dashboard Auth Rate Limits

**Thomas needs to do this manually:**

1. Go to https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/rate-limits
2. Set these limits:
   - **Rate limit for sending emails:** 3 per hour (default is likely higher)
   - **Rate limit for signups:** 5 per hour per IP  
   - **Rate limit for token refresh:** leave default
   - **Rate limit for password recovery:** 3 per hour

This is **critical** because signup calls go directly from browser → Supabase, bypassing our middleware entirely.

#### Step 6: Add Honeypot to Signup Form

**File: `src/app/signup/page.tsx`**

Add a hidden field that bots will fill out:

```tsx
// Add to state:
const [website, setWebsite] = useState("") // honeypot

// Add to form (before submit button), hidden via CSS:
<div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
  <Label htmlFor="website">Website</Label>
  <Input
    id="website"
    type="text"
    value={website}
    onChange={(e) => setWebsite(e.target.value)}
    tabIndex={-1}
    autoComplete="off"
  />
</div>

// Add to handleSubmit, before the supabase call:
if (website) {
  // Bot detected — silently pretend success
  toast.success("Account created! Check your email to confirm.")
  return
}
```

#### Step 7: Client-Side Signup Throttle

**File: `src/app/signup/page.tsx`**

Add to `handleSubmit`:

```tsx
// At top of component:
const [lastAttempt, setLastAttempt] = useState(0)

// In handleSubmit, after validation:
const now = Date.now()
if (now - lastAttempt < 10_000) { // 10 second cooldown
  setError("Please wait a moment before trying again")
  return
}
setLastAttempt(now)
```

### Edge Cases & Potential Issues

1. **Upstash cold start latency:** First request after idle may add ~50-100ms. Acceptable for API routes.
2. **Shared IPs (corporate/VPN):** 60 req/min default is generous enough. Strict routes (5/min) could be an issue for corporate networks all signing up — unlikely for this niche product.
3. **Middleware runs on every request** including non-API routes. The `pathname.startsWith('/api/')` check ensures we only hit Upstash for API calls.
4. **Build-time errors:** If `UPSTASH_REDIS_REST_URL` isn't set during `next build`, the middleware won't crash because we lazily create Redis instances and check for the env var.
5. **Webhook routes** (`/api/checkout/webhook`, `/api/promote/webhook`) — these come from Stripe and should NOT be rate limited. Add exclusion:
   ```ts
   // Add at top of rate limiting section:
   if (pathname.endsWith('/webhook')) return // Don't rate limit webhooks
   ```

### Files Changed Summary (Chunk A)

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `@upstash/redis`, `@upstash/ratelimit` |
| `.env.local` | Modify | Add `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| `src/lib/rate-limit.ts` | **New** | Rate limit utility (optional, middleware handles it inline) |
| `src/middleware.ts` | **Rewrite** | Replace in-memory with Upstash, add tiers, add headers |
| `src/app/signup/page.tsx` | Modify | Add honeypot field + client-side throttle |
| Vercel Dashboard | Config | Add Upstash env vars |
| Supabase Dashboard | Config | Set auth rate limits |

---

## CHUNK B: Auth Email Branding

### Current State

- Supabase sends default-branded emails for confirmation, password reset, magic links
- Emails come from `noreply@mail.app.supabase.io` (or similar default)
- No custom SMTP configured
- Domain: `moltmart.bot`

### Decision: Custom SMTP Provider

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Resend** | Great DX, generous free tier (100 emails/day), easy DNS setup | Newer service | ✅ **Recommended** |
| **Postmark** | Excellent deliverability, great docs | 100 emails/month free, then paid | Good alternative |
| **Amazon SES** | Cheapest at scale | Complex setup, sandbox mode initially | Overkill for MVP |
| **Supabase default + custom templates** | Zero setup | Emails from supabase.io domain = less trustworthy, can't customize sender | ❌ Not enough |

**Decision: Use Resend.** Free tier is 100 emails/day which is plenty for MVP. If Thomas already has a preferred provider, substitute accordingly.

### Implementation Steps

#### Step 1: Set Up Resend (Thomas)

1. Sign up at [resend.com](https://resend.com)
2. Add domain `moltmart.bot`
3. Resend will provide DNS records to add

#### Step 2: DNS Records for moltmart.bot

Thomas needs to add these records at the domain registrar (wherever moltmart.bot DNS is managed):

**Records Resend will provide (example values — actual values come from Resend dashboard):**

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `@` or `moltmart.bot` | `v=spf1 include:send.resend.com ~all` | SPF — authorizes Resend to send email |
| CNAME | `resend._domainkey` | `resend._domainkey.moltmart.bot.at.resend.com` | DKIM — email signing |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:thomas@moltmart.bot` | DMARC — reporting |
| MX | `send` | (provided by Resend) | Return path |

**Important:** The exact values will be provided by Resend's dashboard after adding the domain. Don't copy these example values.

**Also consider:** If Thomas wants to receive email at `@moltmart.bot` (e.g., `support@moltmart.bot`), he'll need an email hosting service (Google Workspace, Zoho, etc.) with separate MX records on the root domain.

#### Step 3: Configure Supabase Custom SMTP

1. Go to https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/settings/auth
2. Scroll to **SMTP Settings** → Enable Custom SMTP
3. Enter:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Username:** `resend` (literal string)
   - **Password:** Resend API key (starts with `re_`)
   - **Sender email:** `no-reply@moltmart.bot`
   - **Sender name:** `Molt Mart`

#### Step 4: Customize Email Templates

Go to https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/templates

Supabase provides these template slots:
- **Confirm signup**
- **Invite user**
- **Magic link**
- **Change email address**
- **Reset password**

For each template, customize with Molt Mart branding. Here are ready-to-paste templates:

**Confirm Signup:**
```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Confirm your email</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
    Thanks for signing up! Click the button below to confirm your email address and activate your account.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Confirm Email
    </a>
  </div>
  <p style="font-size: 12px; color: #666; text-align: center;">
    If you didn't create an account, you can safely ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">
    © 2026 Molt Mart · moltmart.bot
  </p>
</div>
```

**Reset Password:**
```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Reset your password</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
    We received a request to reset your password. Click the button below to choose a new one.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Reset Password
    </a>
  </div>
  <p style="font-size: 12px; color: #666; text-align: center;">
    This link expires in 24 hours. If you didn't request this, ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">
    © 2026 Molt Mart · moltmart.bot
  </p>
</div>
```

**Change Email:**
```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Confirm email change</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
    Click below to confirm changing your email to this address.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Confirm Email Change
    </a>
  </div>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">
    © 2026 Molt Mart · moltmart.bot
  </p>
</div>
```

**Magic Link (if enabled):**
```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Your login link</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
    Click the button below to log in to your Molt Mart account.
  </p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Log In
    </a>
  </div>
  <p style="font-size: 12px; color: #666; text-align: center;">
    This link expires in 1 hour. If you didn't request this, ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">
    © 2026 Molt Mart · moltmart.bot
  </p>
</div>
```

#### Step 5: Test Deliverability

After setup, send test emails to:
- Gmail
- Outlook/Hotmail
- Yahoo
- ProtonMail

Check:
- Emails arrive (not in spam)
- Sender shows as "Molt Mart <no-reply@moltmart.bot>"
- Links work correctly (confirm, reset, etc.)
- Branding renders properly

### What Thomas Needs To Do vs What Can Be Automated

| Task | Who | Notes |
|------|-----|-------|
| Create Resend account | Thomas | Needs payment info |
| Add domain in Resend | Thomas | Gets DNS records |
| Add DNS records | Thomas | At domain registrar |
| Wait for DNS propagation | — | Up to 48h, usually minutes |
| Configure SMTP in Supabase | Thomas or agent | Dashboard only, no API |
| Paste email templates | Thomas or agent | Dashboard only |
| Test emails | Agent | Can trigger from signup/reset flows |

### Edge Cases & Potential Issues

1. **DNS propagation delay:** After adding records, emails may fail/bounce for up to 48h. Supabase will fall back to default SMTP if custom SMTP fails.
2. **Resend free tier limit:** 100 emails/day. If the site gets popular, need to upgrade ($20/mo for 5k/mo). For MVP this is fine.
3. **Supabase email template variables:** Must use exact Go template syntax: `{{ .ConfirmationURL }}`, `{{ .Token }}`, etc. Typos = broken emails.
4. **moltmart.bot TLD:** `.bot` domains sometimes have stricter email reputation checks. SPF+DKIM+DMARC all being set correctly is extra important.
5. **Existing users:** Anyone who signed up before the branding change will see old-style emails for future password resets. This is fine — no action needed.

---

## Execution Checklist

### Chunk A (Rate Limiting)
- [ ] Create Upstash Redis instance
- [ ] Add env vars to `.env.local` and Vercel
- [ ] `npm install @upstash/redis @upstash/ratelimit`
- [ ] Rewrite `src/middleware.ts` (use code above)
- [ ] Add webhook exclusion
- [ ] Add honeypot to `src/app/signup/page.tsx`
- [ ] Add client-side throttle to signup
- [ ] Configure Supabase auth rate limits in dashboard
- [ ] Test: hit API 60+ times rapidly, verify 429
- [ ] Test: signup form honeypot
- [ ] Deploy to Vercel, verify rate limiting works across instances

### Chunk B (Auth Email Branding)
- [ ] Sign up for Resend
- [ ] Add `moltmart.bot` domain in Resend
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Verify domain in Resend dashboard
- [ ] Configure custom SMTP in Supabase dashboard
- [ ] Paste all 4 email templates
- [ ] Test signup confirmation email
- [ ] Test password reset email
- [ ] Test email change flow
- [ ] Check spam folders across providers
