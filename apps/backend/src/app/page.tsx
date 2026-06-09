"use client"

import dynamic from "next/dynamic"
import { LayoutDashboard, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import { useAuth } from "@/providers/auth-provider"
import { api } from "@/lib/api"
import type { DashboardStatsDto } from "@/types/dashboard"

const MonthlyLineChart = dynamic(
  () =>
    import("@ui/components/admin/dashboard").then((m) => m.MonthlyLineChart),
  { ssr: false }
)
const MonthlyBarChart = dynamic(
  () => import("@ui/components/admin/dashboard").then((m) => m.MonthlyBarChart),
  { ssr: false }
)
const CategoryDoughnutChart = dynamic(
  () =>
    import("@ui/components/admin/dashboard").then(
      (m) => m.CategoryDoughnutChart
    ),
  { ssr: false }
)
const TopPostsChart = dynamic(
  () => import("@ui/components/admin/dashboard").then((m) => m.TopPostsChart),
  { ssr: false }
)

export default function AdminDashboardPage() {
  const { user } = useAuth()

  const displayName = user?.name?.trim() || user?.email || "Người dùng"

  const { data } = useQuery<DashboardStatsDto>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => api.dashboard.stats(),
  })

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
              . Đây là bảng điều khiển quản trị HUB Parent.
            </>
          }
          icon={LayoutDashboard}
        />
        {/* Charts */}
        {data && (data.monthlyData?.length ?? 0) > 0 && (
          <div className="space-y-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              <TrendingUp className="size-4" aria-hidden />
              Biểu đồ thống kê
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <MonthlyLineChart data={data.monthlyData} />
              <MonthlyBarChart data={data.monthlyData} />
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
        )}
      </AdminPageSection>
    </AdminPageGuard>
  )
}
