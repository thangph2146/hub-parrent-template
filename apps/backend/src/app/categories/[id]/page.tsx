"use client"

import { useEffect, createElement, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { toast } from "@ui/components/sonner"
import {
  Calendar,
  Clock,
  FolderTree,
  Tag,
  FileText,
  Layers,
  Hash,
  File,
  ArrowUpRight,
} from "lucide-react"
import { resolveIcon } from "@ui/lib/icons"
import { Button } from "@ui/components/button"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionBadge,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
  AdminDetailPageHeader,
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
  buildAdminTableXlsxExport,
} from "@ui/components/admin"
import {
  AdminDataTable,
  defineBooleanSelectExportMeta,
} from "@ui/components/data-table"
import { useAuth } from "@/providers/auth-provider"
import {
  PERMISSION_CODES,
  canUserAccess,
  formatDateTime,
  type ChildCategory,
  type RelatedPost,
} from "@workspace/api-client"
import { api } from "@/lib/api"
import { useCategoryDetailQuery } from "../_component"
import type { CategoryDetail } from "../_component"
import type { ColumnDef } from "@tanstack/react-table"

const childColumns: ColumnDef<ChildCategory, unknown>[] = [
  {
    accessorKey: "name",
    header: "Tên danh mục",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <Link
        href={`/categories/${row.original.id}`}
        className="line-clamp-1 font-medium text-primary underline-offset-4 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        /danh-muc/{row.original.slug}
      </span>
    ),
  },
  {
    id: "childrenCount",
    header: "Danh mục con",
    enableColumnFilter: false,
    accessorFn: (row) => row._count.children,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original._count.children}</span>
    ),
  },
  {
    accessorKey: "postCount",
    header: "Bài viết",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.postCount}</span>
    ),
  },
]

const relatedPostColumns: ColumnDef<RelatedPost, unknown>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    enableColumnFilter: false,
    cell: ({ row }) => (
      <Link
        href={`/posts/${row.original.id}`}
        className="line-clamp-1 font-medium text-primary underline-offset-4 hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "publishedAt",
    header: "Ngày đăng",
    enableColumnFilter: false,
    cell: ({ row }) =>
      row.original.publishedAt
        ? formatDateTime(row.original.publishedAt)
        : formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: "published",
    header: "Trạng thái",
    enableColumnFilter: false,
    meta: defineBooleanSelectExportMeta("Đã xuất bản", "Nháp"),
    cell: ({ row }) => (
      <UsageStatusFromValue
        value={row.original.published}
        labels={{ active: "Đã xuất bản", locked: "Nháp" }}
        className="text-[10px]"
      />
    ),
  },
]

function DetailSidebar({
  category,
  ParentIcon,
}: {
  category: CategoryDetail
  ParentIcon: ReturnType<typeof resolveIcon> | null
}) {
  return (
    <>
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Calendar}
          title="Thời gian"
          description="Mốc thời gian tạo và cập nhật."
        />
        <FieldSetContent variant="section" className="space-y-3 pt-0">
          <FieldSectionField label="Ngày tạo" icon={Calendar}>
            <span className="font-medium">
              {formatDateTime(category.createdAt)}
            </span>
          </FieldSectionField>
          <FieldSectionDivider />
          <FieldSectionField label="Cập nhật lần cuối" icon={Clock}>
            <span className="font-medium">
              {formatDateTime(category.updatedAt)}
            </span>
          </FieldSectionField>
        </FieldSetContent>
      </FieldSet>

      <FieldSet variant="section">
        <FieldSectionLegend
          icon={Layers}
          title="Phân cấp & Thống kê"
          description="Cấu trúc phân cấp và số lượng nội dung."
        />
        <FieldSetContent variant="section" className="space-y-3 pt-0">
          <FieldSectionField label="Danh mục cha" icon={FolderTree}>
            <span className="flex items-center gap-1.5 font-medium">
              {ParentIcon &&
                createElement(ParentIcon, {
                  className: "size-3.5 text-muted-foreground",
                })}
              {category.parentName ?? "Cấp gốc"}
            </span>
          </FieldSectionField>
          <FieldSectionDivider />
          <FieldSectionField label="Danh mục con" icon={Layers}>
            <span className="font-medium">{category._count.children} mục</span>
          </FieldSectionField>
          <FieldSectionDivider />
          <FieldSectionField label="Bài viết" icon={FileText}>
            <span className="font-medium">{category.postCount} bài</span>
          </FieldSectionField>
        </FieldSetContent>
      </FieldSet>
    </>
  )
}

function CategoryDetailInner() {
  const crudNav = useAdminCrudNavigation("/categories")
  const params = useParams()
  const categoryId = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.CATEGORIES_UPDATE)
    : false

  const {
    data: category,
    isLoading,
    isError,
  } = useCategoryDetailQuery(api, categoryId)

  const children = useMemo(() => category?.children ?? [], [category?.children])
  const posts = useMemo(() => category?.posts ?? [], [category?.posts])

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được danh mục")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />

  if (!category) return null

  const ParentIcon = category.parentIcon
    ? resolveIcon(category.parentIcon)
    : null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={category.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Danh mục</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {category.parentName ?? "Cấp gốc"}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(String(categoryId)) : undefined}
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Tag}
              title="Thông tin danh mục"
              description="Slug, danh mục cha và mô tả."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField label="Slug / đường dẫn" icon={Hash}>
                  <p className="font-mono font-medium">{category.slug}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">
                    /danh-muc/{category.slug}
                  </p>
                </FieldSectionField>
                <FieldSectionField label="Danh mục cha" icon={FolderTree}>
                  <p className="flex items-center gap-1.5 font-medium">
                    {ParentIcon &&
                      createElement(ParentIcon, {
                        className: "size-4 shrink-0 text-muted-foreground",
                      })}
                    {category.parentName ?? "Cấp gốc"}
                  </p>
                </FieldSectionField>
              </div>

              {category.description ? (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Mô tả" icon={FileText}>
                    <p className="leading-relaxed">{category.description}</p>
                  </FieldSectionField>
                </>
              ) : null}
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FolderTree}
              title="Danh mục con"
              description="Các danh mục con trực thuộc."
              badge={
                children.length > 0 ? (
                  <FieldSectionBadge>
                    {category._count.children}
                  </FieldSectionBadge>
                ) : undefined
              }
            />
            <FieldSetContent variant="section" className="pt-0">
              <AdminDataTable<ChildCategory>
                data={children}
                columns={childColumns}
                getRowId={(row) => row.id}
                emptyLabel="Chưa có danh mục con nào"
                xlsxExport={buildAdminTableXlsxExport("category-children", {
                  pageCount: children.length,
                  total: category._count.children,
                  extraMetadata: [{ label: "Danh mục", value: category.name }],
                })}
                footer={
                  category._count.children > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Tổng số:{" "}
                      <span className="font-semibold text-foreground">
                        {category._count.children}
                      </span>{" "}
                      danh mục con
                    </p>
                  ) : null
                }
              />
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={File}
              title="Bài viết liên quan"
              description="Các bài viết được gắn danh mục này."
              badge={
                category.postCount > 0 ? (
                  <FieldSectionBadge>{category.postCount}</FieldSectionBadge>
                ) : undefined
              }
            />
            <FieldSetContent variant="section" className="pt-0">
              {category.postCount > 10 && (
                <div className="mb-3 flex justify-end">
                  <Link href="/posts">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Xem tất cả
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Button>
                  </Link>
                </div>
              )}
              <AdminDataTable<RelatedPost>
                data={posts}
                columns={relatedPostColumns}
                getRowId={(row) => row.id}
                emptyLabel="Chưa có bài viết nào trong danh mục này"
                xlsxExport={buildAdminTableXlsxExport(
                  "category-related-posts",
                  {
                    pageCount: posts.length,
                    total: category.postCount,
                    extraMetadata: [
                      { label: "Danh mục", value: category.name },
                    ],
                  }
                )}
                footer={
                  category.postCount > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Tổng số:{" "}
                      <span className="font-semibold text-foreground">
                        {category.postCount}
                      </span>{" "}
                      bài viết
                      {category.postCount > 10 && (
                        <span className="ml-1">(hiện 10 mới nhất)</span>
                      )}
                    </p>
                  ) : null
                }
              />
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <DetailSidebar category={category} ParentIcon={ParentIcon} />
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function CategoryDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <CategoryDetailInner />
    </AdminPageGuard>
  )
}
