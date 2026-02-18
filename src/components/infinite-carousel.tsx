"use client"

import { ReactNode, useRef, useEffect, useCallback } from "react"

interface InfiniteCarouselProps {
  children: ReactNode[]
  direction?: "left" | "right"
  /** Pixels per second */
  speed?: number
}

export function InfiniteCarousel({
  children,
  direction = "left",
  speed = 50,
}: InfiniteCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(speed)
  const targetVelocityRef = useRef(speed)
  const lastTimeRef = useRef(0)
  const rafRef = useRef<number>(0)
  const visibleRef = useRef(true)
  const initRef = useRef(false)

  // Higher = faster transition. 3 ≈ ~300ms to settle
  const LERP_SPEED = 3

  const tick = useCallback((time: number) => {
    if (!trackRef.current) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    // Initialize offset for right-direction on first tick
    if (!initRef.current) {
      initRef.current = true
      if (direction === "right") {
        offsetRef.current = -(trackRef.current.scrollWidth / 2)
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

    // Reset at half-width for seamless loop
    const halfWidth = trackRef.current.scrollWidth / 2
    if (direction === "left" && offsetRef.current <= -halfWidth) {
      offsetRef.current += halfWidth
    } else if (direction === "right" && offsetRef.current >= 0) {
      offsetRef.current -= halfWidth
    }

    trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
    rafRef.current = requestAnimationFrame(tick)
  }, [direction, speed])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  // IntersectionObserver — pause when off-screen
  useEffect(() => {
    const el = trackRef.current?.parentElement
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting
        targetVelocityRef.current = entry.isIntersecting ? speed : 0
      },
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [speed])

  const handlePointerEnter = () => {
    targetVelocityRef.current = 0
  }
  const handlePointerLeave = () => {
    if (visibleRef.current) targetVelocityRef.current = speed
  }

  if (!children || children.length === 0) return null

  return (
    <div
      className="overflow-hidden py-1 -my-1 px-1 -mx-1"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={trackRef}
        className="flex gap-3"
        style={{ willChange: "transform" }}
      >
        {children.map((child, i) => (
          <div key={`a-${i}`} className="w-[240px] flex-shrink-0 sm:w-[280px]">
            {child}
          </div>
        ))}
        {children.map((child, i) => (
          <div key={`b-${i}`} className="w-[240px] flex-shrink-0 sm:w-[280px]" aria-hidden="true">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
