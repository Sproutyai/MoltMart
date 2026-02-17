"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  bucket: string
  path: string
  currentUrl: string | null
  onUploaded: (url: string) => void
  aspectRatio?: "square" | "banner"
  className?: string
}

export function ImageUpload({ bucket, path, currentUrl, onUploaded, aspectRatio = "square", className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const maxSize = aspectRatio === "square" ? 2 * 1024 * 1024 : 5 * 1024 * 1024
  const maxLabel = aspectRatio === "square" ? "2MB" : "5MB"

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize) {
      toast.error(`File too large. Max ${maxLabel}.`)
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split(".").pop() || "jpg"
      const filePath = `${path}.${ext}`
      const supabase = createClient()
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
      // Bust cache
      const url = `${publicUrl}?t=${Date.now()}`
      setPreview(url)
      onUploaded(url)
      toast.success("Image uploaded!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const displayUrl = preview || currentUrl

  if (aspectRatio === "square") {
    return (
      <div className={cn("relative", className)}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors"
        >
          {displayUrl ? (
            <img src={displayUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <Camera className="h-6 w-6" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors"
        style={{ aspectRatio: "3/1" }}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground gap-2">
            <Camera className="h-6 w-6" />
            <span className="text-sm">Upload banner</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
        </div>
      </button>
    </div>
  )
}
