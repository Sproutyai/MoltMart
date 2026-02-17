interface ActivityIndicatorProps {
  lastActiveAt: string | null
  createdAt: string
}

export function ActivityIndicator({ lastActiveAt, createdAt }: ActivityIndicatorProps) {
  const ref = lastActiveAt || createdAt
  const diff = Date.now() - new Date(ref).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  let label: string
  let showDot = false

  if (days < 1) {
    label = "Active today"
    showDot = true
  } else if (days < 7) {
    label = `Active ${days} day${days === 1 ? "" : "s"} ago`
    showDot = true
  } else if (days < 30) {
    label = "Active this month"
  } else {
    const d = new Date(ref)
    label = `Last active ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {showDot && <span className="inline-block h-2 w-2 rounded-full bg-green-500" />}
      {label}
    </span>
  )
}
