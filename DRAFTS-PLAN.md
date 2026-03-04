# My Products Page — Drafts & Status Filter Revision

## Overview
Replace the `<Select>` dropdown status filter with pill/toggle buttons (matching the library page style), add draft counts, and enhance draft product UX with a "Publish" action.

## File to modify
`src/app/dashboard/seller/products/page.tsx`

---

## Change 1: Fetch ALL products for counts, filter client-side

**Why:** We need counts for each status to display on pills. Currently the API is called with a status filter, so we only get filtered results. We need all products to compute counts.

**Replace** the `fetchProducts` function and add derived state:

```tsx
// Change: always fetch ALL products (no status param), filter client-side
const fetchProducts = useCallback(async () => {
  setLoading(true)
  try {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    params.set("sort", sort)
    const res = await fetch(`/api/seller/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products)
    }
  } catch {
    toast.error("Failed to load products")
  } finally {
    setLoading(false)
  }
}, [search, sort])  // removed statusFilter dependency

// Add after fetchProducts:
const filteredProducts = statusFilter === "all"
  ? products.filter(p => p.status !== "deleted")
  : products.filter(p => p.status === statusFilter)

const draftCount = products.filter(p => p.status === "draft").length
const publishedCount = products.filter(p => p.status === "published").length
const archivedCount = products.filter(p => p.status === "archived").length
```

Then use `filteredProducts` instead of `products` in the rendering (the `.map()` calls).

---

## Change 2: Replace `<Select>` dropdown with pill buttons

**Remove** this block:
```tsx
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="published">Published</SelectItem>
    <SelectItem value="draft">Draft</SelectItem>
    <SelectItem value="archived">Archived</SelectItem>
  </SelectContent>
</Select>
```

**Replace with:**
```tsx
<div className="flex items-center border rounded-md">
  <Button
    variant={statusFilter === "all" ? "default" : "ghost"}
    size="sm"
    className="h-8 px-3 rounded-r-none text-xs whitespace-nowrap"
    onClick={() => setStatusFilter("all")}
  >
    All ({products.filter(p => p.status !== "deleted").length})
  </Button>
  <Button
    variant={statusFilter === "published" ? "default" : "ghost"}
    size="sm"
    className="h-8 px-3 rounded-none border-x text-xs whitespace-nowrap"
    onClick={() => setStatusFilter("published")}
  >
    Published ({publishedCount})
  </Button>
  <Button
    variant={statusFilter === "draft" ? "default" : "ghost"}
    size="sm"
    className="h-8 px-3 rounded-none border-r text-xs whitespace-nowrap"
    onClick={() => setStatusFilter("draft")}
  >
    Drafts ({draftCount})
  </Button>
  <Button
    variant={statusFilter === "archived" ? "default" : "ghost"}
    size="sm"
    className="h-8 px-3 rounded-l-none text-xs whitespace-nowrap"
    onClick={() => setStatusFilter("archived")}
  >
    Archived ({archivedCount})
  </Button>
</div>
```

Also remove `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from imports (check if sort still uses Select — it does, so keep the import).

---

## Change 3: Add "Publish" action for draft products + visual draft indicator

### 3a. Add `handlePublish` function (after `handleArchiveToggle`):

```tsx
async function handlePublish(product: Product) {
  try {
    const res = await fetch(`/api/templates/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    })
    if (res.ok) {
      toast.success("Product published!")
      fetchProducts()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to publish")
    }
  } catch {
    toast.error("Something went wrong")
  }
}
```

### 3b. Add draft banner in LIST view (similar to the archived banner)

After the archived banner block in the list view, add:
```tsx
{product.status === "draft" && (
  <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-1.5 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Pencil className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      <span className="text-xs text-blue-700 dark:text-blue-400">This product is a draft and not visible to buyers</span>
    </div>
    <Button
      variant="outline"
      size="sm"
      className="h-6 text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
      onClick={() => handlePublish(product)}
    >
      Publish
    </Button>
  </div>
)}
```

### 3c. Add opacity for drafts (like archived)

Change the card className in list view:
```tsx
className={`overflow-hidden ${product.status === "archived" ? "opacity-70" : ""}`}
```
to:
```tsx
className={`overflow-hidden ${product.status === "archived" || product.status === "draft" ? "opacity-80" : ""}`}
```

### 3d. Add "Publish" to the dropdown menu for drafts

In the `<DropdownMenuContent>`, after Duplicate and before the separator, add:
```tsx
{product.status === "draft" && (
  <DropdownMenuItem onClick={() => handlePublish(product)}>
    <ArchiveRestore className="mr-2 h-4 w-4" /> Publish
  </DropdownMenuItem>
)}
```

### 3e. Card view — add draft indicator + publish button

After the archived card-view block, add similar draft indicator:
```tsx
{product.status === "draft" && (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-1 text-[10px] text-blue-700 dark:text-blue-400">
      <Pencil className="h-3 w-3" />
      Draft
    </div>
    <Button
      variant="outline"
      size="sm"
      className="h-5 text-[10px] px-1.5 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
      onClick={() => handlePublish(product)}
    >
      Publish
    </Button>
  </div>
)}
```

---

## Change 4: Layout — move pills into the filter bar

Move the pill buttons into the same row as search + sort for a cleaner layout. The final filter bar structure:

```
[List|Card] [Search..._______________] [All|Published|Drafts|Archived] [Sort ▾]
```

Merge the two `flex` rows into one. Put view toggle, search, pills, and sort all in one `<div className="flex flex-col sm:flex-row gap-3">`.

---

## Edge Cases

1. **`pending_review` / `flagged` statuses:** These aren't shown in the pills. Products with these statuses will only appear under "All". This is fine — they're rare admin-triggered states. The existing `statusBadge` function already handles them with a generic outline badge.

2. **Deleted products:** The API likely excludes `status=deleted`, but the client-side "All" filter explicitly excludes them: `products.filter(p => p.status !== "deleted")`.

3. **Empty draft state:** When "Drafts" is selected and there are 0 drafts, the existing empty state ("No products match your filters") handles it. No changes needed.

4. **List/card view toggle:** Both views get the draft banner/indicator. No interaction issues.

5. **Search + filter combo:** Search is API-side, status filter is now client-side. They compose naturally.

---

## Import Changes

Add `Send` (or use existing `ArchiveRestore`) icon for Publish button. Actually `ArchiveRestore` works fine semantically. No new imports needed.

## Summary of touches

| What | Action |
|------|--------|
| `fetchProducts` | Remove status param from API call |
| New derived state | `filteredProducts`, `draftCount`, `publishedCount`, `archivedCount` |
| Status `<Select>` | Replace with pill `<Button>` group |
| New function | `handlePublish(product)` |
| List view | Add draft banner with Publish button |
| Card view | Add draft indicator with Publish button |
| Dropdown menu | Add "Publish" option for drafts |
| Card classNames | Add draft opacity |
| Render `.map()` | Use `filteredProducts` instead of `products` |
