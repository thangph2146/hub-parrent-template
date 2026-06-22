import type { RbacPermission } from "@workspace/api-client"
import {
  permissionGroupKey,
  permissionGroupLabelVi,
} from "@workspace/admin-app/lib/permission-labels"
export type RolePermissionGroup = {
  key: string
  label: string
  items: RbacPermission[]
}

/** Resource ẩn khỏi báo cáo copy — bảng liên kết / module không cần diff preset. */
export const PERMISSION_REPORT_EXCLUDED_RESOURCES = new Set([
  "parent_students",
  "page_contents",
])

export type PermissionMenuSection = {
  key: string
  label: string
  resources: readonly string[]
}

/** Thứ tự nhóm menu admin hub-parent — khớp sidebar. */
export const HUB_PARENT_PERMISSION_MENU_SECTIONS: PermissionMenuSection[] = [
  { key: "overview", label: "Tổng quan", resources: ["dashboard"] },
  { key: "hrm", label: "HRM", resources: ["users", "roles", "accounts"] },
  {
    key: "students",
    label: "Sinh viên",
    resources: ["students", "contact_requests"],
  },
  {
    key: "catalog",
    label: "Danh mục & Tag",
    resources: ["categories", "tags"],
  },
  {
    key: "media",
    label: "Truyền thông",
    resources: ["posts", "seo_metas"],
  },
  {
    key: "system",
    label: "Hệ thống",
    resources: ["settings", "uploads", "system", "notifications"],
  },
]

const ACTION_SORT_ORDER = [
  "view",
  "view_all",
  "view_own",
  "create",
  "update",
  "delete",
  "manage",
  "export",
  "import",
  "restore",
  "publish",
  "assign",
  "approve",
  "active",
  "unactive",
  "hard-delete",
  "revoke_by_user",
  "checkout",
] as const

export function isReportExcludedPermission(code: string): boolean {
  return PERMISSION_REPORT_EXCLUDED_RESOURCES.has(permissionGroupKey(code))
}

export function filterReportPermissionCodes(codes: readonly string[]): string[] {
  return codes.filter((code) => !isReportExcludedPermission(code))
}

export function filterReportPermissions(
  permissions: readonly RbacPermission[],
): RbacPermission[] {
  return permissions.filter((perm) => !isReportExcludedPermission(perm.code))
}

export function compareActionKeys(a: string, b: string): number {
  const ai = ACTION_SORT_ORDER.indexOf(a as (typeof ACTION_SORT_ORDER)[number])
  const bi = ACTION_SORT_ORDER.indexOf(b as (typeof ACTION_SORT_ORDER)[number])
  if (ai >= 0 && bi >= 0) return ai - bi
  if (ai >= 0) return -1
  if (bi >= 0) return 1
  return a.localeCompare(b)
}

export function comparePermissionCodes(a: string, b: string): number {
  const resourceA = permissionGroupKey(a)
  const resourceB = permissionGroupKey(b)
  const sectionIndex = (resource: string) => {
    for (let i = 0; i < HUB_PARENT_PERMISSION_MENU_SECTIONS.length; i++) {
      const section = HUB_PARENT_PERMISSION_MENU_SECTIONS[i]!
      const resourceIndex = section.resources.indexOf(resource)
      if (resourceIndex >= 0) return i * 100 + resourceIndex
    }
    return 999
  }
  const sectionDiff = sectionIndex(resourceA) - sectionIndex(resourceB)
  if (sectionDiff !== 0) return sectionDiff
  const actionDiff = compareActionKeys(
    a.slice(a.indexOf(":") + 1),
    b.slice(b.indexOf(":") + 1),
  )
  if (actionDiff !== 0) return actionDiff
  return a.localeCompare(b)
}

export function sortReportPermissionCodes(codes: string[]): string[] {
  return [...codes].sort(comparePermissionCodes)
}

function buildResourceGroups(
  permissions: readonly RbacPermission[],
): RolePermissionGroup[] {
  const buckets = new Map<string, RbacPermission[]>()
  for (const perm of permissions) {
    const key = permissionGroupKey(perm.code)
    const arr = buckets.get(key)
    if (arr) arr.push(perm)
    else buckets.set(key, [perm])
  }
  return Array.from(buckets.entries()).map(([key, items]) => ({
    key,
    label: permissionGroupLabelVi(key),
    items: [...items].sort((a, b) => comparePermissionCodes(a.code, b.code)),
  }))
}

export type ReportMenuSectionGroup = {
  section: PermissionMenuSection
  resourceGroups: RolePermissionGroup[]
}

/** Nhóm quyền theo section menu admin (hub-parent). */
export function buildReportMenuSectionGroups(
  permissions: readonly RbacPermission[],
  sections: readonly PermissionMenuSection[] = HUB_PARENT_PERMISSION_MENU_SECTIONS,
): ReportMenuSectionGroup[] {
  const resourceGroups = buildResourceGroups(filterReportPermissions(permissions))
  const groupByKey = new Map(resourceGroups.map((group) => [group.key, group]))
  const placed = new Set<string>()
  const out: ReportMenuSectionGroup[] = []

  for (const section of sections) {
    const sectionGroups: RolePermissionGroup[] = []
    for (const resource of section.resources) {
      const group = groupByKey.get(resource)
      if (!group) continue
      sectionGroups.push(group)
      placed.add(resource)
    }
    if (sectionGroups.length > 0) {
      out.push({ section, resourceGroups: sectionGroups })
    }
  }

  const leftovers = resourceGroups.filter((group) => !placed.has(group.key))
  if (leftovers.length > 0) {
    out.push({
      section: { key: "other", label: "Khác", resources: [] },
      resourceGroups: leftovers.sort((a, b) => a.key.localeCompare(b.key)),
    })
  }

  return out
}

/** Nhóm quyền theo resource — thứ tự menu hub-parent (dùng UI chi tiết). */
export function buildPermissionGroups(
  permissions: readonly RbacPermission[],
): RolePermissionGroup[] {
  return buildReportMenuSectionGroups(permissions).flatMap(
    (entry) => entry.resourceGroups,
  )
}
