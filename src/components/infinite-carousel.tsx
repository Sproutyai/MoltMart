"use client"

import { ReactNode, useRef, useEffect, useCallback } from "react"

interface InfiniteCarouselProps {
  children: ReactNode[]
  direction?: "left" | "right"
  /** Pixels per second */
  speed?: number
  /** Max items to display (default 20) */
  maxItems?: number
}

export function InfiniteCarousel({
  children,
  direction = "left",
  speed = 50,
  maxItems = 20,
}: InfiniteCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(speed)
  const targetVelocityRef = useRef(speed)
  const lastTimeRef = useRef(0)
  const rafRef = useRef<number>(0)
  const visibleRef = useRef(true)
  const initRef = useRef(false)
  const hoveredRef = useRef(false)

  const LERP_SPEED = 3

  // Cap children
  const items = children.slice(0, maxItems)

  // Repeat items enough to fill space (4× covers most cases)
  const REPEATS = Math.max(4, items.length < 5 ? 6 : 4)

  const tick = useCallback((time: number) => {
    if (!trackRef.current) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    if (!initRef.current) {
      initRef.current = true
      if (direction === "right") {
        offsetRef.current = -(trackRef.current.scrollWidth / REPEATS)
      }
    }

    const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0
    lastTimeRef.current = time

    // Lerp velocity toward target
    const diff = targetVelocityRef.current - velocityRef.current
    velocityRef.current += diff * Math.min(LERP_SPEED * dt, 1)
    if (Math.abs(diff) < 0.5) velocityRef.current = targetVelocityRef.current

    const dirMul = direction === "left" ? -1 : 1
    offsetRef.current += velocityRef.current * dt * dirMul

    // Reset at one-set width for seamless loop
    const setWidth = trackRef.current.scrollWidth / REPEATS
    if (direction === "left") {
      while (offsetRef.current <= -setWidth) offsetRef.current += setWidth
      while (offsetRef.current > 0) offsetRef.current -= setWidth
    } else {
      while (offsetRef.current >= 0) offsetRef.current -= setWidth
      while (offsetRef.current < -setWidth * (REPEATS - 1)) offsetRef.current += setWidth
    }

    trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
    rafRef.current = requestAnimationFrame(tick)
  }, [direction, speed, REPEATS])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  // IntersectionObserver — pause when off-screen
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        if (!hoveredRef.current) {
          targetVelocityRef.current = entry.isIntersecting ? speed : 0
        }
      },
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [speed])

  const handlePointerEnter = () => {
    hoveredRef.current = true
    targetVelocityRef.current = 0
  }

  const handlePointerLeave = () => {
    hoveredRef.current = false
    if (visibleRef.current) targetVelocityRef.current = speed
  }

  if (!items || items.length === 0) return null

  const repeated = Array.from({ length: REPEATS }, (_, rep) =>
    items.map((child, i) => (
      <div
        key={`${rep}-${i}`}
        className="w-[192px] flex-shrink-0 sm:w-[224px] transition-transform duration-200 hover:scale-105 hover:z-10"
        aria-hidden={rep > 0 ? true : undefined}
      >
        {child}
      </div>
    ))
  ).flat()

  return (
    <div
      ref={containerRef}
      className="overflow-hidden py-4 -my-4 px-1 -mx-1"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={trackRef}
        className="flex gap-3"
        style={{ willChange: "transform" }}
      >
        {repeated}
      </div>
    </div>
  )
}
