# CHUNK 2 Implementation Plan

## Fix A: Avatar Picker — Show Both Options for Sellers

**File:** `src/app/dashboard/account/profile/page.tsx`

**Current code (lines ~88-97):**
```tsx
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
```

**Replace with:**
```tsx
<AvatarPicker
  currentAvatarUrl={avatarUrl || null}
  onAvatarChange={(url) => setAvatarUrl(url)}
/>
{profile.is_seller && (
  <div className="mt-4">
    <p className="text-sm font-medium mb-2">Or upload a custom image</p>
    <ImageUpload
      bucket="profile-images"
      path={`${profile.id}/avatar`}
      currentUrl={avatarUrl || null}
      onUploaded={(url) => setAvatarUrl(url)}
      aspectRatio="square"
    />
  </div>
)}
```

**Result:** All users see premade avatars. Sellers also get the upload option below.

---

## Fix B: Un-archive — Add Visible Restore Button on Archived Cards

**File:** `src/app/dashboard/seller/products/page.tsx`

### B1: List view — Add "Restore" button to the archived banner

Find the archived banner in list view (around line ~180):
```tsx
{product.status === "archived" && (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-1.5 flex items-center gap-2">
    <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
    <span className="text-xs text-yellow-700 dark:text-yellow-400">This product is archived and not visible to buyers</span>
  </div>
)}
```

**Replace with:**
```tsx
{product.status === "archived" && (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-1.5 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
      <span className="text-xs text-yellow-700 dark:text-yellow-400">This product is archived and not visible to buyers</span>
    </div>
    <Button
      variant="outline"
      size="sm"
      className="h-6 text-xs border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
      onClick={() => handleArchiveToggle(product)}
    >
      <ArchiveRestore className="h-3 w-3 mr-1" />
      Restore
    </Button>
  </div>
)}
```

### B2: Card view — Add "Restore" button to archived notice

Find the card view archived notice (around line ~230):
```tsx
{product.status === "archived" && (
  <div className="flex items-center gap-1 mb-2 text-[10px] text-yellow-700 dark:text-yellow-400">
    <AlertTriangle className="h-3 w-3" />
    Archived — not visible to buyers
  </div>
)}
```

**Replace with:**
```tsx
{product.status === "archived" && (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-1 text-[10px] text-yellow-700 dark:text-yellow-400">
      <AlertTriangle className="h-3 w-3" />
      Archived
    </div>
    <Button
      variant="outline"
      size="sm"
      className="h-5 text-[10px] px-1.5 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
      onClick={() => handleArchiveToggle(product)}
    >
      <ArchiveRestore className="h-2.5 w-2.5 mr-0.5" />
      Restore
    </Button>
  </div>
)}
```

---

## Fix C: Eye Icon 404 — Allow Owner Preview of Non-Published Products

This is the best UX: let the owner view their own product regardless of status, with a preview banner.

### C1: Modify the template detail page query

**File:** `src/app/templates/[slug]/page.tsx`

**Current main query (~lines 67-73):**
```tsx
  const { data: template } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, github_username, github_avatar_url, github_repos_count, github_followers_count, github_created_at, twitter_verified, twitter_username, twitter_followers_count, twitter_tweet_count)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!template) notFound()
```

**Replace with:**
```tsx
  const { data: { user } } = await supabase.auth.getUser()

  // Try published first
  let { data: template } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, github_username, github_avatar_url, github_repos_count, github_followers_count, github_created_at, twitter_verified, twitter_username, twitter_followers_count, twitter_tweet_count)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  // If not found and user is logged in, check if they own a non-published version
  let isOwnerPreview = false
  if (!template && user) {
    const { data: ownedTemplate } = await supabase
      .from("templates")
      .select("*, seller:profiles!seller_id(username, display_name, avatar_url, is_verified, github_verified, github_username, github_avatar_url, github_repos_count, github_followers_count, github_created_at, twitter_verified, twitter_username, twitter_followers_count, twitter_tweet_count)")
      .eq("slug", slug)
      .eq("seller_id", user.id)
      .single()
    if (ownedTemplate) {
      template = ownedTemplate
      isOwnerPreview = true
    }
  }

  if (!template) notFound()
```

**IMPORTANT:** Remove the duplicate `const { data: { user } } = await supabase.auth.getUser()` call that exists later in the file (~line 82). The `user` variable is now declared earlier. Keep the existing code that uses `user` for purchases/bookmarks, just delete the second `.auth.getUser()` call.

Find and delete this line (keep the logic around it):
```tsx
  const { data: { user } } = await supabase.auth.getUser()
```
(The one that appears AFTER the template query, around line 82.)

### C2: Add preview banner at top of page

**In the return JSX, right after the opening `<div className="grid gap-8 lg:grid-cols-3">`, add:**

```tsx
      {isOwnerPreview && (
        <div className="lg:col-span-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Owner preview</strong> — This product is <strong>{(template as any).status}</strong> and not visible to buyers.
          </span>
        </div>
      )}
```

Note: `AlertTriangle` is already imported in this file.

### C3: Also update the metadata function

**In `generateMetadata`**, the query also filters by `published`. For owner preview the metadata isn't critical, but to avoid "Template Not Found" title, update it:

Find in `generateMetadata`:
```tsx
    .eq("status", "published")
```

**Replace with:**
```tsx
    // Note: metadata will show "not found" for non-published, which is fine for SEO
    .eq("status", "published")
```

Actually, leave metadata as-is. Non-published products SHOULD show "not found" metadata for SEO. No change needed here.

### C4: Update the Eye icon label for non-published products (nice-to-have)

**File:** `src/app/dashboard/seller/products/page.tsx`

In list view, find the Eye button link:
```tsx
                  <Link href={`/templates/${product.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      <Eye className="h-3.5 w-3.5 mr-1" />View
                    </Button>
                  </Link>
```

**Replace with:**
```tsx
                  <Link href={`/templates/${product.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      <Eye className="h-3.5 w-3.5 mr-1" />{product.status === "published" ? "View" : "Preview"}
                    </Button>
                  </Link>
```

---

## Summary of Changes

| File | What |
|------|------|
| `src/app/dashboard/account/profile/page.tsx` | Show AvatarPicker for all users; sellers also get ImageUpload below |
| `src/app/dashboard/seller/products/page.tsx` | Add Restore buttons on archived banners (list + card); change Eye label for non-published |
| `src/app/templates/[slug]/page.tsx` | Allow owner to view non-published products with preview banner; move `user` auth call earlier |
