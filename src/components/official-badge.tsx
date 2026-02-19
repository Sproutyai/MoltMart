"use client"

import { BadgeCheck } from "lucide-react"

interface OfficialBadgeProps {
  size?: number
}

/** Crimson-red verified badge for official Molt Mart sellers. */
export function OfficialBadge({ size = 16 }: OfficialBadgeProps) {
  return (
    <BadgeCheck
      className="inline-block shrink-0"
      style={{ width: size, height: size, color: "#dc2626", fill: "#dc2626", stroke: "white" }}
      aria-label="Official Molt Mart seller"
    />
  )
}

/** The set of usernames that receive the official badge. */
const OFFICIAL_USERNAMES = new Set(["moltmart"])

/** Check whether a username should show the official badge. */
export function isOfficialSeller(username: string): boolean {
  return OFFICIAL_USERNAMES.has(username)
}
