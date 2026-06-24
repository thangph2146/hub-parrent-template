import type { RbacPermission } from "@workspace/api-client"
import { resolveAdminPortalLabel } from "@ui/lib/admin-operation-report-branding"
import {
  permissionActionKey,
  permissionActionLabelVi,
  permissionLabelVi,
} from "../shared/permission-labels"
import type { RoleRow } from "../shared/utils"
import {
  buildReportMenuSectionGroups,
  compareActionKeys,
  filterReportPermissionCodes,
  filterReportPermissions,
  PERMISSION_REPORT_EXCLUDED_RESOURCES,
  sortReportPermissionCodes,
  type ReportMenuSectionGroup,
  type RolePermissionGroup,
} from "./permission-report-groups"

export type { RolePermissionGroup } from "./permission-report-groups"
export type BuildRolePermissionCopyReportInput = {
  role: RoleRow
  allPermissions: RbacPermission[]
  /** Chỉ quyền đang gán — mặc định true trên trang chi tiết. */
  selectedOnly?: boolean
  /** Nhóm sau lọc UI — nếu có, catalog báo cáo chỉ gồm quyền đang hiển thị. */
  visiblePermissionGroups?: RolePermissionGroup[]
  productLine?: string
}

function resolveCatalogForReport(
  allPermissions: RbacPermission[],
  visiblePermissionGroups?: RolePermissionGroup[],
): RbacPermission[] {
  const catalog = filterReportPermissions(allPermissions)
  if (!visiblePermissionGroups?.length) return catalog
  const visibleCodes = new Set(
    visiblePermissionGroups.flatMap((group) => group.items.map((item) => item.code)),
  )
  return catalog.filter((perm) => visibleCodes.has(perm.code))
}

function appendResourceGroups(
  lines: string[],
  sections: ReportMenuSectionGroup[],
  selectedSet: Set<string>,
  selectedOnly: boolean,
) {
  for (const { section, resourceGroups } of sections) {
    const sectionLines: string[] = []
    for (const group of resourceGroups) {
      const items = selectedOnly
        ? group.items.filter((p) => selectedSet.has(p.code))
        : group.items
      if (selectedOnly && items.length === 0) continue

      const selectedInGroup = items.filter((p) => selectedSet.has(p.code)).length
      const totalLabel = selectedOnly
        ? `${selectedInGroup} quyền`
        : `${selectedInGroup}/${group.items.length}`

      sectionLines.push("", `  [${group.key}] ${group.label} (${totalLabel})`)
      for (const perm of items) {
        const marker = selectedSet.has(perm.code) ? "✓" : " "
        sectionLines.push(
          `    ${marker} ${perm.code} | ${permissionLabelVi(perm.code)}`,
        )
      }
    }
    if (sectionLines.length === 0) continue
    lines.push("", `[${section.label}]`)
    lines.push(...sectionLines)
  }
}

function groupSelectedByAction(
  selectedCodes: Set<string>,
  catalogPermissions: RbacPermission[],
): Array<{ action: string; label: string; codes: string[] }> {
  const buckets = new Map<string, string[]>()
  for (const perm of catalogPermissions) {
    if (!selectedCodes.has(perm.code)) continue
    const action = permissionActionKey(perm.code)
    const arr = buckets.get(action)
    if (arr) arr.push(perm.code)
    else buckets.set(action, [perm.code])
  }
  return Array.from(buckets.entries())
    .map(([action, codes]) => ({
      action,
      label: permissionActionLabelVi(action),
      codes: sortReportPermissionCodes(codes),
    }))
    .sort((a, b) => compareActionKeys(a.action, b.action))
}

export function buildRolePermissionsCodesCopyText(
  codes: string[],
  format: "lines" | "json" | "csv" = "lines",
): string {
  const sorted = sortReportPermissionCodes(filterReportPermissionCodes(codes))
  if (format === "json") {
    return JSON.stringify(sorted, null, 2)
  }
  if (format === "csv") {
    return sorted.join(", ")
  }
  return sorted.join("\n")
}

export function buildRolePermissionCopyReport(
  input: BuildRolePermissionCopyReportInput,
): string {
  const {
    role,
    allPermissions,
    visiblePermissionGroups,
    selectedOnly = true,
    productLine = "hub-parent",
  } = input

  const catalogPermissions = resolveCatalogForReport(
    allPermissions,
    visiblePermissionGroups,
  )
  const catalogCodes = new Set(catalogPermissions.map((p) => p.code))
  const selectedSet = new Set(
    filterReportPermissionCodes(role.permissions).filter((code) =>
      catalogCodes.has(code),
    ),
  )
  const assignedCount = role.permissions.filter((code: string) =>
    selectedSet.has(code),
  ).length

  const missingFromCatalog = sortReportPermissionCodes(
    filterReportPermissionCodes(role.permissions).filter(
      (code) => !catalogCodes.has(code),
    ),
  )
  const unassignedInCatalog = sortReportPermissionCodes(
    catalogPermissions
      .map((p) => p.code)
      .filter((code) => !selectedSet.has(code)),
  )
  const menuSections = buildReportMenuSectionGroups(catalogPermissions)

  const lines: string[] = [
    `BÁO CÁO VAI TRÒ & QUYỀN — ${resolveAdminPortalLabel()}`,
    "",
    `Product line: ${productLine}`,
    `Thời gian: ${new Date().toISOString()}`,
    "",
    "── Thông tin vai trò ──",
    `ID: ${role.id}`,
    `Mã vai trò: ${role.code}`,
    `Tên hiển thị: ${role.name}`,
    `Mô tả: ${role.description?.trim() || "(trống)"}`,
    `Trạng thái: ${role.isActive ? "active" : "inactive"}`,
    `Đã gán: ${assignedCount}/${catalogPermissions.length} quyền catalog`,
  ]
  if (missingFromCatalog.length > 0) {
    lines.push(
      "",
      "⚠ Quyền gán nhưng không có trong catalog hiện tại:",
      ...missingFromCatalog.map((code) => `  - ${code}`),
    )
  }

  if (unassignedInCatalog.length > 0) {
    lines.push(
      "",
      `── Quyền chưa gán (${unassignedInCatalog.length}/${catalogPermissions.length} catalog) ──`,
    )
    const unassignedSet = new Set(unassignedInCatalog)
    for (const { section, resourceGroups } of menuSections) {
      const sectionLines: string[] = []
      for (const group of resourceGroups) {
        const items = group.items.filter((p) => unassignedSet.has(p.code))
        if (items.length === 0) continue
        sectionLines.push("", `  [${group.key}] ${group.label} (${items.length})`)
        for (const perm of items) {
          sectionLines.push(
            `    - ${perm.code} | ${permissionLabelVi(perm.code)}`,
          )
        }
      }
      if (sectionLines.length === 0) continue
      lines.push("", `[${section.label}]`)
      lines.push(...sectionLines)
    }
  }

  lines.push("", "── Quyền theo nhóm menu ──")
  appendResourceGroups(lines, menuSections, selectedSet, selectedOnly)

  lines.push("", "── Quyền theo thao tác (action) ──")
  const byAction = groupSelectedByAction(selectedSet, catalogPermissions)
  for (const bucket of byAction) {
    lines.push("", `[${bucket.action}] ${bucket.label} (${bucket.codes.length})`)
    for (const code of bucket.codes) {
      lines.push(`  - ${code} | ${permissionLabelVi(code)}`)
    }
  }

  lines.push(
    "",
    "── JSON gán quyền (bootstrap / so sánh) ──",
    JSON.stringify(
      {
        code: role.code,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        permissions: sortReportPermissionCodes(
          filterReportPermissionCodes(role.permissions),
        ),
      },
      null,
      2,
    ),
  )
  lines.push(
    "",
    "Ghi chú: Dùng để so sánh preset role hub-parent — diff theo nhóm menu hoặc action.",
    `Quyền loại trừ khỏi báo cáo (${[...PERMISSION_REPORT_EXCLUDED_RESOURCES].join(", ")}).`,
  )

  return lines.join("\n")
}

export { buildPermissionGroups } from "./permission-report-groups"