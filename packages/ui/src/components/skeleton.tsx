import { cn } from "../lib/utils"

type SkeletonProps = React.ComponentProps<"div"> & {
  /** Hiệu ứng shimmer (ưu tiên cho skeleton admin). */
  shimmer?: boolean
}

function Skeleton({ className, shimmer = false, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      data-shimmer={shimmer ? "true" : undefined}
      className={cn(
        "rounded-md bg-muted",
        shimmer
          ? "relative overflow-hidden before:absolute before:inset-0 before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent"
          : "animate-pulse",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
