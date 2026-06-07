import { Skeleton } from "../../skeleton"
import { AdminPageSection } from "./admin-page-section"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "./admin-detail-layout"
import { AdminFormMain, AdminFormSidebar } from "./admin-form-layout"

export function AdminListPageSkeleton() {
  return (
    <AdminPageSection className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton shimmer className="h-8 w-56" />
          <Skeleton shimmer className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton shimmer className="h-10 w-36 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <Skeleton shimmer className="h-9 w-28 rounded-lg" />
        <Skeleton shimmer className="h-9 w-28 rounded-lg" />
      </div>
      <Skeleton shimmer className="h-12 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} shimmer className="h-14 w-full rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Đang tải danh sách…</span>
    </AdminPageSection>
  )
}

export function AdminDetailPageSkeleton() {
  return (
    <AdminPageSection className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton shimmer className="size-9 shrink-0 rounded-md" />
          <div className="min-w-0 space-y-2">
            <Skeleton shimmer className="h-7 w-48 max-w-full" />
            <Skeleton shimmer className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <Skeleton shimmer className="h-9 w-24 rounded-md" />
      </div>
      <AdminDetailLayout>
        <AdminDetailMain className="space-y-4">
          <Skeleton shimmer className="h-40 w-full rounded-xl" />
          <Skeleton shimmer className="h-32 w-full rounded-xl" />
        </AdminDetailMain>
        <AdminDetailSidebar className="space-y-4">
          <Skeleton shimmer className="h-36 w-full rounded-xl" />
          <Skeleton shimmer className="h-28 w-full rounded-xl" />
        </AdminDetailSidebar>
      </AdminDetailLayout>
      <span className="sr-only">Đang tải chi tiết…</span>
    </AdminPageSection>
  )
}

export function AdminFormPageSkeleton() {
  return (
    <AdminPageSection className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton shimmer className="size-9 shrink-0 rounded-md" />
          <div className="space-y-2">
            <Skeleton shimmer className="h-7 w-44" />
            <Skeleton shimmer className="h-4 w-56 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton shimmer className="h-9 w-20 rounded-md" />
          <Skeleton shimmer className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <AdminDetailLayout>
        <AdminFormMain className="space-y-4">
          <Skeleton shimmer className="h-12 w-full rounded-lg" />
          <Skeleton shimmer className="h-12 w-full rounded-lg" />
          <Skeleton shimmer className="h-32 w-full rounded-lg" />
          <Skeleton shimmer className="h-12 w-full rounded-lg" />
        </AdminFormMain>
        <AdminFormSidebar className="space-y-4">
          <Skeleton shimmer className="h-40 w-full rounded-xl" />
        </AdminFormSidebar>
      </AdminDetailLayout>
      <span className="sr-only">Đang tải biểu mẫu…</span>
    </AdminPageSection>
  )
}
