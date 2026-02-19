"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, DIFFICULTIES, AI_MODELS, LICENSES, MAX_UPLOAD_SIZE, MAX_SCREENSHOTS, MAX_SCREENSHOT_SIZE } from "@/lib/constants"
import { Loader2, X, ImagePlus, Eye, Star, Download, Shield, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { TemplateCard } from "@/components/template-card"
import type { Template } from "@/lib/types"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

interface UploadFormProps {
  seller?: { username: string; display_name: string | null; avatar_url?: string | null; is_verified?: boolean; github_verified?: boolean; twitter_verified?: boolean }
}

export function UploadForm({ seller }: UploadFormProps = {}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [difficulty, setDifficulty] = useState<string>("beginner")
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [requirements, setRequirements] = useState("")
  const [setupInstructions, setSetupInstructions] = useState("")
  const [changelog, setChangelog] = useState("")
  const [faq, setFaq] = useState("")
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [demoVideoUrl, setDemoVideoUrl] = useState("")
  const screenshotInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pricingType, setPricingType] = useState<"free" | "paid">("free")
  const [priceUsd, setPriceUsd] = useState("")
  const [version, setVersion] = useState("1.0.0")
  const [license, setLicense] = useState("MIT")
  const [submitStatus, setSubmitStatus] = useState<"published" | "draft">("published")
  const [otherModel, setOtherModel] = useState("")

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
    const isDraft = submitStatus === "draft"
    if (!isDraft && !file) { toast.error("Please select a .zip file"); return }
    if (file && !file.name.endsWith(".zip")) { toast.error("Only .zip files allowed"); return }
    if (file && file.size > MAX_UPLOAD_SIZE) { toast.error("File must be under 10MB"); return }
    if (!title || !description || !category) { toast.error("Fill in all required fields"); return }
    if (pricingType === "paid" && (!priceUsd || isNaN(parseFloat(priceUsd)) || parseFloat(priceUsd) < 1)) {
      toast.error("Minimum price is $1.00"); return
    }

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
      const models = selectedModels.map(m => m === "Other" && otherModel ? `Other: ${otherModel}` : m)
      fd.append("ai_models", JSON.stringify(models))
      fd.append("requirements", requirements)
      fd.append("setup_instructions", setupInstructions)
      fd.append("demo_video_url", demoVideoUrl)
      fd.append("changelog", changelog)
      fd.append("faq", faq)
      fd.append("version", version)
      fd.append("license", license)
      if (file) fd.append("file", file)
      fd.append("status", submitStatus)
      const priceCents = pricingType === "paid" ? Math.round(parseFloat(priceUsd) * 100) : 0
      fd.append("price_cents", String(priceCents))

      for (const ss of screenshots) {
        fd.append("screenshots", ss)
      }

      const res = await fetch("/api/templates/upload", { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Upload failed"); return }
      if (submitStatus === "draft") {
        toast.success("Draft saved!")
        router.push("/dashboard/seller")
      } else {
        toast.success("Enhancement uploaded!")
        const uploadedSlug = data.template?.slug || slugify(title)
        router.push(`/dashboard/seller/upload/success?slug=${encodeURIComponent(uploadedSlug)}`)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const difficultyEmoji: Record<string, string> = { beginner: "🟢", intermediate: "🟡", advanced: "🔴" }

  const previewTemplate = useMemo(() => ({
    id: "preview",
    seller_id: "",
    title: title || "Your Enhancement Title",
    slug: "preview",
    description: description || "Your enhancement description will appear here...",
    long_description: null,
    category: category || "Skills",
    tags: [],
    price_cents: pricingType === "paid" ? Math.round(parseFloat(priceUsd || "0") * 100) : 0,
    file_path: "",
    preview_data: {},
    download_count: 0,
    avg_rating: 0,
    review_count: 0,
    status: "draft" as const,
    compatibility: "",
    screenshots: screenshotPreviews,
    difficulty: (difficulty || "beginner") as Template["difficulty"],
    ai_models: [],
    requirements: null,
    version: "1.0.0",
    license: "MIT",
    demo_video_url: null,
    setup_instructions: null,
    changelog: null,
    faq: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller,
  }) as any, [title, description, category, pricingType, priceUsd, screenshotPreviews, difficulty, seller])

  return (
    <div className="flex items-start gap-8">
    <Card className="max-w-2xl flex-1 min-w-0">
      <CardHeader><CardTitle>New Enhancement</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <details open>
            <summary className="cursor-pointer text-lg font-semibold mb-3">1. Basic Info</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Agent Enhancement" required />
                {title && <p className="text-xs text-muted-foreground mt-1">Slug: {slugify(title)}</p>}
              </div>
              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief one-line description" required />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full [&>span]:truncate [&>span]:max-w-[calc(100%-20px)] [&>span]:text-left" title={category || undefined}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="whitespace-normal">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="agent, productivity, coding" />
              </div>
            </div>
          </details>

          <details>
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
                {selectedModels.includes("Other") && (
                  <div className="mt-2">
                    <Input
                      value={otherModel}
                      onChange={(e) => setOtherModel(e.target.value)}
                      placeholder="Specify model name (e.g. Qwen, DeepSeek)"
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="requirements">Requirements / Prerequisites</Label>
                <Textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} placeholder="e.g. OpenRouter API key, Node.js 18+, etc." />
              </div>
              <div>
                <Label htmlFor="setupInstructions">Setup Instructions (Markdown)</Label>
                <Textarea id="setupInstructions" value={setupInstructions} onChange={(e) => setSetupInstructions(e.target.value)} rows={4} placeholder="Step-by-step setup guide..." />
              </div>
              <div>
                <Label htmlFor="changelog">Changelog / What&apos;s New (Markdown)</Label>
                <Textarea id="changelog" value={changelog} onChange={(e) => setChangelog(e.target.value)} rows={4} placeholder="## v1.0.0&#10;- Initial release&#10;- Feature X added" />
                <p className="text-xs text-muted-foreground mt-1">Document changes across versions. Visible to buyers.</p>
              </div>
              <div>
                <Label htmlFor="faq">FAQ (Markdown)</Label>
                <Textarea id="faq" value={faq} onChange={(e) => setFaq(e.target.value)} rows={4} placeholder="**Q: How do I install this?**&#10;A: Follow the setup instructions above.&#10;&#10;**Q: Is this compatible with X?**&#10;A: Yes!" />
                <p className="text-xs text-muted-foreground mt-1">Frequently asked questions. Use **Q:** and A: format for best display.</p>
              </div>
            </div>
          </details>

          <details>
            <summary className="cursor-pointer text-lg font-semibold mb-3">3. Media</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label>Screenshots (up to {MAX_SCREENSHOTS})</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Recommended: 1280×720px (16:9 ratio) for best card display. First image will be your listing thumbnail. JPG, PNG, or WebP. Max 5MB each.
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {screenshotPreviews.map((src, i) => (
                    <div key={i} className="relative w-32 aspect-video rounded-md overflow-hidden border">
                      {i === 0 && (
                        <span className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded z-10">Thumbnail</span>
                      )}
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeScreenshot(i)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {screenshots.length < MAX_SCREENSHOTS && (
                    <button type="button" onClick={() => screenshotInputRef.current?.click()} className="w-32 aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <ImagePlus size={20} />
                      <span className="text-xs">Add</span>
                    </button>
                  )}
                </div>
                <input ref={screenshotInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleScreenshotAdd} className="hidden" />
              </div>
              <div>
                <Label htmlFor="demoVideoUrl">Demo Video URL (YouTube or Loom)</Label>
                <Input id="demoVideoUrl" value={demoVideoUrl} onChange={(e) => setDemoVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
          </details>

          <details>
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
                    <p className="text-xs text-amber-600">Payments coming soon — paid enhancements will be listed but not purchasable yet</p>
                  </div>
                )}
              </div>
            </div>
          </details>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1" onClick={() => setSubmitStatus("published")}>
              {loading && submitStatus === "published" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Enhancement
            </Button>
            <Button type="submit" variant="outline" disabled={loading} onClick={() => setSubmitStatus("draft")}>
              {loading && submitStatus === "draft" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    <div className="hidden lg:block w-[224px] flex-shrink-0">
      <div className="sticky top-6 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
        <div className="w-[224px]">
          <TemplateCard template={previewTemplate} isPreview />
        </div>
        <p className="text-xs text-muted-foreground text-center">Actual size as shown on site</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Eye className="mr-2 h-4 w-4" />
              Preview Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Listing Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Hero / Screenshots */}
              {screenshotPreviews.length > 0 && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={screenshotPreviews[0]} alt="Preview" className="w-full max-h-80 object-cover" />
                </div>
              )}

              {/* Title & Meta */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{title || "Your Enhancement Title"}</h2>
                <p className="text-muted-foreground">{description || "Your description will appear here..."}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {category && <Badge variant="secondary">{category}</Badge>}
                  {difficulty && <Badge variant="outline" className="capitalize">{difficultyEmoji[difficulty]} {difficulty}</Badge>}
                  {selectedModels.length > 0 && selectedModels.map(m => (
                    <Badge key={m} variant="outline">{m === "Other" && otherModel ? otherModel : m}</Badge>
                  ))}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                <div className="text-2xl font-bold">
                  {pricingType === "paid" && priceUsd ? `$${parseFloat(priceUsd).toFixed(2)}` : "Free"}
                </div>
                <Button className="ml-auto" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  {pricingType === "paid" ? "Purchase" : "Download"}
                </Button>
              </div>

              {/* Seller Info */}
              {seller && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  {seller.avatar_url && <img src={seller.avatar_url} alt="" className="w-10 h-10 rounded-full" />}
                  <div>
                    <div className="flex items-center gap-1.5 font-medium">
                      {seller.display_name || seller.username}
                      {seller.is_verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">@{seller.username}</p>
                  </div>
                </div>
              )}

              {/* Long Description */}
              {longDescription && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">About</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{longDescription}</div>
                </div>
              )}

              {/* Requirements */}
              {requirements && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Requirements</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{requirements}</div>
                </div>
              )}

              {/* Setup */}
              {setupInstructions && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Setup Instructions</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{setupInstructions}</div>
                </div>
              )}

              {/* Additional screenshots */}
              {screenshotPreviews.length > 1 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Screenshots</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {screenshotPreviews.slice(1).map((src, i) => (
                      <img key={i} src={src} alt={`Screenshot ${i + 2}`} className="rounded-lg border w-full aspect-video object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {/* Meta footer */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>v{version}</span>
                <span>{license}</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> No reviews yet</span>
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> 0 downloads</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </div>
  )
}
