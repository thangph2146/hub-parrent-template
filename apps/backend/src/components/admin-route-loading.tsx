import {
  AdminDetailPageSkeleton,
  AdminFormPageSkeleton,
  AdminListPageSkeleton,
} from "@ui/components/admin"

/** Skeleton mặc định khi Next.js đang tải segment route (trước khi client page mount). */
export function AdminRouteLoading({
  variant = "list",
}: {
  variant?: "list" | "detail" | "form"
}) {
  if (variant === "detail") return <AdminDetailPageSkeleton />
  if (variant === "form") return <AdminFormPageSkeleton />
  return <AdminListPageSkeleton />
}

export default AdminRouteLoading
