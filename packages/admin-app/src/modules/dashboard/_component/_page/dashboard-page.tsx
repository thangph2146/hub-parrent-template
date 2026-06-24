"use client"

import dynamic from "next/dynamic"
import { AlertCircle, LayoutDashboard, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import { Skeleton } from "@ui/components/skeleton"
import { useAdminAuth, useAdminApp, useAdminApi } from "@workspace/admin-app/runtime"
import type { DashboardStatsDto } from "@workspace/admin-app/types/dashboard"

const MonthlyLineChart = dynamic(
  () =>
    import("@ui/components/admin/dashboard").then((m) => m.MonthlyLineChart),
  { ssr: false },
)
const MonthlyBarChart = dynamic(
  () => import("@ui/components/admin/dashboard").then((m) => m.MonthlyBarChart),
  { ssr: false },
)
const CategoryDoughnutChart = dynamic(
  () =>
    import("@ui/components/admin/dashboard").then(
      (m) => m.CategoryDoughnutChart,
    ),
  { ssr: false },
)
const TopPostsChart = dynamic(
  () => import("@ui/components/admin/dashboard").then((m) => m.TopPostsChart),
  { ssr: false },
)

const DEFAULT_SUBTITLE =
  "Đây là bảng điều khiển quản trị HUB Parent."

export default function AdminDashboardPage() {
  const api = useAdminApi()
  const { user } = useAdminAuth()
  const { dashboard } = useAdminApp()

  const displayName = user?.name?.trim() || user?.email || "Người dùng"
  const subtitleText = dashboard?.subtitle ?? DEFAULT_SUBTITLE

  const { data, error, isPending, refetch } = useQuery<DashboardStatsDto>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => api.dashboard.stats(),
  })

  const monthlyData = data?.monthlyData ?? []
  const hasMonthlyData = monthlyData.length > 0

  return (
    <AdminPageGuard>
      <AdminPageSection>
        <AdminListPageHeader
          title="Tổng quan hệ thống"
          subtitle={
            <>
              Xin chào,{" "}
              <span className="font-semibold text-foreground">
                {displayName}
              </span>
              . {subtitleText}
            </>
          }
          icon={LayoutDashboard}
        />
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive">
            <AlertCircle className="mb-2 size-5" aria-hidden />
            <p className="text-sm font-medium">
              Không tải được thống kê dashboard.
            </p>
            <p className="mt-1 text-sm opacity-90">{error.message}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-medium underline underline-offset-2"
            >
              Thử lại
            </button>
          </div>
        ) : isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        ) : hasMonthlyData ? (
          <div className="space-y-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              <TrendingUp className="size-4" aria-hidden />
              Biểu đồ thống kê
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <MonthlyLineChart data={monthlyData} />
              <MonthlyBarChart data={monthlyData} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {(data.categoryData?.length ?? 0) > 0 && (
                <CategoryDoughnutChart data={data.categoryData} />
              )}
              {(data.topPosts?.length ?? 0) > 0 && (
                <TopPostsChart data={data.topPosts} />
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu thống kê theo tháng.
          </p>
        )}
      </AdminPageSection>
    </AdminPageGuard>
  )
}
