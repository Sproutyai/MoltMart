"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CATEGORIES } from "@/lib/constants"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Template } from "@/lib/types"

export function EditTemplateForm({ template }: { template: Template }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState(template.title)
  const [description, setDescription] = useState(template.description)
  const [longDescription, setLongDescription] = useState(template.long_description || "")
  const [category, setCategory] = useState(template.category)
  const [tags, setTags] = useState(template.tags?.join(", ") || "")
  const [pricingType, setPricingType] = useState<"free" | "paid">(template.price_cents > 0 ? "paid" : "free")
  const [priceUsd, setPriceUsd] = useState(template.price_cents > 0 ? (template.price_cents / 100).toFixed(2) : "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !description || !category) { toast.error("Fill in all required fields"); return }

    setLoading(true)
    try {
      const priceCents = pricingType === "paid" ? Math.round(parseFloat(priceUsd) * 100) : 0
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)

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

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Edit Template</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Slug (read-only)</Label>
            <Input value={template.slug} disabled className="bg-muted" />
          </div>
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Short Description *</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="longDescription">Long Description</Label>
            <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={5} />
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
