# Seller Profile Build Plan

> Agent 3 — 2026-02-16 | For Agent 4 to implement

## Build Order

1. DB migration (add `last_active_at` column)
2. Supabase Storage bucket setup
3. Image upload component
4. Update edit page (image upload + live preview + rename)
5. Update public profile page (activity indicator, contact, share, empty states, OG meta, mobile cleanup)
6. Rename "Public Profile" → "Seller Profile"

---

## File-by-File Plan

### 1. `supabase/migrations/add_last_active_at.sql` — CREATE

**What:** SQL migration to add activity tracking column.

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- Update last_active_at when seller publishes/updates a template
CREATE OR REPLACE FUNCTION update_seller_last_active()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles SET last_active_at = now() WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_seller_last_active ON templates;
CREATE TRIGGER trigger_seller_last_active
  AFTER INSERT OR UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_seller_last_active();

-- Backfill: set last_active_at to most recent template updated_at
UPDATE profiles p SET last_active_at = (
  SELECT MAX(t.updated_at) FROM templates t WHERE t.seller_id = p.id
) WHERE p.is_seller = true;
```

**Run this against the DB before deploying code.** Use Supabase dashboard SQL editor if no CLI.

---

### 2. `supabase/setup_storage_bucket.sql` — CREATE

**What:** Create `profile-images` bucket in Supabase Storage.

**Run in Supabase dashboard → SQL Editor:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update/delete their own images
CREATE POLICY "Users can manage own profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read access
CREATE POLICY "Public read profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');
```

**Storage path convention:** `profile-images/{user_id}/avatar.{ext}` and `profile-images/{user_id}/banner.{ext}`

---

### 3. `src/components/image-upload.tsx` — CREATE

**What:** Reusable image upload component for avatar and banner.

**Props:**
```ts
interface ImageUploadProps {
  bucket: string           // "profile-images"
  path: string             // e.g. "{userId}/avatar"
  currentUrl: string | null
  onUploaded: (url: string) => void
  aspectRatio?: "square" | "banner"  // square = avatar, banner = 3:1
  className?: string
}
```

**Key implementation:**
- `<input type="file" accept="image/*">` hidden, triggered by clicking the preview area
- On file select:
  1. Validate file size (max 2MB avatar, 5MB banner)
  2. Generate path: `{path}.{extension}` (e.g. `abc123/avatar.jpg`)
  3. Upload via `supabase.storage.from(bucket).upload(filePath, file, { upsert: true })`
  4. Get public URL via `supabase.storage.from(bucket).getPublicUrl(filePath)`
  5. Call `onUploaded(publicUrl)`
  6. Show toast on success/error
- Preview: show current image or placeholder
- Avatar mode: circular 80px preview with camera icon overlay on hover
- Banner mode: 3:1 rectangle preview with camera icon overlay on hover
- Loading state: spinner overlay during upload

**Dependencies:** `sonner` for toasts, `lucide-react` for Camera icon, supabase client.

---

### 4. `src/lib/types.ts` — MODIFY

**Changes:** Add `last_active_at` to Profile interface.

```diff
  follower_count?: number
  created_at: string
+ last_active_at?: string | null
}
```

---

### 5. `src/components/share-profile-button.tsx` — CREATE

**What:** Client component with share/copy-link functionality.

**Props:** `{ username: string; displayName: string }`

**Implementation:**
- Button with `Share` icon from lucide-react
- On click: try `navigator.share()` (mobile), fallback to dropdown with:
  - "Copy link" → `navigator.clipboard.writeText(url)` → toast "Link copied!"
  - "Share on X" → `window.open(twitterIntentUrl)`
- URL: `https://moltmart.com/sellers/{username}` (use `window.location.origin` + path)
- Use `DropdownMenu` from shadcn/ui if available, otherwise simple popover

---

### 6. `src/components/contact-seller-button.tsx` — CREATE

**What:** Client component that links to seller's best available contact.

**Props:** `{ twitterUsername?: string | null; githubUsername?: string | null; website?: string | null }`

**Implementation:**
- Determine best contact: Twitter DM → GitHub → Website (in that priority order)
- If Twitter: link to `https://twitter.com/messages/compose?recipient_id=...` — actually simpler: `https://twitter.com/{username}`
- If GitHub: link to `https://github.com/{username}`
- If website: link to website
- If none available: don't render the button at all
- Render: `<Button variant="outline" size="sm">` with `MessageCircle` icon + "Contact"
- Opens in new tab

---

### 7. `src/components/activity-indicator.tsx` — CREATE

**What:** Small text component showing seller activity status.

**Props:** `{ lastActiveAt: string | null; createdAt: string }`

**Implementation:**
- If `lastActiveAt` is within 24h: show green dot + "Active today"
- If within 7 days: "Active X days ago"
- If within 30 days: "Active this month"
- Else: "Last active {month} {year}" or just don't show if null
- Render as `<span className="text-xs text-muted-foreground">` with optional green dot (`<span className="inline-block h-2 w-2 rounded-full bg-green-500">`)

---

### 8. `src/components/seller-profile-header.tsx` — MODIFY

**Changes:**

1. **Add activity indicator** — below the "Member since" line:
```diff
  <p className="text-sm text-muted-foreground">
    @{profile.username} · Member since {memberSince}
  </p>
+ <ActivityIndicator lastActiveAt={profile.last_active_at ?? null} createdAt={profile.created_at} />
```

2. **Add Contact + Share buttons** next to Follow button:
```diff
  {!isOwnProfile && (
-   <FollowButton sellerId={profile.id} initialFollowing={isFollowing} />
+   <div className="flex items-center gap-2">
+     <FollowButton sellerId={profile.id} initialFollowing={isFollowing} />
+     <ContactSellerButton
+       twitterUsername={profile.twitter_username}
+       githubUsername={profile.github_username}
+       website={profile.website}
+     />
+     <ShareProfileButton username={profile.username} displayName={profile.display_name || profile.username} />
+   </div>
  )}
+ {isOwnProfile && (
+   <ShareProfileButton username={profile.username} displayName={profile.display_name || profile.username} />
+ )}
```

3. **Import new components** at top:
```ts
import { ActivityIndicator } from "@/components/activity-indicator"
import { ShareProfileButton } from "@/components/share-profile-button"
import { ContactSellerButton } from "@/components/contact-seller-button"
```

4. **Mobile layout cleanup:**
- Change banner: `h-40` → `h-32 sm:h-40`
- Ensure avatar section uses `px-4 sm:px-6`
- Add `flex-wrap` to the buttons container for mobile
- On the `flex-col sm:flex-row` section, ensure the buttons wrap properly on small screens by making them full-width on mobile:
```diff
- <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 -mt-12 px-4">
+ <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 -mt-12 px-4 sm:px-6">
```

---

### 9. `src/app/sellers/[username]/page.tsx` — MODIFY

**Changes:**

#### A. Add `generateMetadata` for OG tags

Add at top of file, before the default export:

```ts
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio, avatar_url, banner_url")
    .eq("username", username)
    .eq("is_seller", true)
    .single()

  if (!profile) return { title: "Seller Not Found" }

  const name = profile.display_name || profile.username
  const description = profile.bio || `Check out ${name}'s templates on Molt Mart`
  const ogImage = profile.banner_url || profile.avatar_url || undefined

  return {
    title: `${name} — Seller Profile | Molt Mart`,
    description,
    openGraph: {
      title: `${name} on Molt Mart`,
      description,
      type: "profile",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${name} on Molt Mart`,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}
```

#### B. Better empty states

Replace the current empty template state:

```diff
- <p className="py-8 text-center text-muted-foreground">No templates published yet.</p>
+ {isOwnProfile ? (
+   <div className="py-12 text-center space-y-3">
+     <p className="text-lg font-medium">Your shop is empty!</p>
+     <p className="text-sm text-muted-foreground">Publish your first template to start selling.</p>
+     <a href="/dashboard/templates/new" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
+       Publish your first template →
+     </a>
+   </div>
+ ) : (
+   <div className="py-12 text-center space-y-3">
+     <p className="text-lg font-medium">🚀 {p.display_name || p.username} is setting up shop</p>
+     <p className="text-sm text-muted-foreground">Follow to get notified when they publish their first template!</p>
+   </div>
+ )}
```

#### C. Add template count to heading

```diff
- <h2 className="text-xl font-semibold">All Templates</h2>
+ <h2 className="text-xl font-semibold">All Templates ({totalCount})</h2>
```

---

### 10. `src/app/dashboard/profile/page.tsx` — MODIFY (Major)

**This is the biggest change.** Replace the current edit page with image uploads + live preview.

#### Key changes:

1. **Import ImageUpload component**:
```ts
import { ImageUpload } from "@/components/image-upload"
```

2. **Replace Avatar URL text input** with ImageUpload:
```diff
- <div>
-   <Label htmlFor="avatarUrl">Avatar URL</Label>
-   <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
- </div>
+ <div>
+   <Label>Avatar</Label>
+   <ImageUpload
+     bucket="profile-images"
+     path={`${profile.id}/avatar`}
+     currentUrl={avatarUrl}
+     onUploaded={(url) => setAvatarUrl(url)}
+     aspectRatio="square"
+   />
+ </div>
```

3. **Replace Banner URL text input** with ImageUpload:
```diff
- <div>
-   <Label htmlFor="bannerUrl">Banner URL</Label>
-   <Input id="bannerUrl" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." />
- </div>
+ <div>
+   <Label>Banner</Label>
+   <ImageUpload
+     bucket="profile-images"
+     path={`${profile.id}/banner`}
+     currentUrl={bannerUrl}
+     onUploaded={(url) => setBannerUrl(url)}
+     aspectRatio="banner"
+   />
+ </div>
```

4. **Add live preview panel** — restructure layout to two columns on desktop:

Replace the outer structure. Instead of single `<Card className="max-w-2xl">`, use:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
  {/* Edit form — left side */}
  <div className="lg:col-span-3">
    <Card>
      <CardHeader><CardTitle>Seller Profile</CardTitle></CardHeader>
      <CardContent>
        {/* ... existing form fields with image upload replacements ... */}
      </CardContent>
    </Card>
    <ConnectedAccounts />
  </div>

  {/* Live preview — right side */}
  <div className="lg:col-span-2">
    <Card className="sticky top-6">
      <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
      <CardContent className="p-0 overflow-hidden">
        {/* Mini profile preview */}
        <div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
          {bannerUrl && <img src={bannerUrl} alt="" className="h-full w-full object-cover" />}
        </div>
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
          {bio && <p className="text-xs text-muted-foreground mt-2">{bio}</p>}
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
```

5. **Rename heading** from "Edit Profile" → "Edit Seller Profile":
```diff
- <h1 className="text-2xl font-bold">Edit Profile</h1>
+ <h1 className="text-2xl font-bold">Edit Seller Profile</h1>
```

6. **Rename card title** from "Your Profile" → "Seller Profile":
```diff
- <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
+ <CardHeader><CardTitle>Seller Profile</CardTitle></CardHeader>
```

7. **Change "View public profile" link text:**
```diff
- View public profile <ExternalLink size={14} />
+ View seller profile <ExternalLink size={14} />
```

---

### 11. `src/app/dashboard/layout.tsx` — MODIFY

**Change:** Rename sidebar link label.

```diff
- { href: `/sellers/${profile.username}`, label: "Public Profile", icon: ExternalLink }
+ { href: `/sellers/${profile.username}`, label: "Seller Profile", icon: ExternalLink }
```

---

## Summary of All Files

| # | File | Action | Effort |
|---|------|--------|--------|
| 1 | `supabase/migrations/add_last_active_at.sql` | CREATE | 15 min |
| 2 | `supabase/setup_storage_bucket.sql` | CREATE | 15 min |
| 3 | `src/lib/types.ts` | MODIFY | 2 min |
| 4 | `src/components/image-upload.tsx` | CREATE | 1.5 hr |
| 5 | `src/components/share-profile-button.tsx` | CREATE | 30 min |
| 6 | `src/components/contact-seller-button.tsx` | CREATE | 20 min |
| 7 | `src/components/activity-indicator.tsx` | CREATE | 15 min |
| 8 | `src/components/seller-profile-header.tsx` | MODIFY | 30 min |
| 9 | `src/app/sellers/[username]/page.tsx` | MODIFY | 45 min |
| 10 | `src/app/dashboard/profile/page.tsx` | MODIFY | 2 hr |
| 11 | `src/app/dashboard/layout.tsx` | MODIFY | 2 min |

**Total: ~6 hours**

## Build Order (Dependencies)

1. **Phase 1 — DB + Storage** (run SQL manually in Supabase dashboard)
   - `add_last_active_at.sql`
   - `setup_storage_bucket.sql`

2. **Phase 2 — Types + New Components** (no dependencies between them)
   - `src/lib/types.ts`
   - `src/components/image-upload.tsx`
   - `src/components/share-profile-button.tsx`
   - `src/components/contact-seller-button.tsx`
   - `src/components/activity-indicator.tsx`

3. **Phase 3 — Wire into pages** (depends on Phase 2)
   - `src/components/seller-profile-header.tsx`
   - `src/app/sellers/[username]/page.tsx`
   - `src/app/dashboard/profile/page.tsx`
   - `src/app/dashboard/layout.tsx`

## Notes for Agent 4

- The `profile-images` bucket must be **public** for avatar/banner URLs to work without auth
- Upload path uses `upsert: true` so re-uploading replaces the old image
- The live preview doesn't need to be pixel-perfect — it's a mini representation to give sellers confidence
- For `generateMetadata`, the supabase query is a separate call (Next.js calls it separately from the page component) — this is fine, Supabase has connection pooling
- `last_active_at` falls back to `created_at` display if null
- The `ContactSellerButton` should return `null` (render nothing) if no contact method is available
- All new components are client components except `ActivityIndicator` which can be a server component (no interactivity)
