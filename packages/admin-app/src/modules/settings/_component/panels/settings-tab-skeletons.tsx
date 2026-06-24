"use client"

import { Skeleton } from "@ui/components/skeleton"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { Globe, Monitor, Search, ShieldHalf } from "lucide-react"

export function SettingsDisplayTabSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap gap-2">
        <Skeleton shimmer className="h-9 w-36 rounded-lg" />
        <Skeleton shimmer className="h-9 w-40 rounded-lg" />
      </div>
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Monitor}
          title="Thương hiệu admin"
          description="Đang tải cài đặt hiển thị…"
        />
        <FieldSetContent variant="section" className="space-y-4 pt-0">
          <Skeleton shimmer className="h-10 w-full rounded-lg" />
          <Skeleton shimmer className="h-10 w-full rounded-lg" />
        </FieldSetContent>
      </FieldSet>
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={ShieldHalf}
          title="Vai trò mặc định"
          description="Đang tải danh sách vai trò…"
        />
        <FieldSetContent variant="section" className="pt-0">
          <Skeleton shimmer className="h-10 w-full rounded-lg" />
        </FieldSetContent>
      </FieldSet>
      <span className="sr-only">Đang tải tab hiển thị…</span>
    </div>
  )
}

export function SettingsSeoGlobalTabSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap gap-2">
        <Skeleton shimmer className="h-9 w-32 rounded-lg" />
        <Skeleton shimmer className="h-9 w-36 rounded-lg" />
      </div>
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Globe}
          title="SEO mặc định toàn site"
          description="Đang tải SEO mặc định…"
        />
        <FieldSetContent variant="section" className="space-y-4 pt-0">
          <Skeleton shimmer className="h-10 w-full rounded-lg" />
          <Skeleton shimmer className="h-24 w-full rounded-lg" />
          <Skeleton shimmer className="h-10 w-full rounded-lg" />
        </FieldSetContent>
      </FieldSet>
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Search}
          title="Open Graph"
          description="Đang tải Open Graph…"
        />
        <FieldSetContent variant="section" className="space-y-4 pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton shimmer className="h-10 w-full rounded-lg" />
            <Skeleton shimmer className="h-10 w-full rounded-lg" />
            <Skeleton
              shimmer
              className="h-20 w-full rounded-lg md:col-span-2"
            />
          </div>
        </FieldSetContent>
      </FieldSet>
      <span className="sr-only">Đang tải tab SEO mặc định…</span>
    </div>
  )
}
