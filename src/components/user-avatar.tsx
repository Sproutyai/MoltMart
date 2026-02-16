import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  avatarUrl?: string | null
  displayName?: string | null
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
}

export function UserAvatar({ avatarUrl, displayName, size = "sm", className }: UserAvatarProps) {
  const initial = (displayName || "U")[0]?.toUpperCase() || "U"

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? "User"} />
      <AvatarFallback className="font-bold">{initial}</AvatarFallback>
    </Avatar>
  )
}
