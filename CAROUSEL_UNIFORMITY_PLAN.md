# Carousel Uniformity — Implementation Plan

## Changes to make (in order):

### 1. `src/app/page.tsx` — Restructure carousel layout

**Current structure:**
```
<div className="space-y-20 px-4 pt-0 pb-16">
  <div>  ← Contains title + Featured
    <h2>Browse OpenClaw Upgrades</h2>
    <FeaturedSection />
  </div>
  <div className="space-y-8">  ← Contains Popular + New
    <section>Popular</section>
    <NewListingsSnippet />
  </div>
  ...categories, how-it-works, etc
</div>
```

**New structure:**
```
<div className="space-y-20 px-4 pt-0 pb-16">
  <div>
    <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-10">
      Browse OpenClaw Upgrades
    </h2>
    <div className="space-y-12">
      <FeaturedSection />
      <section>Popular (add 🔥 emoji)</section>
      <NewListingsSnippet />
    </div>
  </div>
  ...categories, how-it-works, etc
</div>
```

Key changes:
- Remove `mt-[-10px]` hack from h2, use `mb-10`
- All 3 carousels in one `space-y-12` container (48px uniform gap)
- Add `🔥` emoji to Popular heading: `🔥 Popular`

### 2. `src/components/featured-section.tsx` — Add explicit borderColor

Change:
```tsx
<TemplateCard key={t.id} template={...} isFeatured />
```
To:
```tsx
<TemplateCard key={t.id} template={...} isFeatured borderColor="amber" />
```

### 3. `src/components/template-card.tsx` — Fix dark mode amber ring + neutral hover glow

Change amber dark ring:
```
dark:ring-amber-700  →  dark:ring-amber-500
```

Change hover glow to neutral:
```
hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] dark:hover:shadow-[0_0_25px_rgba(239,68,68,0.18)]
```
→
```
hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.07)]
```

### 4. Build & Deploy

```bash
cd molt-mart
npm run build  # fix any errors
git add -A
git commit -m "fix: carousel uniformity and visual polish"
git push origin main
```
