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
import { CATEGORIES, DIFFICULTIES, AI_MODELS, LICENSES, MAX_SCREENSHOTS, MAX_SCREENSHOT_SIZE, MAX_UPLOAD_SIZE } from "@/lib/constants"
import { Loader2, Trash2, X, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import type { Template } from "@/lib/types"

export function EditTemplateForm({ template }: { template: Template }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState(template.title)
  const [description, setDescription] = useState(template.description)
  const [category, setCategory] = useState(template.category)
  const [tags, setTags] = useState(template.tags?.join(", ") || "")
  const [longDescription, setLongDescription] = useState(template.long_description || "")
  const [difficulty, setDifficulty] = useState(template.difficulty || "beginner")
  const [selectedModels, setSelectedModels] = useState<string[]>(template.ai_models || [])
  const [requirements, setRequirements] = useState(template.requirements || "")
  const [setupInstructions, setSetupInstructions] = useState(template.setup_instructions || "")
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(template.screenshots || [])
  const [newScreenshots, setNewScreenshots] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [demoVideoUrl, setDemoVideoUrl] = useState(template.demo_video_url || "")
  const screenshotInputRef = useRef<HTMLInputElement>(null)
  const [pricingType, setPricingType] = useState<"free" | "paid">(template.price_cents > 0 ? "paid" : "free")
  const [priceUsd, setPriceUsd] = useState(template.price_cents > 0 ? (template.price_cents / 100).toFixed(2) : "")
  const [version, setVersion] = useState(template.version || "1.0.0")
  const [license, setLicense] = useState(template.license || "MIT")
  const [newFile, setNewFile] = useState<File | null>(null)

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
    if (pricingType === "paid" && (!priceUsd || isNaN(parseFloat(priceUsd)) || parseFloat(priceUsd) < 1)) {
      toast.error("Minimum price is $1.00"); return
    }
    if (newFile && !newFile.name.endsWith(".zip")) { toast.error("Only .zip files allowed"); return }
    if (newFile && newFile.size > MAX_UPLOAD_SIZE) { toast.error("File must be under 10MB"); return }

    setLoading(true)
    try {
      const priceCents = pricingType === "paid" ? Math.round(parseFloat(priceUsd) * 100) : 0
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)

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

      // Upload replacement file if provided
      let fileUpdateFields: Record<string, unknown> = {}
      if (newFile) {
        const fd = new FormData()
        fd.append("file", newFile)
        fd.append("templateId", template.id)
        const fileRes = await fetch("/api/templates/replace-file", { method: "POST", body: fd })
        if (!fileRes.ok) {
          const fileData = await fileRes.json()
          toast.error(fileData.error || "File replacement failed")
          return
        }
        const fileData = await fileRes.json()
        fileUpdateFields = { file_path: fileData.file_path, preview_data: fileData.preview_data }
      }

      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fileUpdateFields,
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
      toast.success("Enhancement updated!")
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
      toast.success("Enhancement deleted")
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
      <CardHeader><CardTitle>Edit Enhancement</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Slug (read-only)</Label>
            <Input value={template.slug} disabled className="bg-muted" />
          </div>

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

          <details>
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

          <details>
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

          <details>
            <summary className="cursor-pointer text-lg font-semibold mb-3">4. Pricing & Version</summary>
            <div className="space-y-4 pl-1">
              <div>
                <Label htmlFor="newFile">Replace Template File (.zip, max 10MB)</Label>
                <Input id="newFile" type="file" accept=".zip" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground mt-1">
                  Current file: {template.file_path.split("/").pop()}
                  {newFile && <span className="text-primary ml-2">→ {newFile.name}</span>}
                </p>
              </div>
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
