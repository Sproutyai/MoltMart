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
          className="w-full h-full object-cover"
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
