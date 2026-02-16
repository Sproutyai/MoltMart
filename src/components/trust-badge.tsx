import { CheckCircle, Github, Twitter } from "lucide-react"

interface TrustBadgeProps {
  githubVerified?: boolean
  twitterVerified?: boolean
  variant?: "inline" | "full"
}

export function TrustBadge({ githubVerified, twitterVerified, variant = "inline" }: TrustBadgeProps) {
  if (!githubVerified && !twitterVerified) return null

  if (variant === "inline") {
    return (
      <span title={`Verified seller — ${[githubVerified && "GitHub", twitterVerified && "X"].filter(Boolean).join(" & ")} connected`}>
        <CheckCircle className="inline h-3.5 w-3.5 text-blue-500 ml-1" />
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {githubVerified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
          <Github size={12} /> Verified
        </span>
      )}
      {twitterVerified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <Twitter size={12} /> Verified
        </span>
      )}
    </div>
  )
}
