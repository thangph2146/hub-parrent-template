import {
  buildAdminTableXlsxExport,
  type AdminTableExportTemplateId,
  type AdminTableXlsxExportOptions,
} from "@ui/components/admin"
import {
  ADMIN_LIST_EXPORT_FETCH_LIMIT,
  fetchAllAdminList,
  type AdminListPageResult,
} from "./fetch-all-admin-list"

export function adminTableStorageKeys(scope: string) {
  return {
    filterColumnVisibilityKey: `${scope}-table-filters`,
    tableColumnVisibilityKey: `${scope}-table-columns`,
  } as const
}

export function createAdminShowAllHandler(
  total: number,
  setPage: (page: number) => void,
  setPageSize: (size: number) => void,
) {
  return () => {
    setPage(1)
    setPageSize(Math.min(total, ADMIN_LIST_EXPORT_FETCH_LIMIT))
  }
}

type BuildExportOpts<T> = AdminTableXlsxExportOptions & {
  fetchPage?: (params: {
    page: number
    limit: number
  }) => Promise<AdminListPageResult<T>>
}

/** Xuất Excel + tùy chọn tải toàn bộ từ API phân trang. */
export function buildAdminTableExportConfig<T>(
  templateId: AdminTableExportTemplateId,
  options: BuildExportOpts<T>,
) {
  const base = buildAdminTableXlsxExport(templateId, options)
  if (!options.fetchPage) return base
  return {
    ...base,
    fetchAllForExport: () =>
      fetchAllAdminList(options.fetchPage!, ADMIN_LIST_EXPORT_FETCH_LIMIT),
  }
}
