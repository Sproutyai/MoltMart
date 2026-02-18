# Molt Mart — Listings Enhancement Dev Plan

> For Agent 3 to execute line-by-line. Generated 2025-02-15.

---

## Section 1: Database Migration

Run this SQL in Supabase SQL editor (Dashboard → SQL Editor → New Query):

```sql
-- 1a: New columns on templates table
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS ai_models text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS version text DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS demo_video_url text,
  ADD COLUMN IF NOT EXISTS setup_instructions text;

-- 1b: Screenshots storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT DO NOTHING;

-- 1c: Storage policies for screenshots
CREATE POLICY "screenshots_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "screenshots_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');
CREATE POLICY "screenshots_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

Also append this SQL to `supabase/schema.sql` after the existing storage section so the schema file stays in sync.

---

## Section 2: Type Updates

**File:** `src/lib/types.ts`

Add these fields to the `Template` interface, after the `compatibility` field:

```typescript
  screenshots: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  ai_models: string[]
  requirements: string | null
  version: string
  license: string
  demo_video_url: string | null
  setup_instructions: string | null
```

The full Template interface should look like (showing only the additions in context):

```typescript
export interface Template {
  // ... existing fields unchanged ...
  compatibility: string
  screenshots: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  ai_models: string[]
  requirements: string | null
  version: string
  license: string
  demo_video_url: string | null
  setup_instructions: string | null
  created_at: string
  updated_at: string
  seller?: Profile
}
```

---

## Section 3: Constants Updates

**File:** `src/lib/constants.ts`

Replace the entire file with:

```typescript
export const CATEGORIES = [
  'Productivity',
  'Coding',
  'Writing',
  'Research',
  'Communication',
  'Automation',
  'Security',
  'Personality',
  'Education',
  'Finance',
  'Data Science',
  'DevOps',
  'Entertainment',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const AI_MODELS = ['Claude', 'GPT-4', 'GPT-4o', 'Gemini', 'Llama', 'Mistral', 'Other'] as const

export const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'Commercial', 'Custom'] as const

export const SITE_NAME = 'Molt Mart'
export const SITE_DESCRIPTION = 'The marketplace for OpenClaw AI agent templates'
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_SCREENSHOTS = 5
export const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024 // 5MB per screenshot
```

---

## Section 4: Install Dependencies

```bash
cd /Users/growthchain/.openclaw/workspace/molt-mart
npm install react-markdown remark-gfm
```

---

## Section 5: Upload Form Rebuild

**File:** `src/components/upload-form.tsx`

Replace the entire file. The new form has 4 collapsible sections using `<details>` elements (no extra deps needed). All sections open by default.

```tsx
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES, DIFFICULTIES, AI_MODELS, LICENSES, MAX_UPLOAD_SIZE, MAX_SCREENSHOTS, MAX_SCREENSHOT_SIZE } from "@/lib/constants"
import { Loader2, X, ImagePlus } from "lucide-react"
import { toast } from "sonner"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function UploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Section 1: Basics
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  // Section 2: Details
  const [longDescription, setLongDescription] = useState("")
  const [difficulty, setDifficulty] = useState<string>("beginner")
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [requirements, setRequirements] = useState("")
  const [setupInstructions, setSetupInstructions] = useState("")
  // Section 3: Media
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [demoVideoUrl, setDemoVideoUrl] = useState("")
  const screenshotInputRef = useRef<HTMLInputElement>(null)
  // Section 4: File & Pricing
  const [file, setFile] = useState<File | null>(null)
  const [pricingType, setPricingType] = useState<"free" | "paid">("free")
  const [priceUsd, setPriceUsd] = useState("")
  const [version, setVersion] = useState("1.0.0")
  const [license, setLicense] = useState("MIT")

  function toggleModel(model: string) {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  function handleScreenshotAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_SCREENSHOTS - screenshots.length
    const toAdd = files.slice(0, remaining)
    for (const f of toAdd) {
      if (f.size > MAX_SCREENSHOT_SIZE) {
        toast.error(`${f.name} is too large (max 5MB)`)
        return
      }
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`)
        return
      }
    }
    setScreenshots((prev) => [...prev, ...toAdd])
    setScreenshotPreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ])
    if (screenshotInputRef.current) screenshotInputRef.current.value = ""
  }

  function removeScreenshot(index: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== index))
    setScreenshotPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { toast.error("Please select a .zip file"); return }
    if (!file.name.endsWith(".zip")) { toast.error("Only .zip files allowed"); return }
    if (file.size > MAX_UPLOAD_SIZE) { toast.error("File must be under 10MB"); return }
    if (!title || !description || !category) { toast.error("Fill in all required fields"); return }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("title", title)
      fd.append("slug", slugify(title))
      fd.append("description", description)
      fd.append("long_description", longDescription)
      fd.append("category", category)
      fd.append("tags", tags)
      fd.append("difficulty", difficulty)
      fd.append("ai_models", JSON.stringify(selectedModels))
      fd.append("requirements", requirements)
      fd.append("setup_instructions", setupInstructions)
      fd.append("demo_video_url", demoVideoUrl)
      fd.append("version", version)
      fd.append("license", license)
      fd.append("file", file)
      const priceCents = pricingType === "paid" ? Math.round(parseFloat(priceUsd) * 100) : 0
      fd.append("price_cents", String(priceCents))

      // Append screenshots
      for (const ss of screenshots) {
        fd.append("screenshots", ss)
      }

      const res = await fetch("/api/templates/upload", { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Upload failed"); return }
      toast.success("Template uploaded!")
      router.push("/dashboard/seller")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const difficultyEmoji: Record<string, string> = { beginner: "🟢", intermediate: "🟡", advanced: "🔴" }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>New Template</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BASICS */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">1. Basic Info</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Agent Template" required />
                {title && <p className="text-xs text-muted-foreground mt-1">Slug: {slugify(title)}</p>}
              </div>
              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief one-line description" required />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="agent, productivity, coding" />
              </div>
            </div>
          </details>

          {/* SECTION 2: DETAILS */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">2. Details</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="longDescription">Long Description (Markdown supported)</Label>
                <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} placeholder="Detailed description with **markdown** support..." />
              </div>
              <div>
                <Label>Setup Difficulty *</Label>
                <div className="flex gap-3 mt-1">
                  {DIFFICULTIES.map((d) => (
                    <label key={d} className={`flex items-center gap-1.5 cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${difficulty === d ? "border-primary bg-primary/10" : "border-border"}`}>
                      <input type="radio" name="difficulty" value={d} checked={difficulty === d} onChange={() => setDifficulty(d)} className="sr-only" />
                      <span>{difficultyEmoji[d]}</span>
                      <span className="capitalize">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>AI Model Compatibility</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AI_MODELS.map((model) => (
                    <label key={model} className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${selectedModels.includes(model) ? "border-primary bg-primary/10" : "border-border"}`}>
                      <input type="checkbox" checked={selectedModels.includes(model)} onChange={() => toggleModel(model)} className="sr-only" />
                      {model}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="requirements">Requirements / Prerequisites</Label>
                <Textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="e.g. OpenRouter API key, Node.js 18+, etc." />
              </div>
              <div>
                <Label htmlFor="setupInstructions">Setup Instructions (Markdown)</Label>
                <Textarea id="setupInstructions" value={setupInstructions} onChange={(e) => setSetupInstructions(e.target.value)} rows={4} placeholder="Step-by-step setup guide..." />
              </div>
            </div>
          </details>

          {/* SECTION 3: MEDIA */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">3. Media</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label>Screenshots (up to {MAX_SCREENSHOTS}, max 5MB each)</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {screenshotPreviews.map((src, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border">
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeScreenshot(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {screenshots.length < MAX_SCREENSHOTS && (
                    <button type="button" onClick={() => screenshotInputRef.current?.click()} className="w-24 h-24 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <ImagePlus size={20} />
                      <span className="text-xs">Add</span>
                    </button>
                  )}
                </div>
                <input ref={screenshotInputRef} type="file" accept="image/*" multiple onChange={handleScreenshotAdd} className="hidden" />
              </div>
              <div>
                <Label htmlFor="demoVideoUrl">Demo Video URL (YouTube or Loom)</Label>
                <Input id="demoVideoUrl" value={demoVideoUrl} onChange={(e) => setDemoVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
          </details>

          {/* SECTION 4: FILE & PRICING */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">4. File & Pricing</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="file">Template File (.zip, max 10MB) *</Label>
                <Input id="file" type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
                </div>
                <div>
                  <Label>License</Label>
                  <Select value={license} onValueChange={setLicense}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LICENSES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Pricing</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pricing" checked={pricingType === "free"} onChange={() => setPricingType("free")} className="accent-primary" />
                    <span className="text-sm">Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pricing" checked={pricingType === "paid"} onChange={() => setPricingType("paid")} className="accent-primary" />
                    <span className="text-sm">Paid</span>
                  </label>
                </div>
                {pricingType === "paid" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">$</span>
                      <Input type="number" min="1.00" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} placeholder="1.00" className="w-32" />
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    {priceUsd && parseFloat(priceUsd) >= 1 && (
                      <p className="text-xs text-muted-foreground">
                        You earn ${(parseFloat(priceUsd) * 0.88).toFixed(2)} (88%) · Molt Mart fee ${(parseFloat(priceUsd) * 0.12).toFixed(2)} (12%)
                      </p>
                    )}
                    <p className="text-xs text-amber-600">Payments coming soon — paid templates will be listed but not purchasable yet</p>
                  </div>
                )}
              </div>
            </div>
          </details>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Template
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## Section 6: Upload API Updates

**File:** `src/app/api/templates/upload/route.ts`

Replace the entire file with:

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("is_seller").eq("id", user.id).single()
  if (!profile?.is_seller) return NextResponse.json({ error: "Not a seller" }, { status: 403 })

  const formData = await request.formData()
  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const longDescription = formData.get("long_description") as string
  const category = formData.get("category") as string
  const tagsRaw = formData.get("tags") as string
  const file = formData.get("file") as File
  const difficulty = (formData.get("difficulty") as string) || "beginner"
  const aiModelsRaw = formData.get("ai_models") as string
  const requirements = formData.get("requirements") as string
  const setupInstructions = formData.get("setup_instructions") as string
  const demoVideoUrl = formData.get("demo_video_url") as string
  const version = (formData.get("version") as string) || "1.0.0"
  const license = (formData.get("license") as string) || "MIT"
  const priceCentsRaw = formData.get("price_cents") as string
  const priceCents = priceCentsRaw ? parseInt(priceCentsRaw, 10) : 0

  if (!title || !slug || !description || !category || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip files allowed" }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

  // Extract preview data from zip
  const buffer = Buffer.from(await file.arrayBuffer())
  const previewData: { soul_md?: string; agents_md?: string; file_list?: string[] } = {}

  try {
    const zip = await JSZip.loadAsync(buffer)
    const fileList = Object.keys(zip.files).filter((f) => !zip.files[f].dir)
    previewData.file_list = fileList.slice(0, 50)

    for (const name of fileList) {
      const lower = name.toLowerCase()
      if (lower.endsWith("soul.md") && !previewData.soul_md) {
        previewData.soul_md = (await zip.files[name].async("string")).slice(0, 2000)
      }
      if (lower.endsWith("agents.md") && !previewData.agents_md) {
        previewData.agents_md = (await zip.files[name].async("string")).slice(0, 2000)
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid zip file" }, { status: 400 })
  }

  // Upload zip file
  const filePath = `templates/${user.id}/${slug}.zip`
  const { error: uploadError } = await supabase.storage
    .from("templates")
    .upload(filePath, buffer, { contentType: "application/zip", upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 })
  }

  // Upload screenshots
  const screenshotFiles = formData.getAll("screenshots") as File[]
  const screenshotUrls: string[] = []
  for (let i = 0; i < screenshotFiles.length; i++) {
    const ss = screenshotFiles[i]
    if (!ss.size) continue
    const ext = ss.name.split(".").pop() || "png"
    const ssPath = `${user.id}/${slug}-${i}-${Date.now()}.${ext}`
    const ssBuf = Buffer.from(await ss.arrayBuffer())
    const { error: ssError } = await supabase.storage
      .from("screenshots")
      .upload(ssPath, ssBuf, { contentType: ss.type, upsert: true })
    if (!ssError) {
      const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(ssPath)
      screenshotUrls.push(urlData.publicUrl)
    }
  }

  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : []
  const aiModels: string[] = aiModelsRaw ? JSON.parse(aiModelsRaw) : []

  const { data: template, error: insertError } = await supabase
    .from("templates")
    .insert({
      seller_id: user.id,
      title,
      slug,
      description,
      long_description: longDescription || null,
      category,
      tags,
      price_cents: priceCents,
      file_path: filePath,
      preview_data: previewData,
      status: "published",
      compatibility: "openclaw",
      screenshots: screenshotUrls,
      difficulty,
      ai_models: aiModels,
      requirements: requirements || null,
      setup_instructions: setupInstructions || null,
      version,
      license,
      demo_video_url: demoVideoUrl || null,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ template })
}
```

Key changes:
- Parses all new fields from FormData
- **Fixes `price_cents` bug** — now uses `formData.get("price_cents")` instead of hardcoded 0
- Uploads screenshots to `screenshots` storage bucket, stores public URLs in `screenshots` array
- Passes `ai_models` as JSON string from frontend, parses with `JSON.parse`

---

## Section 7: Edit Form Updates

**File:** `src/components/edit-template-form.tsx`

Replace the entire file with:

```tsx
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CATEGORIES, DIFFICULTIES, AI_MODELS, LICENSES, MAX_SCREENSHOTS, MAX_SCREENSHOT_SIZE } from "@/lib/constants"
import { Loader2, Trash2, X, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import type { Template } from "@/lib/types"

export function EditTemplateForm({ template }: { template: Template }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // Basics
  const [title, setTitle] = useState(template.title)
  const [description, setDescription] = useState(template.description)
  const [category, setCategory] = useState(template.category)
  const [tags, setTags] = useState(template.tags?.join(", ") || "")
  // Details
  const [longDescription, setLongDescription] = useState(template.long_description || "")
  const [difficulty, setDifficulty] = useState(template.difficulty || "beginner")
  const [selectedModels, setSelectedModels] = useState<string[]>(template.ai_models || [])
  const [requirements, setRequirements] = useState(template.requirements || "")
  const [setupInstructions, setSetupInstructions] = useState(template.setup_instructions || "")
  // Media
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(template.screenshots || [])
  const [newScreenshots, setNewScreenshots] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [demoVideoUrl, setDemoVideoUrl] = useState(template.demo_video_url || "")
  const screenshotInputRef = useRef<HTMLInputElement>(null)
  // Pricing
  const [pricingType, setPricingType] = useState<"free" | "paid">(template.price_cents > 0 ? "paid" : "free")
  const [priceUsd, setPriceUsd] = useState(template.price_cents > 0 ? (template.price_cents / 100).toFixed(2) : "")
  const [version, setVersion] = useState(template.version || "1.0.0")
  const [license, setLicense] = useState(template.license || "MIT")

  const totalScreenshots = existingScreenshots.length + newScreenshots.length

  function toggleModel(model: string) {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    )
  }

  function handleScreenshotAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_SCREENSHOTS - totalScreenshots
    const toAdd = files.slice(0, remaining)
    for (const f of toAdd) {
      if (f.size > MAX_SCREENSHOT_SIZE) { toast.error(`${f.name} too large (max 5MB)`); return }
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); return }
    }
    setNewScreenshots((prev) => [...prev, ...toAdd])
    setNewPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))])
    if (screenshotInputRef.current) screenshotInputRef.current.value = ""
  }

  function removeExistingScreenshot(index: number) {
    setExistingScreenshots((prev) => prev.filter((_, i) => i !== index))
  }

  function removeNewScreenshot(index: number) {
    setNewScreenshots((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !description || !category) { toast.error("Fill in all required fields"); return }

    setLoading(true)
    try {
      const priceCents = pricingType === "paid" ? Math.round(parseFloat(priceUsd) * 100) : 0
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)

      // Upload new screenshots first
      const uploadedUrls: string[] = []
      for (const ss of newScreenshots) {
        const fd = new FormData()
        fd.append("file", ss)
        fd.append("template_slug", template.slug)
        const res = await fetch("/api/screenshots/upload", { method: "POST", body: fd })
        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
        }
      }

      const allScreenshots = [...existingScreenshots, ...uploadedUrls]

      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          long_description: longDescription,
          category,
          tags: tagList,
          price_cents: priceCents,
          difficulty,
          ai_models: selectedModels,
          requirements: requirements || null,
          setup_instructions: setupInstructions || null,
          screenshots: allScreenshots,
          demo_video_url: demoVideoUrl || null,
          version,
          license,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Update failed")
        return
      }
      toast.success("Template updated!")
      router.push("/dashboard/seller")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/templates/${template.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Delete failed")
        return
      }
      toast.success("Template deleted")
      router.push("/dashboard/seller")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  const difficultyEmoji: Record<string, string> = { beginner: "🟢", intermediate: "🟡", advanced: "🔴" }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Edit Template</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Slug (read-only)</Label>
            <Input value={template.slug} disabled className="bg-muted" />
          </div>

          {/* SECTION 1: BASICS */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">1. Basic Info</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>
          </details>

          {/* SECTION 2: DETAILS */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">2. Details</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="longDescription">Long Description (Markdown)</Label>
                <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} />
              </div>
              <div>
                <Label>Setup Difficulty *</Label>
                <div className="flex gap-3 mt-1">
                  {DIFFICULTIES.map((d) => (
                    <label key={d} className={`flex items-center gap-1.5 cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${difficulty === d ? "border-primary bg-primary/10" : "border-border"}`}>
                      <input type="radio" name="difficulty" value={d} checked={difficulty === d} onChange={() => setDifficulty(d)} className="sr-only" />
                      <span>{difficultyEmoji[d]}</span>
                      <span className="capitalize">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>AI Model Compatibility</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AI_MODELS.map((model) => (
                    <label key={model} className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${selectedModels.includes(model) ? "border-primary bg-primary/10" : "border-border"}`}>
                      <input type="checkbox" checked={selectedModels.includes(model)} onChange={() => toggleModel(model)} className="sr-only" />
                      {model}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} />
              </div>
              <div>
                <Label htmlFor="setupInstructions">Setup Instructions (Markdown)</Label>
                <Textarea id="setupInstructions" value={setupInstructions} onChange={(e) => setSetupInstructions(e.target.value)} rows={4} />
              </div>
            </div>
          </details>

          {/* SECTION 3: MEDIA */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">3. Media</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label>Screenshots (up to {MAX_SCREENSHOTS})</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {existingScreenshots.map((src, i) => (
                    <div key={`existing-${i}`} className="relative w-24 h-24 rounded-md overflow-hidden border">
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingScreenshot(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative w-24 h-24 rounded-md overflow-hidden border border-primary">
                      <img src={src} alt={`New screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewScreenshot(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {totalScreenshots < MAX_SCREENSHOTS && (
                    <button type="button" onClick={() => screenshotInputRef.current?.click()} className="w-24 h-24 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <ImagePlus size={20} />
                      <span className="text-xs">Add</span>
                    </button>
                  )}
                </div>
                <input ref={screenshotInputRef} type="file" accept="image/*" multiple onChange={handleScreenshotAdd} className="hidden" />
              </div>
              <div>
                <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                <Input id="demoVideoUrl" value={demoVideoUrl} onChange={(e) => setDemoVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
          </details>

          {/* SECTION 4: PRICING */}
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">4. Pricing & Version</summary>
            <div className="space-y-4 pl-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} />
                </div>
                <div>
                  <Label>License</Label>
                  <Select value={license} onValueChange={setLicense}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LICENSES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Pricing</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pricing" checked={pricingType === "free"} onChange={() => setPricingType("free")} className="accent-primary" />
                    <span className="text-sm">Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pricing" checked={pricingType === "paid"} onChange={() => setPricingType("paid")} className="accent-primary" />
                    <span className="text-sm">Paid</span>
                  </label>
                </div>
                {pricingType === "paid" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">$</span>
                    <Input type="number" min="1.00" step="0.01" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} placeholder="1.00" className="w-32" />
                    <span className="text-sm text-muted-foreground">USD</span>
                  </div>
                )}
              </div>
            </div>
          </details>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{template.title}&rdquo; and its file. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## Section 8: Screenshot Upload API (NEW FILE)

**File:** `src/app/api/screenshots/upload/route.ts` (create new)

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File
  const templateSlug = formData.get("template_slug") as string

  if (!file || !file.size) {
    return NextResponse.json({ error: "No file" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "png"
  const path = `${user.id}/${templateSlug}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from("screenshots")
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path)
  return NextResponse.json({ url: urlData.publicUrl })
}
```

---

## Section 9: Edit API Updates

**File:** `src/app/api/templates/[id]/route.ts`

In the `PATCH` handler, change the `allowed` array:

**Find this line:**
```typescript
  const allowed = ["title", "description", "long_description", "category", "tags", "price_cents", "status"]
```

**Replace with:**
```typescript
  const allowed = ["title", "description", "long_description", "category", "tags", "price_cents", "status", "difficulty", "ai_models", "requirements", "setup_instructions", "screenshots", "demo_video_url", "version", "license"]
```

That's the ONLY change needed in this file.

---

## Section 10: Template Detail Page Redesign

**File:** `src/app/templates/[slug]/page.tsx`

Replace the entire file with:

```tsx
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/star-rating"
import { TemplatePreview } from "@/components/template-preview"
import { ReviewList } from "@/components/review-list"
import { DownloadButton } from "@/components/download-button"
import { ReviewFormWrapper } from "@/components/review-form-wrapper"
import { SellerLink } from "@/components/seller-link"
import { TemplateCard } from "@/components/template-card"
import { ScreenshotCarousel } from "@/components/screenshot-carousel"
import { MarkdownContent } from "@/components/markdown-content"
import { VideoEmbed } from "@/components/video-embed"
import { Download, Calendar, Shield, BookOpen, Cpu } from "lucide-react"
import type { Template, Review } from "@/lib/types"

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: template } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!template) notFound()

  const t = template as Template & {
    seller: { username: string; display_name: string | null; avatar_url: string | null }
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, buyer:profiles!buyer_id(username, avatar_url)")
    .eq("template_id", t.id)
    .order("created_at", { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  const { data: moreBySeller } = await supabase
    .from("templates")
    .select("*, seller:profiles!seller_id(username, display_name)")
    .eq("seller_id", t.seller_id)
    .eq("status", "published")
    .neq("id", t.id)
    .order("download_count", { ascending: false })
    .limit(3)

  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("template_id", t.id)
      .maybeSingle()
    hasPurchased = !!purchase
  }

  const difficultyConfig: Record<string, { emoji: string; color: string }> = {
    beginner: { emoji: "🟢", color: "text-green-600" },
    intermediate: { emoji: "🟡", color: "text-yellow-600" },
    advanced: { emoji: "🔴", color: "text-red-600" },
  }
  const diff = difficultyConfig[t.difficulty] || difficultyConfig.beginner

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Screenshot Carousel */}
        {t.screenshots && t.screenshots.length > 0 && (
          <ScreenshotCarousel screenshots={t.screenshots} title={t.title} />
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t.category}</Badge>
            {t.tags?.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-bold">{t.title}</h1>
          <div className="mt-1">
            <SellerLink
              username={t.seller.username}
              displayName={t.seller.display_name}
              avatarUrl={t.seller.avatar_url}
              showAvatar
            />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <StarRating value={t.avg_rating} />
            <span className="text-sm text-muted-foreground">
              {t.avg_rating.toFixed(1)} ({t.review_count} reviews)
            </span>
          </div>
        </div>

        <Separator />

        {/* Description — rendered as Markdown */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Description</h2>
          <MarkdownContent content={t.long_description || t.description} />
        </div>

        {/* Requirements */}
        {t.requirements && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                <BookOpen size={20} /> Requirements
              </h2>
              <MarkdownContent content={t.requirements} />
            </div>
          </>
        )}

        {/* Setup Instructions */}
        {t.setup_instructions && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold">Setup Instructions</h2>
              <MarkdownContent content={t.setup_instructions} />
            </div>
          </>
        )}

        {/* Demo Video */}
        {t.demo_video_url && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold">Demo</h2>
              <VideoEmbed url={t.demo_video_url} />
            </div>
          </>
        )}

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Preview</h2>
          <TemplatePreview previewData={t.preview_data} />
        </div>

        <Separator />

        <div>
          <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
          <ReviewList reviews={(reviews as (Review & { buyer: { username: string; avatar_url: string | null } })[]) ?? []} />
          {user && hasPurchased && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">Leave a Review</h3>
              <ReviewFormWrapper templateId={t.id} />
            </div>
          )}
        </div>

        {moreBySeller && moreBySeller.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="mb-4 text-xl font-semibold">More by {t.seller.display_name || t.seller.username}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {(moreBySeller as (Template & { seller: { username: string; display_name: string | null } })[]).map((mt) => (
                  <TemplateCard key={mt.id} template={mt} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right column — Sidebar */}
      <div>
        <div className="sticky top-20 space-y-4 rounded-lg border p-6">
          <div className="text-center">
            {t.price_cents === 0 ? (
              <span className="text-3xl font-bold text-green-600">Free</span>
            ) : (
              <span className="text-3xl font-bold">${(t.price_cents / 100).toFixed(2)}</span>
            )}
          </div>

          <DownloadButton
            templateId={t.id}
            isLoggedIn={!!user}
            hasPurchased={hasPurchased}
          />

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className={`flex items-center gap-1 font-medium capitalize ${diff.color}`}>
                {diff.emoji} {t.difficulty}
              </span>
            </div>
            {t.ai_models && t.ai_models.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Cpu size={14} /> Models</span>
                <span className="text-right">{t.ai_models.join(", ")}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>{t.version || "1.0.0"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Shield size={14} /> License</span>
              <span>{t.license || "MIT"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Downloads</span>
              <span className="flex items-center gap-1">
                <Download size={14} /> {t.download_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(t.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold">Install</h3>
            <code className="block rounded bg-muted p-2 text-xs">
              openclaw template install {t.slug}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Section 11: New Components (3 files)

### 11a: ScreenshotCarousel

**File:** `src/components/screenshot-carousel.tsx` (create new)

```tsx
"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScreenshotCarousel({ screenshots, title }: { screenshots: string[]; title: string }) {
  const [current, setCurrent] = useState(0)

  if (screenshots.length === 0) return null

  return (
    <div className="relative overflow-hidden rounded-lg border bg-muted">
      <div className="aspect-video relative">
        <img
          src={screenshots[current]}
          alt={`${title} screenshot ${current + 1}`}
          className="w-full h-full object-contain"
        />
      </div>
      {screenshots.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full"
            onClick={() => setCurrent((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 rounded-full"
            onClick={() => setCurrent((prev) => (prev + 1) % screenshots.length)}
          >
            <ChevronRight size={20} />
          </Button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

### 11b: MarkdownContent

**File:** `src/components/markdown-content.tsx` (create new)

```tsx
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
```

### 11c: VideoEmbed

**File:** `src/components/video-embed.tsx` (create new)

```tsx
export function VideoEmbed({ url }: { url: string }) {
  // Convert YouTube watch URLs to embed URLs
  let embedUrl = url
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loomMatch) {
    embedUrl = `https://www.loom.com/embed/${loomMatch[1]}`
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden border">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
```

---

## Section 12: Template Card Updates

**File:** `src/components/template-card.tsx`

Add a difficulty badge to the card header. Find this line:

```tsx
            <Badge variant="outline" className="text-xs">{template.category}</Badge>
```

Replace with:

```tsx
            <Badge variant="outline" className="text-xs">{template.category}</Badge>
            {template.difficulty && (
              <Badge variant="outline" className={`text-xs ${template.difficulty === 'beginner' ? 'border-green-500 text-green-600' : template.difficulty === 'intermediate' ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                {template.difficulty === 'beginner' ? '🟢' : template.difficulty === 'intermediate' ? '🟡' : '🔴'} {template.difficulty}
              </Badge>
            )}
```

Also, add a hero screenshot image. Find the `<Card>` opening inside the return:

```tsx
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardHeader className="pb-2">
```

Replace with:

```tsx
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden">
        {template.screenshots && template.screenshots.length > 0 && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img src={template.screenshots[0]} alt={template.title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader className="pb-2">
```

---

## Section 13: Build & Push

```bash
cd /Users/growthchain/.openclaw/workspace/molt-mart

# 1. Install deps
npm install react-markdown remark-gfm

# 2. Build — fix any type errors that come up
npm run build

# 3. If build succeeds, commit and push
git add -A
git commit -m "feat: enhanced listings - screenshots, difficulty, AI models, markdown, video embeds

- Add screenshots upload with carousel display
- Add difficulty level (beginner/intermediate/advanced)
- Add AI model compatibility tags
- Add requirements and setup instructions fields
- Add version and license fields
- Add demo video URL with YouTube/Loom embed
- Render long_description as Markdown
- Fix price_cents bug (was hardcoded to 0)
- Add new categories: Education, Finance, Data Science, DevOps, Entertainment, Other
- Redesign template detail page with sidebar metadata
- Add hero screenshots to template cards"

git push
```

If build errors occur, the most likely issues are:
1. **Missing `difficulty`/`screenshots` etc on Template type** — make sure Section 2 was applied
2. **Import errors for new components** — make sure Section 11 files exist
3. **`react-markdown` types** — if TS complains, add `// @ts-expect-error` above the ReactMarkdown import or install `@types/react-markdown` (though v9+ ships its own types)

---

## Summary of All Files Changed/Created

| Action | File |
|--------|------|
| MODIFY | `src/lib/types.ts` |
| REPLACE | `src/lib/constants.ts` |
| REPLACE | `src/components/upload-form.tsx` |
| REPLACE | `src/components/edit-template-form.tsx` |
| REPLACE | `src/app/api/templates/upload/route.ts` |
| MODIFY | `src/app/api/templates/[id]/route.ts` (one line) |
| REPLACE | `src/app/templates/[slug]/page.tsx` |
| MODIFY | `src/components/template-card.tsx` (two spots) |
| CREATE | `src/app/api/screenshots/upload/route.ts` |
| CREATE | `src/components/screenshot-carousel.tsx` |
| CREATE | `src/components/markdown-content.tsx` |
| CREATE | `src/components/video-embed.tsx` |
| APPEND | `supabase/schema.sql` |
| RUN SQL | Migration in Supabase dashboard |

## Dependencies to Install
```
react-markdown remark-gfm
```
