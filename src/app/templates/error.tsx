"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TemplatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-5xl">📦</div>
      <h2 className="text-xl font-bold">Failed to load templates</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load the templates right now. This might be a temporary issue.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
