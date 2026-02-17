"use client"

import { ReactNode } from "react"

interface InfiniteCarouselProps {
  children: ReactNode[]
  direction?: "left" | "right"
  speed?: number
}

export function InfiniteCarousel({ children, direction = "left", speed = 30 }: InfiniteCarouselProps) {
  if (!children || children.length === 0) return null

  const animationName = direction === "left" ? "scroll-left" : "scroll-right"

  return (
    <div className="overflow-hidden py-2 -my-2 px-1 -mx-1">
      <div
        className="flex gap-5"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
          willChange: "transform",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused" }}
        onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running" }}
        onTouchStart={(e) => { e.currentTarget.style.animationPlayState = "paused" }}
        onTouchEnd={(e) => { setTimeout(() => { e.currentTarget.style.animationPlayState = "running" }, 3000) }}
      >
        {children.map((child, i) => (
          <div key={`a-${i}`} className="w-[300px] flex-shrink-0 sm:w-[340px]">
            {child}
          </div>
        ))}
        {children.map((child, i) => (
          <div key={`b-${i}`} className="w-[300px] flex-shrink-0 sm:w-[340px]" aria-hidden="true">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
