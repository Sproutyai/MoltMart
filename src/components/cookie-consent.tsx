"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "molt-cookie-consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "all")
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "essential-only")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <Card className="mx-auto max-w-2xl bg-zinc-900 text-zinc-100 border-zinc-700 p-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={decline}>
            Decline Non-Essential
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </Card>
    </div>
  )
}
