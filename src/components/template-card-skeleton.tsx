import { Skeleton } from "@/components/ui/skeleton"

export function TemplateCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
