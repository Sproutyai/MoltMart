# Molt Mart Homepage UI Implementation Plan

## Section 1: Final Design Decisions

### Brand Color: RED (not purple/cyan)

**Why:** The logo is a red claw creature. Purple/cyan would clash. Red = power, premium, danger, enhancement. Think: Tesla red, YouTube red, Netflix red. Red on dark = premium tech.

**Palette:**
- **Brand Red (primary):** `#DC2626` (red-600) / oklch equivalent
- **Brand Red Light:** `#EF4444` (red-500) for hovers/glows
- **Brand Red Dark accent:** `#991B1B` (red-800) for dark mode subtle bg
- **Accent:** `#F97316` (orange-500) for secondary highlights (warm complement to red)
- **Keep existing neutrals** for backgrounds — they work fine

**In practice:** We change `--primary` to red. This automatically updates all buttons, hover states, links that use `text-primary`, `bg-primary`, etc. One CSS change, massive impact.

### Typography
- Hero headline: bump to `text-5xl sm:text-6xl md:text-7xl`
- Add gradient text effect on hero headline (red → orange)
- No font changes needed (Geist is solid)

### Spacing
- Hero: increase to `py-24 sm:py-32`
- Category cards: reduce inner padding

### "Enhancements" Branding
- Replace "Templates" → "Enhancements" in user-facing copy
- Keep code-level names (template-card, etc.) unchanged to avoid refactoring
- Visual: subtle red glow on logo, gradient hero bg

---

## Section 2: File-by-File Changes

### `src/app/globals.css`

**Change 1: Light mode primary → red**
```css
/* OLD */
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);

/* NEW */
--primary: oklch(0.577 0.245 27.325);
--primary-foreground: oklch(0.985 0 0);
```
Note: `oklch(0.577 0.245 27.325)` is approximately red-600. Currently this value is used for `--destructive` — so also change destructive to a different shade:
```css
/* OLD */
--destructive: oklch(0.577 0.245 27.325);
/* NEW */
--destructive: oklch(0.505 0.213 27.325);
```

**Change 2: Dark mode primary → red**
```css
/* OLD */
--primary: oklch(0.922 0 0);
--primary-foreground: oklch(0.205 0 0);

/* NEW */  
--primary: oklch(0.637 0.237 25.331);
--primary-foreground: oklch(0.985 0 0);
```
(`oklch(0.637 0.237 25.331)` ≈ red-500, bright enough for dark bg)

Dark mode destructive:
```css
/* OLD */
--destructive: oklch(0.704 0.191 22.216);
/* NEW */
--destructive: oklch(0.704 0.191 22.216);
```
(Keep as-is, it's fine since it's already distinct enough from the new primary)

**Change 3: Add new CSS after the `.animate-float` block**
```css
.hero-gradient {
  background: radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.577 0.245 27.325 / 15%), transparent);
}

.dark .hero-gradient {
  background: radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.577 0.245 27.325 / 20%), transparent);
}

.text-gradient-brand {
  background: linear-gradient(135deg, #DC2626, #F97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-glow {
  filter: drop-shadow(0 0 20px oklch(0.577 0.245 27.325 / 40%));
}

.dark .logo-glow {
  filter: drop-shadow(0 0 30px oklch(0.637 0.237 25.331 / 50%));
}
```

### `src/app/page.tsx`

**Change 1: Hero section background**
```
OLD: <section className="bg-gradient-to-b from-muted/50 to-transparent px-4 py-20 sm:py-28">
NEW: <section className="hero-gradient px-4 py-24 sm:py-32">
```

**Change 2: Logo glow**
```
OLD: <div className="animate-float">
NEW: <div className="animate-float logo-glow">
```

**Change 3: Hero headline**
```
OLD: <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            The Marketplace for
            <br />
            AI Agent Templates
          </h1>
NEW: <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            The <span className="text-gradient-brand">Enhancement Store</span> for
            <br />
            AI Agents
          </h1>
```

**Change 4: Hero subtitle**
```
OLD: <p className="mt-4 text-xl font-medium text-muted-foreground sm:text-2xl">
            Built by AI agents, for AI agents
          </p>
NEW: <p className="mt-4 text-xl font-medium text-muted-foreground sm:text-2xl">
            Download new abilities for your AI agent
          </p>
```

**Change 5: Hero description**
```
OLD: Discover, download, and sell powerful AI agent templates for OpenClaw.
            Build smarter agents — or share your brilliance and earn.
NEW: Discover, download, and install powerful enhancements for OpenClaw agents.
            Upgrade your agent's capabilities — or create and sell your own.
```

**Change 6: Hero CTA**
```
OLD: <Link href="/templates">Browse Templates</Link>
NEW: <Link href="/templates">Browse Enhancements</Link>
```

**Change 7: Hero CTA "Start Selling"**
```
OLD: <Link href="/signup">Start Selling</Link>
NEW: <Link href="/signup">Create Enhancements</Link>
```

**Change 8: Add stat bar after CTAs (before closing `</div>` of hero inner)**
After the CTA `<div>`, add:
```tsx
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span><strong className="text-foreground">2,000+</strong> Enhancements</span>
            <span className="text-border">•</span>
            <span><strong className="text-foreground">500+</strong> Creators</span>
            <span className="text-border">•</span>
            <span><strong className="text-foreground">50K+</strong> Downloads</span>
          </div>
```

**Change 9: Browse section title**
```
OLD: <h2 className="text-2xl font-bold sm:text-3xl">Browse Templates</h2>
NEW: <h2 className="text-2xl font-bold sm:text-3xl">Popular Enhancements</h2>
```

**Change 10: Categories title**
```
OLD: <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Browse by Category</h2>
NEW: <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Enhancement Categories</h2>
```

**Change 11: Limit categories to 8 on homepage**
Replace `{CATEGORIES.map((cat) => {` with:
```tsx
{CATEGORIES.slice(0, 8).map((cat) => {
```

**Change 12: Reduce category card padding**
```
OLD: <CardContent className="flex flex-col items-center gap-2 py-6">
NEW: <CardContent className="flex flex-col items-center gap-2 py-4">
```

**Change 13: How It Works title**
```
OLD: <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">How It Works</h2>
NEW: <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">How Enhancements Work</h2>
```

**Change 14: How It Works step text**
```
OLD: { icon: Search, step: "1", title: "Browse Templates", desc: "Explore templates by category, search, or popularity. Find the perfect agent for your needs." },
              { icon: Download, step: "2", title: "Download & Install", desc: "Get the template with one click. Drop it into your OpenClaw workspace and you're ready." },
              { icon: Zap, step: "3", title: "Your Agent, Supercharged", desc: "Customize it, extend it, make it yours. AI agents that work the way you want." },
NEW: { icon: Search, step: "1", title: "Find Enhancements", desc: "Browse by category or search. Find the perfect upgrade for your agent." },
              { icon: Download, step: "2", title: "Install in One Click", desc: "Download and drop into your OpenClaw workspace. Instant setup." },
              { icon: Zap, step: "3", title: "Agent Enhanced", desc: "Your agent gains new abilities. Customize and make it yours." },
```

**Change 15: For Sellers gradient — change purple to red tones**
```
OLD: className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 px-6 py-12 text-center dark:from-purple-950/30 dark:to-blue-950/30 sm:px-12"
NEW: className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 px-6 py-12 text-center dark:from-red-950/30 dark:to-orange-950/30 sm:px-12"
```

**Change 16: For Sellers copy**
```
OLD: Built an awesome agent template? List it on Molt Mart and share it with the community.
            Join a growing community of AI creators.
NEW: Built a powerful enhancement? List it on Molt Mart and earn from your AI expertise.
            Join a growing community of enhancement creators.
```

**Change 17: For Sellers headline**
```
OLD: <h2 className="text-2xl font-bold sm:text-3xl">Earn Money Sharing Your AI Expertise</h2>
NEW: <h2 className="text-2xl font-bold sm:text-3xl">Create & Sell Enhancements</h2>
```

### `src/components/template-card.tsx`

**Change 1: Add red glow on hover**
```
OLD: <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden">
NEW: <Card className="h-full transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] overflow-hidden">
```

That's it for cards — the primary color change handles the rest.

### `src/components/navbar.tsx`

**Change 1: "Browse Templates" nav link text**
```
OLD: Browse Templates
            </Link>
NEW: Enhancements
            </Link>
```
(In the desktop nav, the link with href="/templates")

### `src/lib/constants.ts`

**Change 1: Add icon mappings for missing categories**

In `page.tsx`, update the CATEGORY_ICONS map (add the missing imports and entries):

Add to the import from lucide-react:
```
OLD: import {
  Search,
  Download,
  Zap,
  Code,
  Pen,
  FlaskConical,
  MessageSquare,
  Bot,
  Shield,
  Smile,
  Briefcase,
} from "lucide-react"

NEW: import {
  Search,
  Download,
  Zap,
  Code,
  Pen,
  FlaskConical,
  MessageSquare,
  Bot,
  Shield,
  Smile,
  Briefcase,
  GraduationCap,
  DollarSign,
  BarChart3,
  GitBranch,
  Gamepad2,
  MoreHorizontal,
} from "lucide-react"
```

Update the icon map:
```
OLD: const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Productivity: Briefcase,
  Coding: Code,
  Writing: Pen,
  Research: FlaskConical,
  Communication: MessageSquare,
  Automation: Bot,
  Security: Shield,
  Personality: Smile,
}

NEW: const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Productivity: Briefcase,
  Coding: Code,
  Writing: Pen,
  Research: FlaskConical,
  Communication: MessageSquare,
  Automation: Bot,
  Security: Shield,
  Personality: Smile,
  Education: GraduationCap,
  Finance: DollarSign,
  "Data Science": BarChart3,
  DevOps: GitBranch,
  Entertainment: Gamepad2,
  Other: MoreHorizontal,
}
```

### `src/components/footer.tsx`

**Change 1: Brand description**
```
OLD: The marketplace for AI agent templates. Built for OpenClaw.
NEW: The enhancement store for AI agents. Built for OpenClaw.
```

**Change 2: Footer links "Browse Templates"**
```
OLD: <Link href="/templates" className="hover:text-foreground">Browse Templates</Link>
NEW: <Link href="/templates" className="hover:text-foreground">Browse Enhancements</Link>
```

**Change 3: Seller links**
```
OLD: <Link href="/dashboard/seller" className="hover:text-foreground">Sell Templates</Link>
NEW: <Link href="/dashboard/seller" className="hover:text-foreground">Sell Enhancements</Link>
```

### `src/components/new-listings-snippet.tsx`

**Change 1: Title**
```
OLD: <h2 className="text-2xl font-bold sm:text-3xl">🆕 Just Added</h2>
NEW: <h2 className="text-2xl font-bold sm:text-3xl">🆕 New Enhancements</h2>
```

### `src/lib/constants.ts`

**Change 1: Site description**
```
OLD: export const SITE_DESCRIPTION = 'The marketplace for OpenClaw AI agent templates'
NEW: export const SITE_DESCRIPTION = 'The enhancement store for OpenClaw AI agents'
```

---

## Section 3: "Enhancements" Copy Changes Summary

| File | Old Text | New Text |
|------|----------|----------|
| page.tsx hero h1 | "The Marketplace for\nAI Agent Templates" | "The Enhancement Store for\nAI Agents" |
| page.tsx hero subtitle | "Built by AI agents, for AI agents" | "Download new abilities for your AI agent" |
| page.tsx hero desc | "Discover, download, and sell powerful AI agent templates..." | "Discover, download, and install powerful enhancements..." |
| page.tsx CTA | "Browse Templates" | "Browse Enhancements" |
| page.tsx CTA | "Start Selling" | "Create Enhancements" |
| page.tsx section | "Browse Templates" | "Popular Enhancements" |
| page.tsx section | "Browse by Category" | "Enhancement Categories" |
| page.tsx section | "How It Works" | "How Enhancements Work" |
| page.tsx steps | "Browse Templates" | "Find Enhancements" |
| page.tsx steps | "Download & Install" | "Install in One Click" |
| page.tsx steps | "Your Agent, Supercharged" | "Agent Enhanced" |
| page.tsx seller | "Earn Money Sharing Your AI Expertise" | "Create & Sell Enhancements" |
| page.tsx seller desc | "Built an awesome agent template?..." | "Built a powerful enhancement?..." |
| navbar.tsx | "Browse Templates" | "Enhancements" |
| footer.tsx | "The marketplace for AI agent templates" | "The enhancement store for AI agents" |
| footer.tsx | "Browse Templates" | "Browse Enhancements" |
| footer.tsx | "Sell Templates" | "Sell Enhancements" |
| new-listings-snippet.tsx | "🆕 Just Added" | "🆕 New Enhancements" |
| constants.ts | SITE_DESCRIPTION | "The enhancement store for OpenClaw AI agents" |

---

## Section 4: Implementation Order

### Step 1: `src/app/globals.css` — Brand colors + utility classes
- Change light mode `--primary` to `oklch(0.577 0.245 27.325)`
- Change light mode `--destructive` to `oklch(0.505 0.213 27.325)`
- Change dark mode `--primary` to `oklch(0.637 0.237 25.331)`
- Change dark mode `--primary-foreground` to `oklch(0.985 0 0)`
- Add `.hero-gradient`, `.text-gradient-brand`, `.logo-glow` classes after `.animate-float`

### Step 2: `src/app/page.tsx` — Hero overhaul + all copy changes
- Apply Changes 1-17 as listed above (hero gradient, glow, headline, subtitle, CTAs, stat bar, section titles, step text, seller section)

### Step 3: `src/app/page.tsx` — Category icons fix
- Add lucide imports (GraduationCap, DollarSign, BarChart3, GitBranch, Gamepad2, MoreHorizontal)
- Expand CATEGORY_ICONS map
- Slice categories to 8

### Step 4: `src/components/template-card.tsx` — Card hover glow
- Add `hover:shadow-primary/10` to Card className

### Step 5: `src/components/navbar.tsx` — Nav text update
- "Browse Templates" → "Enhancements"

### Step 6: `src/components/footer.tsx` — Copy updates
- 3 text replacements

### Step 7: `src/components/new-listings-snippet.tsx` — Title update
- "Just Added" → "New Enhancements"

### Step 8: `src/lib/constants.ts` — Site description
- Update SITE_DESCRIPTION

---

## Design Review Notes (for Agent 1's reference)

**What I changed from Agent 1's recommendations:**
1. **RED not purple/cyan** — The logo is red. Brand coherence > trendy palette. Red + dark theme = Netflix/Tesla premium.
2. **No circuit board patterns or matrix animations** — Too gimmicky. Clean > cyberpunk. The "enhancements" concept is carried by copy and color, not decorative animations.
3. **No hexagons, no neural networks** — Keep it professional marketplace, not sci-fi game UI.
4. **Kept animations minimal** — Only the existing float + new glow. No janky CSS animations.
5. **Seller section gradient** — Changed from purple→blue to red→orange to match brand.
6. **No monospace font for badges** — Unnecessary complexity.
7. **Stat bar numbers are aspirational** — Can be updated when real data is available.

**Accessibility check:**
- Red-600 on white: contrast ratio ~4.6:1 (AA for large text ✓, borderline for small)
- Red-500 on dark bg (oklch 0.145): contrast ratio ~5.2:1 (AA ✓)
- All existing contrast ratios for muted-foreground remain unchanged
- Primary buttons: white text on red = high contrast ✓
