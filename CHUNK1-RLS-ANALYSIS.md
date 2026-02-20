# CHUNK 1: RLS Upload Error — Root Cause Analysis

## Summary

The "new row violates row level security policy" error occurs during template upload/draft save. After thorough investigation, there are **two root causes** and one additional issue.

---

## Database Findings

### RLS Policies on `templates`
| Policy | Command | WITH CHECK |
|--------|---------|------------|
| templates_insert | INSERT | `auth.uid() = seller_id` |
| templates_update | UPDATE | (uses USING: `auth.uid() = seller_id`) |
| templates_select | SELECT | — |
| templates_delete | DELETE | — |

All policies are PERMISSIVE, apply to PUBLIC (all roles). RLS is enabled, `relforcerowsecurity` is false.

### CHECK Constraints (already fixed)
- `templates_status_check`: allows `draft, published, archived, pending_review, flagged, deleted` ✅
- `templates_difficulty_check`: allows `beginner, intermediate, advanced` ✅

### Trigger
- `trigger_seller_last_active` — AFTER INSERT OR UPDATE, runs `update_seller_last_active()`
- Function: `UPDATE profiles SET last_active_at = now() WHERE id = NEW.seller_id`
- **SECURITY INVOKER** (not DEFINER), owned by postgres

---

## ROOT CAUSE #1: Trigger Function is SECURITY INVOKER

The trigger `update_seller_last_active` runs as SECURITY INVOKER, meaning it executes under the **authenticated user's role**, subject to RLS on the `profiles` table.

The `profiles` UPDATE policy USING clause is `auth.uid() = id`. In theory this should pass since `NEW.seller_id = auth.uid()`. However, **if for any reason `auth.uid()` is null or doesn't match at trigger execution time** (e.g., edge cases with PostgREST connection pooling, JWT timing), the profiles UPDATE fails, which cascades the error back to the templates INSERT.

**Fix:** Make the trigger function `SECURITY DEFINER`:
```sql
ALTER FUNCTION update_seller_last_active() SECURITY DEFINER;
```

## ROOT CAUSE #2: Upload Route Uses Regular Client Instead of Admin Client

The upload route (`src/app/api/templates/upload/route.ts`) authenticates the user, validates seller status, performs server-side scanning and review logic, then **inserts into the templates table using the regular Supabase client** (anon key + user JWT via cookies).

```js
// Line ~108: Uses regular client for INSERT
const { data: template, error: insertError } = await supabase
  .from("templates")
  .insert({...})
```

This is a **trusted server-side operation** — the user's identity and permissions are already verified. The server also sets fields the user didn't provide (`effectiveStatus`, `scan_status`, `requires_review`, etc.). Using the regular client subjects this to RLS unnecessarily.

The admin client is already created and used for the review queue check but NOT for the insert.

**Fix:** Use the admin client for the templates INSERT:
```js
const adminForInsert = createAdminClient()
const client = adminForInsert || supabase // fallback to regular if no service key

const { data: template, error: insertError } = await client
  .from("templates")
  .insert({...})
  .select()
  .single()
```

## ADDITIONAL ISSUE: Missing Storage UPDATE Policy

The storage upload uses `upsert: true`:
```js
await supabase.storage.from("templates").upload(filePath, buffer, { upsert: true })
```

There is **no UPDATE policy** on the `templates` storage bucket. If a seller re-uploads with the same slug, the upsert requires an UPDATE policy and will fail with an RLS error.

**Fix:** Add storage UPDATE policy:
```sql
CREATE POLICY templates_storage_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY screenshots_storage_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## BONUS: Missing Columns

The code inserts `changelog` and `faq` fields, but these columns **do not exist** on the `templates` table. PostgREST silently ignores them, but they should either be added as columns or removed from the insert. The PATCH route also allows updating these non-existent fields.

---

## Recommended Fix (Priority Order)

1. **Use admin client for templates INSERT** in upload route — immediate fix, bypasses RLS entirely for trusted server operation
2. **ALTER FUNCTION `update_seller_last_active()` SECURITY DEFINER** — prevents trigger from failing due to RLS
3. **Add storage UPDATE policies** for templates and screenshots buckets
4. **Add `changelog` and `faq` columns** to templates table (or remove from code)

The same pattern (use admin client) should be applied to the PATCH route in `src/app/api/templates/[id]/route.ts` as well, since the UPDATE trigger has the same SECURITY INVOKER issue.
