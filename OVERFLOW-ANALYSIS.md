# Molt Mart — Overflow & Layout Analysis + Fix Plan

## Task 1: Known Broken Issues

### 1.1 Library List View — Buttons Overflow
**File:** `src/components/download-button.tsx`
**Severity:** 🔴 BROKEN NOW
**Issue:** In the library list view, the `DownloadButton` renders `size="lg"` buttons ("Download Again", "How to Install") at full width. The list view column is only `100px` wide (`sm:grid-cols-[48px_1fr_120px_100px_120px_100px_80px_100px]`), so button text overflows.

**Fix:** The download button column needs more width AND buttons need `whitespace-nowrap` + `text-sm` sizing. Two changes needed:

#### Change 1: `src/app/dashboard/library-client.tsx`
Widen the last column and allow the download cell to be flexible:
```diff
- sm:grid-cols-[48px_1fr_120px_100px_120px_100px_80px_100px]
+ sm:grid-cols-[48px_1fr_100px_90px_110px_80px_60px_auto]
```
Also on the rows grid:
```diff
- sm:grid-cols-[48px_1fr_120px_100px_120px_100px_80px_100px]
+ sm:grid-cols-[48px_1fr_100px_90px_110px_80px_60px_auto]
```

#### Change 2: `src/components/download-button.tsx`
Make buttons smaller when used in list context — add `whitespace-nowrap` and use `size="sm"` instead of `size="lg"`:
```diff
  const downloadButton = (
-   <Button onClick={handleDownload} disabled={loading} className="w-full" size="lg">
+   <Button onClick={handleDownload} disabled={loading} className="w-full whitespace-nowrap" size="lg">
```
And for the "How to Install" button:
```diff
-   <Button variant="outline" size="sm" className="w-full" onClick={() => setShowGuide(true)}>
+   <Button variant="outline" size="sm" className="w-full whitespace-nowrap" onClick={() => setShowGuide(true)}>
```

### 1.2 Category Tags Overflowing Containers
**File:** `src/app/dashboard/library-client.tsx` (list view), `src/components/template-card.tsx`
**Severity:** 🔴 BROKEN NOW
**Issue:** In the list view, the category column is `100px` wide. Long category names like "Prompt Engineering" overflow the `<Badge>` without truncation.

**Fix in `library-client.tsx` list view category cell:**
```diff
  <span className="hidden sm:block">
-   <Badge variant="secondary" className="text-xs font-normal">
+   <Badge variant="secondary" className="text-xs font-normal max-w-full truncate">
      {t.category}
    </Badge>
  </span>
```

---

## Task 2: Site-Wide Overflow Audit

### 🔴 HIGH — Broken or likely to break with real data

#### 2.1 Library List View — Grid Column Constraints
**File:** `src/app/dashboard/library-client.tsx`
**Element:** The entire list view grid `sm:grid-cols-[48px_1fr_120px_100px_120px_100px_80px_100px]`
**Issue:** Fixed pixel columns are too narrow for their content. "Seller" at 120px can overflow with display names like "PromptEngineeringMaster". Purchase date "Feb 20, 2026 1:57 PM" is ~150px but column is 120px.
**Fix:** Switch to more flexible grid: `sm:grid-cols-[48px_minmax(0,1fr)_minmax(80px,120px)_minmax(70px,100px)_minmax(90px,130px)_80px_60px_auto]` and add `truncate` to seller/date cells.

#### 2.2 Transaction Table — Template Title / Buyer Name No Truncation
**File:** `src/components/transactions/transaction-table.tsx`
**Elements:** `<td>` for "Enhancement" and "Buyer"
**Issue:** Long template titles or buyer display names will push the table wider on mobile (overflow-x-auto helps but content still unbounded).
**Fix:** Add `max-w-[200px] truncate` to template title and buyer name cells:
```diff
- <td className="px-4 py-3 text-sm">
+ <td className="px-4 py-3 text-sm max-w-[200px] truncate">
    <Link ...>{t.template_title}</Link>
```

#### 2.3 Template Detail Sidebar — AI Models Overflow
**File:** `src/app/templates/[slug]/page.tsx`
**Element:** `{t.ai_models.join(", ")}` in the sidebar
**Issue:** Multiple model names joined could overflow the flex `justify-between` layout. E.g. "Claude 3.5 Sonnet, GPT-4o, Gemini Pro 1.5"
**Fix:** Add `text-right max-w-[60%] truncate` or `line-clamp-1` to the models span.

#### 2.4 Checkout Modal — Long Template Title
**File:** `src/components/checkout-modal.tsx`
**Element:** `<span className="font-medium">{title}</span>` in the purchase summary
**Issue:** Long titles push the price off-screen.
**Fix:** Add `min-w-0 truncate` to title span, `shrink-0` to price:
```diff
- <span className="font-medium">{title}</span>
+ <span className="font-medium min-w-0 truncate">{title}</span>
```

### 🟡 MEDIUM — Potential issues with edge-case data

#### 2.5 Navbar Dropdown — Display Name Overflow
**File:** `src/components/navbar.tsx`
**Element:** `<div className="px-2 py-1.5 text-sm font-medium">{profile.display_name || profile.username}</div>` inside `DropdownMenuContent w-48`
**Issue:** Long display names exceed 192px dropdown width.
**Fix:** Add `truncate` class.

#### 2.6 Seller Profile Header — Very Long Display Name
**File:** `src/components/seller-profile-header.tsx`
**Element:** `<h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>`
**Issue:** Very long names (no spaces) won't wrap and overflow container.
**Fix:** Add `break-all` or `break-words` class.

#### 2.7 Breadcrumb — Long Template Title
**File:** `src/components/breadcrumb.tsx`
**Issue:** The last breadcrumb item (template title) has no truncation.
**Fix:** Add `truncate max-w-[200px]` to the last breadcrumb span.

#### 2.8 Earnings Table — Template Title Column
**File:** `src/components/affiliate/earnings-table.tsx`
**Element:** `<TableCell className="text-sm font-medium">{e.purchase?.template?.title ?? "—"}</TableCell>`
**Issue:** No truncation on template titles.
**Fix:** Add `max-w-[200px] truncate` class.

#### 2.9 Install Guide Dialog — Long Template Name in Code Block
**File:** `src/components/install-guide.tsx`
**Element:** Code blocks containing `templateSlug` and `templateName`
**Issue:** Long slugs/names make code blocks overflow. Already has `whitespace-pre-wrap` on code blocks which helps. Low risk since dialog has max-w.
**Fix:** None needed — `whitespace-pre-wrap` handles it.

#### 2.10 Template Card Default Variant — Title vs Price Row
**File:** `src/components/template-card.tsx`
**Element:** `<div className="flex items-center justify-between gap-1">` containing title + price
**Issue:** Title has `line-clamp-1 min-w-0` which is good. Price has `shrink-0`. ✅ Already handled.

#### 2.11 Review List — Long Usernames
**File:** `src/components/review-list.tsx`
**Element:** `<span className="text-sm font-medium">{review.buyer?.username ?? "Anonymous"}</span>`
**Issue:** Long usernames in flex row with star rating could overflow.
**Fix:** Add `truncate max-w-[150px]` to username span.

#### 2.12 Seller Template Row — Status Badge
**File:** `src/components/seller-template-row.tsx`
**Issue:** Title has `truncate` ✅, but fixed-width columns (w-20, w-16) could clip on mobile.
**Fix:** Low risk since it's inside a card. No change needed.

### 🟢 LOW — Already handled or minimal risk

#### 2.13 Category Filter Badges
**File:** `src/components/category-filter.tsx`
**Issue:** Badges have `shrink-0` and container has `overflow-x-auto` + `flex-wrap`. ✅ OK.

#### 2.14 Seller Search Card
**File:** `src/components/seller-search-card.tsx`
**Issue:** Has `min-w-0` on text container, `truncate` on display name. ✅ OK.

#### 2.15 Template Card Library Variant — Category Badge
**File:** `src/components/template-card.tsx`
**Issue:** Category badge has `shrink min-w-0 truncate`. ✅ OK.

#### 2.16 Template Card Compact Variant
**File:** `src/components/template-card.tsx`
**Issue:** Title has `line-clamp-1 min-w-0 truncate`, category badge has `shrink min-w-0 truncate`. ✅ OK.

---

## Task 3: Free | Paid | All Filter Implementation

### 3A: Library Page — Already Has Filter (convert from dropdown to pills)
**File:** `src/app/dashboard/library-client.tsx`

The library page already has a `priceFilter` state and dropdown `<select>`. Convert it to visible pill buttons.

### 3B: Bookmarks Page — Add Price Filter
**File:** `src/app/dashboard/bookmarks/bookmarks-client.tsx`

Add `priceFilter` state and pill-style toggle buttons, filtering on `t.price_cents`.

---

## Exact Code Changes

See separate implementation files. All changes are applied directly to the codebase.
