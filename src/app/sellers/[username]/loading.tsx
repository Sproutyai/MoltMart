import { Skeleton } from "@/components/ui/skeleton"

export default function SellerProfileLoading() {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <Skeleton className="h-40 w-full rounded-lg" />

      {/* Avatar + info */}
      <div className="flex items-end gap-6 -mt-12 px-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
      </div>

      {/* Stats */}
      <div className="flex gap-6 px-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-5 w-24" />
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-52 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
