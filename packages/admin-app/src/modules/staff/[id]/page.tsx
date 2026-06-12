"use client"
import { api } from "@workspace/admin-app/lib/api"
import { formatPersonInitials } from "@workspace/admin-app/lib/format-person-initials"
import { useParams } from "next/navigation"
import { useStaffProfile } from "@workspace/admin-app/hooks/queries"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canEditProtectedAdminUser } from "@workspace/admin-app/config/protected-admin"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailPageHeader,
  AdminDetailSidebar,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import {
  Phone,
  ShieldHalf,
  CheckCircle2,
  Lock,
  CalendarClock,
  Trash2,
  FileText,
  ArrowUpRight,
  User,
  Mail,
  MapPin,
  ImageIcon,
  Clock,
  Fingerprint,
} from "lucide-react"
import { Button } from "@ui/components/button"
import { Badge } from "@ui/components/badge"
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
  canUserAccess,
  formatDateTime,
  isSuperAdminRoleCode,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { usePostsByAuthor } from "@workspace/admin-app/modules/posts/_component/_query/use-posts-queries"
import Link from "next/link"
import {
  AdminDataTable,
  defineBooleanSelectExportMeta,
} from "@ui/components/data-table"
import { buildAdminTableXlsxExport } from "@ui/components/admin"
import type { ColumnDef } from "@tanstack/react-table"
import type { PostListRow } from "@workspace/admin-app/modules/posts/_component/types"

const postColumns: ColumnDef<PostListRow, unknown>[] = [
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
    accessorKey: "categories",
    header: "Danh mục",
    enableColumnFilter: false,
    cell: ({ row }) => {
      const cats = row.original.categories
      return cats.length > 0 ? (
        cats.map((c) => c.name).join(", ")
      ) : (
        <span className="text-muted-foreground">&mdash;</span>
      )
    },
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

function AvatarDisplay({
  user,
}: {
  user: { avatar?: string | null; fullName: string }
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative aspect-[3/4] w-40 shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-full w-full rounded-lg border-2 border-border/60 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border/60 bg-muted text-lg font-bold text-muted-foreground">
            {formatPersonInitials(user.fullName)}
          </div>
        )}
      </div>
    </div>
  )
}

function StaffDetailPageInner() {
  const params = useParams()
  const crudNav = useAdminModuleNavigation("staff")
  const { user: session } = useAuth()
  const canManageUsers =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE)
  const userId = params.id as string

  const userQuery = useStaffProfile(userId)
  const postsQuery = usePostsByAuthor({
    api,
    authorId: userId,
    limit: 5,
  })

  const user = userQuery.data
  const posts = postsQuery.data?.items || []

  if (!session || !canManageUsers) {
    return (
      <AdminPageSection>
        <AdminDetailPageHeader
          title="Chi tiết nhân sự"
          variant="module"
          onBack={() => crudNav.list()}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Không có quyền truy cập</p>
        </div>
      </AdminPageSection>
    )
  }

  if (userQuery.isLoading || !user) {
    return (
      <AdminPageSection>
        <AdminDetailPageHeader
          title="Chi tiết nhân sự"
          variant="module"
          onBack={() => crudNav.list()}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AdminPageSection>
    )
  }

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={user.fullName}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Nhân sự</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {user.email}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={
          canEditProtectedAdminUser(session?.email, user.email)
            ? () => crudNav.edit(String(userId))
            : undefined
        }
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={User}
              title="Thông tin nhân sự"
              description="Họ tên, email, số điện thoại và địa chỉ."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex w-full gap-2.5">
                <AvatarDisplay user={user} />
                <div className="grid w-full gap-4 sm:grid-cols-2">
                  <FieldSectionField label="Họ và tên" icon={User}>
                    <span className="font-medium">{user.fullName}</span>
                  </FieldSectionField>
                  <FieldSectionField label="Email" icon={Mail}>
                    <span className="font-mono font-medium">{user.email}</span>
                  </FieldSectionField>
                  <FieldSectionField label="Số điện thoại" icon={Phone}>
                    {user.phone ? (
                      <span className="font-medium">{user.phone}</span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">
                        Chưa cập nhật
                      </span>
                    )}
                  </FieldSectionField>
                  <FieldSectionField label="Địa chỉ / văn phòng" icon={MapPin}>
                    {user.address ? (
                      <span className="font-medium">{user.address}</span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">
                        Chưa cập nhật
                      </span>
                    )}
                  </FieldSectionField>
                  <FieldSectionField
                    label="Căn cước công dân"
                    icon={Fingerprint}
                  >
                    {user.citizenId ? (
                      <span className="font-mono font-medium">
                        {user.citizenId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">
                        Chưa cập nhật
                      </span>
                    )}
                  </FieldSectionField>
                </div>
              </div>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FileText}
              title="Bài viết liên quan"
              description="Các bài viết được tạo bởi nhân sự này."
              badge={
                posts.length > 0 ? (
                  <FieldSectionBadge>
                    {postsQuery.data?.total ?? posts.length}
                  </FieldSectionBadge>
                ) : undefined
              }
            />
            <FieldSetContent variant="section" className="pt-0">
              {postsQuery.data?.total != null && postsQuery.data.total > 5 && (
                <div className="mb-3 flex justify-end">
                  <Link href="/posts">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Xem tất cả
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Button>
                  </Link>
                </div>
              )}
              <AdminDataTable<PostListRow>
                data={posts}
                columns={postColumns}
                isLoading={postsQuery.isLoading}
                emptyLabel="Chưa có bài viết nào từ nhân sự này"
                xlsxExport={buildAdminTableXlsxExport("staff-related-posts", {
                  pageCount: posts.length,
                  total: postsQuery.data?.total ?? posts.length,
                  extraMetadata: user?.fullName
                    ? [{ label: "Nhân sự", value: user.fullName }]
                    : undefined,
                })}
                footer={
                  postsQuery.data?.total != null ? (
                    <p className="text-xs text-muted-foreground">
                      Tổng số:{" "}
                      <span className="font-semibold text-foreground">
                        {postsQuery.data.total}
                      </span>{" "}
                      bài viết
                      {postsQuery.data.total > 5 && (
                        <span className="ml-1">(hiện 5 mới nhất)</span>
                      )}
                    </p>
                  ) : null
                }
              />
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={ImageIcon}
              title="Trạng thái"
              description="Hình ảnh hồ sơ của nhân sự."
            />
            <FieldSetContent variant="section" className="pt-0">
              <FieldSectionDivider />

              <FieldSectionField label="Vai trò" icon={ShieldHalf}>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((r) => (
                    <Badge
                      key={r.code}
                      variant={
                        isSuperAdminRoleCode(r.code) ? "default" : "secondary"
                      }
                      className="text-xs font-normal"
                    >
                      {r.name}
                    </Badge>
                  ))}
                </div>
              </FieldSectionField>

              <FieldSectionDivider />

              <FieldSectionField
                label="Trạng thái"
                icon={user.isActive ? CheckCircle2 : Lock}
              >
                <Badge
                  variant="outline"
                  className={
                    user.isActive
                      ? "gap-1 border-emerald-200 text-emerald-700"
                      : "gap-1 text-muted-foreground"
                  }
                >
                  {user.isActive ? (
                    <CheckCircle2 className="size-3" aria-hidden />
                  ) : (
                    <Lock className="size-3" aria-hidden />
                  )}
                  {user.isActive ? "Đang hoạt động" : "Đã khoá"}
                </Badge>
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={CalendarClock}
              title="Thời gian"
              description="Mốc thời gian tạo và cập nhật."
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              <FieldSectionField label="Ngày tạo" icon={CalendarClock}>
                <span className="font-medium">
                  {formatDateTime(user.createdAt)}
                </span>
              </FieldSectionField>
              <FieldSectionDivider />
              <FieldSectionField label="Cập nhật lần cuối" icon={Clock}>
                <span className="font-medium">
                  {formatDateTime(user.updatedAt)}
                </span>
              </FieldSectionField>
              {user.deletedAt && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Xóa lúc" icon={Trash2}>
                    <span className="font-medium text-destructive">
                      {formatDateTime(user.deletedAt)}
                    </span>
                  </FieldSectionField>
                </>
              )}
            </FieldSetContent>
          </FieldSet>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function StaffDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <StaffDetailPageInner />
    </AdminPageGuard>
  )
}
