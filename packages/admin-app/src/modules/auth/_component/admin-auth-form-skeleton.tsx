import { Skeleton } from "@ui/components/skeleton"

export function AdminAuthFormSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Đang tải thông tin hệ thống"
    >
      <div className="space-y-4">
        <Skeleton shimmer className="size-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton shimmer className="h-3 w-28" />
          <Skeleton shimmer className="h-8 w-48" />
          <Skeleton shimmer className="h-4 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton shimmer className="h-4 w-16" />
        <Skeleton shimmer className="h-11 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton shimmer className="h-4 w-20" />
        <Skeleton shimmer className="h-11 w-full rounded-lg" />
      </div>
      <Skeleton shimmer className="h-11 w-full rounded-lg" />
    </div>
  )
}
