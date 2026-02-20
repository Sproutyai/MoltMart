# Thomas TODO: Chunks A + B (Rate Limiting & Auth Email Branding)

## Chunk A: Rate Limiting — Manual Steps

### 1. Create Upstash Redis Instance
1. Go to [console.upstash.com](https://console.upstash.com) and sign up/log in
2. Create a new **Redis** database (free tier is fine)
   - Region: **US West** (closest to your Vercel deployment)
3. Copy the **REST URL** and **REST Token** from the database details page

### 2. Add Environment Variables
Add these to **Vercel** (Settings → Environment Variables) AND `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

> ⚠️ Rate limiting gracefully degrades — if these vars are missing, the app works normally without rate limits.

### 3. Configure Supabase Auth Rate Limits
Go to: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/rate-limits

Set these values:
| Setting | Recommended Value |
|---------|------------------|
| Rate limit for sending emails | **3 per hour** |
| Rate limit for signups | **5 per hour per IP** |
| Rate limit for password recovery | **3 per hour** |
| Rate limit for token refresh | Leave default |

> This is **critical** because signup calls go directly from browser → Supabase, bypassing our middleware.

---

## Chunk B: Auth Email Branding — Manual Steps

### 1. Sign Up for Resend
1. Go to [resend.com](https://resend.com) and create an account
2. Add domain: `moltmart.bot`
3. Resend will give you DNS records to add

### 2. Add DNS Records for moltmart.bot
At your domain registrar, add the records Resend provides. They'll look like:

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | `@` | `v=spf1 include:send.resend.com ~all` | SPF |
| CNAME | `resend._domainkey` | (provided by Resend) | DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC |

> **Use the exact values from Resend's dashboard**, not these examples.

### 3. Configure Custom SMTP in Supabase
Go to: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/settings/auth

Scroll to **SMTP Settings** → Enable Custom SMTP:
- **Host:** `smtp.resend.com`
- **Port:** `465`
- **Username:** `resend`
- **Password:** Your Resend API key (starts with `re_`)
- **Sender email:** `no-reply@moltmart.bot`
- **Sender name:** `Molt Mart`

### 4. Customize Email Templates
Go to: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/templates

Paste these branded templates for each type:

<details>
<summary><strong>Confirm Signup</strong></summary>

```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Confirm your email</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">Thanks for signing up! Click the button below to confirm your email address and activate your account.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Confirm Email</a>
  </div>
  <p style="font-size: 12px; color: #666; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">© 2026 Molt Mart · moltmart.bot</p>
</div>
```
</details>

<details>
<summary><strong>Reset Password</strong></summary>

```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Reset your password</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">We received a request to reset your password. Click the button below to choose a new one.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Reset Password</a>
  </div>
  <p style="font-size: 12px; color: #666; text-align: center;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">© 2026 Molt Mart · moltmart.bot</p>
</div>
```
</details>

<details>
<summary><strong>Change Email</strong></summary>

```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Confirm email change</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">Click below to confirm changing your email to this address.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Confirm Email Change</a>
  </div>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">© 2026 Molt Mart · moltmart.bot</p>
</div>
```
</details>

<details>
<summary><strong>Magic Link</strong></summary>

```html
<div style="max-width: 500px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background-color: #0a0a0a; padding: 40px 24px; border-radius: 12px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">🦎 Molt Mart</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">The marketplace for AI agent enhancements</p>
  </div>
  <h2 style="font-size: 20px; color: #ffffff; margin-bottom: 16px;">Your login link</h2>
  <p style="font-size: 14px; line-height: 1.6; color: #ccc;">Click the button below to log in to your Molt Mart account.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Log In</a>
  </div>
  <p style="font-size: 12px; color: #666; text-align: center;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #222; margin: 24px 0;">
  <p style="font-size: 11px; color: #555; text-align: center;">© 2026 Molt Mart · moltmart.bot</p>
</div>
```
</details>

### 5. Test Email Deliverability
After setup, trigger test emails (sign up, reset password) and check:
- ✅ Emails arrive in inbox (not spam) on Gmail, Outlook, Yahoo
- ✅ Sender shows as "Molt Mart <no-reply@moltmart.bot>"
- ✅ Links work correctly
- ✅ Dark branding renders properly

---

## What Was Already Done (Code Changes)
- ✅ Installed `@upstash/redis` and `@upstash/ratelimit`
- ✅ Created `src/lib/rate-limit.ts` — tiered rate limit utility
- ✅ Rewrote `src/middleware.ts` — Upstash-based tiered rate limiting with proper headers, webhook exclusion, graceful fallback
- ✅ Added honeypot field to signup form (bot trap)
- ✅ Added 10-second client-side signup throttle
