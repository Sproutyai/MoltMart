# Seller Profile Issues — Analysis & Implementation Plan

## Issue 1: Seller Profile Page Broken

### Root Cause

**`src/lib/supabase/server.ts` — `setAll` throws in Server Components.**

```ts
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) =>
    cookieStore.set(name, value, options))  // ← THROWS in Next 16 Server Components
},
```

In Next.js 15+/16, `cookies().set()` is **read-only in Server Components** and throws an error. When a user visits `/sellers/[username]` with an expired or refreshable auth token, Supabase SSR calls `setAll` to persist the refreshed token. This throws an unhandled exception that bubbles up to the root `error.tsx` boundary, showing "Something went wrong."

The middleware (`src/middleware.ts`) correctly handles `setAll` by writing to the response, but the **Server Component's `createClient()`** has no try-catch protection.

### Fix

**File: `src/lib/supabase/server.ts`** — Wrap `setAll` in try-catch:

```ts
setAll(cookiesToSet) {
  try {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options))
  } catch {
    // In Server Components, cookies are read-only.
    // The middleware handles token refresh via response cookies.
  }
},
```

This is the [official Supabase recommendation](https://supabase.com/docs/guides/auth/server-side/nextjs) for Next.js App Router server components.

---

## Issue 2: Seller Name Links + Avatar on All Cards

### Current State

| Variant | Seller rendering | Clickable? | Avatar? |
|---------|-----------------|------------|---------|
| **default** | Plain `<p>` tag: `template.seller.display_name \|\| template.seller.username` | ❌ No | ❌ No |
| **compact** | No seller shown at all | ❌ N/A | ❌ N/A |
| **library** | Uses `<SellerLink>` with `showAvatar` | ✅ Yes | ✅ Yes |

The `SellerLink` component already exists at `src/components/seller-link.tsx` and does exactly what's needed: renders a clickable link to `/sellers/{username}` with optional avatar. The library variant already uses it correctly.

### Seller Data Availability

The `TemplateCardProps` interface already accepts:
```ts
seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; ... }
```

Templates are fetched with `seller:profiles!seller_id(username, display_name, avatar_url, ...)` join in most places, so seller data is already available on cards.

### Fix

**File: `src/components/template-card.tsx`**

#### Change 1: Default variant — Replace plain `<p>` with `<SellerLink>`

Find (around line ~200 in the default variant):
```tsx
{template.seller && (
  <p className="text-xs text-muted-foreground truncate">{template.seller.display_name || template.seller.username}</p>
)}
```

Replace with:
```tsx
{template.seller && (
  <div className="flex items-center" onClick={(e) => e.preventDefault()}>
    <SellerLink
      username={template.seller.username}
      displayName={template.seller.display_name}
      avatarUrl={template.seller.avatar_url}
      showAvatar
    />
    {template.seller.is_verified && (
      <TrustBadge
        githubVerified={template.seller.github_verified}
        twitterVerified={template.seller.twitter_verified}
        variant="inline"
      />
    )}
  </div>
)}
```

#### Change 2: Compact variant — Add seller name

After the category/price row in the compact variant (after the `justify-between mt-1` div), add:
```tsx
{template.seller && (
  <div className="mt-0.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
    <SellerLink
      username={template.seller.username}
      displayName={template.seller.display_name}
      avatarUrl={template.seller.avatar_url}
      showAvatar
    />
  </div>
)}
```

#### Change 3: Add underline styling to SellerLink

**File: `src/components/seller-link.tsx`**

Change the `<span>` class to include underline:
```tsx
<span className="truncate underline decoration-muted-foreground/50 underline-offset-2">by {displayName || username}</span>
```

### Places Using Template Cards (verification)

All these already pass `seller` data via the template query join — no additional data fetching needed:
- `src/app/page.tsx` (homepage carousel)
- `src/app/templates/page.tsx` (explore)
- `src/app/templates/new/page.tsx`
- `src/app/templates/featured/page.tsx`
- `src/app/sellers/[username]/page.tsx`
- `src/app/dashboard/purchases/page.tsx` (library variant — already working)
- Search results (compact variant)

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/supabase/server.ts` | Wrap `setAll` in try-catch (fixes Issue 1) |
| `src/components/template-card.tsx` | Default variant: replace `<p>` with `<SellerLink>` + avatar + trust badge |
| `src/components/template-card.tsx` | Compact variant: add `<SellerLink>` with avatar |
| `src/components/seller-link.tsx` | Add `underline` class to seller name span |
