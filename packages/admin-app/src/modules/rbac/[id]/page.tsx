"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailPageHeader,
  AdminDetailSidebar,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import {
  Shield,
  ShieldHalf,
  CheckCircle2,
  Lock,
  CalendarClock,
  Clock,
  FileText,
  User,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Input } from "@ui/components/input"
import { ScrollArea } from "@ui/components/scroll-area"
import {
  FieldSet,
  FieldSetContent,
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
} from "@ui/components/field"
import {
  canUserAccess,
  isSuperAdminRoleCode,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { canEditSuperAdminRole } from "@workspace/admin-app/config/protected-admin"
import {
  useRoleDetail,
  useRbacCatalog,
} from "../_component/_query/use-rbac-queries"
import { permissionLabelVi } from "@workspace/admin-app/lib/permission-labels"
import { RoleCopyActions } from "../_component/role-copy-actions"
import {
  buildPermissionGroups,
  buildReportMenuSectionGroups,
  filterReportPermissionCodes,
  filterReportPermissions,
} from "../_component/permission-report-groups"

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa có dữ liệu"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("vi-VN")
}

function RoleDetailPageInner() {
  const params = useParams()
  const crudNav = useAdminModuleNavigation("rbac")
  const { user: session } = useAuth()
  const roleId = params.id as string

  const roleQuery = useRoleDetail(roleId)
  const catalogQuery = useRbacCatalog()
  const role = roleQuery.data

  const [permissionSearch, setPermissionSearch] = useState("")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  const canManageRoles =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE)

  const allPermissions = useMemo(
    () => filterReportPermissions(catalogQuery.data?.permissions ?? []),
    [catalogQuery.data?.permissions],
  )

  const reportableAssignedCount = useMemo(
    () =>
      filterReportPermissionCodes(role?.permissions ?? []).filter((code) =>
        allPermissions.some((perm) => perm.code === code),
      ).length,
    [allPermissions, role?.permissions],
  )

  const selectedCodes = useMemo(
    () => new Set(role?.permissions ?? []),
    [role?.permissions]
  )

  const allPermissionGroups = useMemo(
    () => buildPermissionGroups(allPermissions),
    [allPermissions],
  )

  const visiblePermissions = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase()
    let filtered = allPermissions
    if (showSelectedOnly) {
      filtered = filtered.filter((p) => selectedCodes.has(p.code))
    }
    if (q) {
      filtered = filtered.filter((p) =>
        [p.code, permissionLabelVi(p.code), p.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    }
    return filtered
  }, [permissionSearch, allPermissions, showSelectedOnly, selectedCodes])

  const menuSectionGroups = useMemo(
    () => buildReportMenuSectionGroups(allPermissions),
    [allPermissions],
  )

  const visibleMenuSections = useMemo(() => {
    const visibleCodes = new Set(visiblePermissions.map((p) => p.code))
    return menuSectionGroups
      .map(({ section, resourceGroups }) => ({
        section,
        resourceGroups: resourceGroups
          .map((group) => ({
            ...group,
            items: group.items.filter((p) => visibleCodes.has(p.code)),
          }))
          .filter((group) => group.items.length > 0),
      }))
      .filter((entry) => entry.resourceGroups.length > 0)
  }, [menuSectionGroups, visiblePermissions])

  const visibleGroupsForCopy = useMemo(
    () => visibleMenuSections.flatMap((entry) => entry.resourceGroups),
    [visibleMenuSections],
  )

  const overviewGroups = useMemo(() => {
    return allPermissionGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((p) => selectedCodes.has(p.code)),
      }))
      .filter((group) => group.items.length > 0)
  }, [allPermissionGroups, selectedCodes])

  if (roleQuery.isLoading) {
    return (
      <AdminPageSection>
        <AdminDetailPageHeader
          title="Chi tiết vai trò"
          variant="module"
          onBack={() => crudNav.list()}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AdminPageSection>
    )
  }

  if (!role) {
    return (
      <AdminPageSection>
        <AdminDetailPageHeader
          title="Chi tiết vai trò"
          variant="module"
          onBack={() => crudNav.list()}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Không tìm thấy vai trò</p>
        </div>
      </AdminPageSection>
    )
  }

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={role.name}
        subtitle={
          <>
            <span className="text-muted-foreground/60">Vai trò</span>
            <span className="mx-1.5 text-muted-foreground/40">/</span>
            {role.code}
          </>
        }
        variant="module"
        onBack={() => crudNav.list()}
        onEdit={
          canManageRoles &&
          (!isSuperAdminRoleCode(role.code) ||
            canEditSuperAdminRole(session?.email))
            ? () => crudNav.edit(String(roleId))
            : undefined
        }
      />

      <AdminDetailLayout>
        <AdminDetailMain>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Shield}
              title="Thông tin vai trò"
              description="Mã vai trò, tên hiển thị và mô tả."
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSectionField
                  label="Mã vai trò"
                  icon={ShieldHalf}
                  copyable
                  copyText={role.code}
                >
                  <span className="font-mono font-medium">{role.code}</span>
                </FieldSectionField>
                <FieldSectionField
                  label="Tên hiển thị"
                  icon={User}
                  copyable
                  copyText={role.name}
                >
                  <span className="font-medium">{role.name}</span>
                </FieldSectionField>
              </div>

              <FieldSectionDivider />

              <FieldSectionField
                label="Mô tả"
                copyable
                copyText={role.description?.trim() || ""}
              >
                {role.description ? (
                  <span>{role.description}</span>
                ) : (
                  <span className="text-muted-foreground/60 italic">
                    Chưa có mô tả
                  </span>
                )}
              </FieldSectionField>

              <FieldSectionDivider />

              <FieldSectionField
                label="Trạng thái"
                icon={role.isActive ? CheckCircle2 : Lock}
                copyable
                copyText={role.isActive ? "active" : "inactive"}
              >
                <Badge
                  variant="outline"
                  className={
                    role.isActive
                      ? "gap-1 border-emerald-200 text-emerald-700"
                      : "gap-1 text-muted-foreground"
                  }
                >
                  {role.isActive ? "Đang hoạt động" : "Đã khoá"}
                </Badge>
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={FileText}
              title={`Quyền hạn (${reportableAssignedCount})`}
              description="Danh sách quyền được gán cho vai trò này — sao chép để so sánh preset hub-parent."
              badge={
                <RoleCopyActions
                  role={role}
                  allPermissions={allPermissions}
                  visibleGroups={visibleGroupsForCopy}
                  compact
                />
              }
            />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Đã chọn {reportableAssignedCount}/{allPermissions.length}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSelectedOnly((prev) => !prev)}
                  className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                >
                  {showSelectedOnly ? "Hiện tất cả" : "Chỉ đã chọn"}
                </button>
              </div>
              <Input
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Tìm quyền..."
                className="h-9"
              />
              <ScrollArea className="min-h-[480px] h-[calc(100vh-340px)] rounded-lg border border-border/60 bg-muted/10">
                <div className="space-y-3 p-3">
                  {visibleMenuSections.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Không có quyền khớp tìm kiếm.
                    </p>
                  ) : (
                    visibleMenuSections.map(({ section, resourceGroups }) => (
                      <div key={section.key} className="space-y-3">
                        <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {section.label}
                        </p>
                        {resourceGroups.map((group) => {
                          const selectedInGroup = group.items.filter((p) =>
                            selectedCodes.has(p.code)
                          ).length
                          return (
                            <section
                              key={group.key}
                              className="overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm"
                            >
                              <header className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-3 py-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                      {group.key}
                                    </p>
                                    <p className="truncate text-sm font-semibold text-foreground">
                                      {group.label}
                                    </p>
                                  </div>
                                </div>
                                <span className="rounded-md border border-border/60 bg-background/90 px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                                  {selectedInGroup}/{group.items.length}
                                </span>
                              </header>
                              <div className="grid gap-1.5 p-2 sm:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((perm) => {
                                  const isSelected = selectedCodes.has(perm.code)
                                  return (
                                    <div
                                      key={perm.code}
                                      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors ${
                                        isSelected
                                          ? "border-primary/40 bg-primary/5"
                                          : "border-border/60 bg-background/90"
                                      }`}
                                    >
                                      <span className="min-w-0 leading-tight">
                                        <span className="block text-sm font-medium">
                                          {permissionLabelVi(perm.code)}
                                        </span>
                                        <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                          {perm.code}
                                        </span>
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </section>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailMain>

        <AdminDetailSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={CalendarClock}
              title="Thời gian"
              description="Mốc thời gian tạo và cập nhật."
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              {role.createdAt && (
                <FieldSectionField label="Ngày tạo" icon={CalendarClock}>
                  <span className="font-medium">
                    {formatDateTime(role.createdAt)}
                  </span>
                </FieldSectionField>
              )}
              {role.createdAt && role.updatedAt && <FieldSectionDivider />}
              {role.updatedAt && (
                <FieldSectionField label="Cập nhật lần cuối" icon={Clock}>
                  <span className="font-medium">
                    {formatDateTime(role.updatedAt)}
                  </span>
                </FieldSectionField>
              )}
              {role.deletedAt && (
                <>
                  <FieldSectionDivider />
                  <FieldSectionField label="Xoá lúc" icon={Lock}>
                    <span className="font-medium text-destructive">
                      {formatDateTime(role.deletedAt)}
                    </span>
                  </FieldSectionField>
                </>
              )}
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend
              icon={ShieldHalf}
              title="Tổng quan quyền"
              description={`${reportableAssignedCount} quyền được chọn.`}
            />
            <FieldSetContent variant="section" className="pt-0">
              <ScrollArea className="h-[calc(100vh-520px)] rounded-lg border border-border/60 bg-muted/10">
                <div className="space-y-2 p-4">
                  {overviewGroups.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Chưa có quyền nào được chọn.
                    </p>
                  ) : (
                    overviewGroups.map((group) => (
                      <div
                        key={group.key}
                        className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {group.label}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase">
                            {group.key}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
                          {group.items.length}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </FieldSetContent>
          </FieldSet>
        </AdminDetailSidebar>
      </AdminDetailLayout>
    </AdminPageSection>
  )
}

export default function RoleDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin"]}>
      <RoleDetailPageInner />
    </AdminPageGuard>
  )
}
