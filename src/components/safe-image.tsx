"use client"

import Image, { type ImageProps } from "next/image"
import { useState, type ReactNode } from "react"

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallback?: ReactNode
}

/**
 * Wrapper around next/image that shows a fallback on load error
 * (e.g. broken Supabase storage URLs).
 */
export function SafeImage({ fallback, alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error && fallback) return <>{fallback}</>

  return <Image {...props} alt={alt} onError={() => setError(true)} />
}
