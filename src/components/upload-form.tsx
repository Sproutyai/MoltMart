"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES, MAX_UPLOAD_SIZE } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function UploadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [pricingType, setPricingType] = useState<"free" | "paid">("free")
  const [priceUsd, setPriceUsd] = useState("")

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
      fd.append("file", file)
      const priceCents = pricingType === "paid" ? Math.round(parseFloat(priceUsd) * 100) : 0
      fd.append("price_cents", String(priceCents))

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

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>New Template</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Agent Template" required />
            {title && <p className="text-xs text-muted-foreground mt-1">Slug: {slugify(title)}</p>}
          </div>
          <div>
            <Label htmlFor="description">Short Description *</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description" required />
          </div>
          <div>
            <Label htmlFor="longDescription">Long Description</Label>
            <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={5} placeholder="Detailed description..." />
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
          <div>
            <Label htmlFor="file">Template File (.zip, max 10MB) *</Label>
            <Input id="file" type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Template
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
