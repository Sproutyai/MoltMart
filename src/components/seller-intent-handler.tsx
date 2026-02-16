"use client"

import { useEffect } from "react"

export function SellerIntentHandler() {
  useEffect(() => {
    const intent = localStorage.getItem("molt_seller_intent")
    if (!intent) return

    localStorage.removeItem("molt_seller_intent")

    // Retry a few times in case the profile row hasn't been created yet
    let attempts = 0
    const tryBecomeSeller = async () => {
      attempts++
      const res = await fetch("/api/profile/become-seller", { method: "POST" })
      if (!res.ok && attempts < 5) {
        setTimeout(tryBecomeSeller, 2000 * attempts)
      }
    }
    tryBecomeSeller()
  }, [])

  return null
}
