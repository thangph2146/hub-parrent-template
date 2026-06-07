import {
  AdminDetailPageSkeleton,
  AdminFormPageSkeleton,
  AdminListPageSkeleton,
} from "./admin-page-skeletons"

export type AdminRouteLoadingVariant = "list" | "detail" | "form"

/** Skeleton mặc định khi Next.js đang tải segment route (`loading.tsx`). */
export function AdminRouteLoading({
  variant = "list",
}: {
  variant?: AdminRouteLoadingVariant
}) {
  if (variant === "detail") return <AdminDetailPageSkeleton />
  if (variant === "form") return <AdminFormPageSkeleton />
  return <AdminListPageSkeleton />
}
