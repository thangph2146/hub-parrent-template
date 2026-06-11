export type AdminTrashExportParams = {
  search?: string
  filters?: Record<string, string>
}

/**
 * Tạo `exportFetchPage` cho bảng thùng rác (server pagination) — xuất Excel toàn bộ dữ liệu đã lọc.
 */
export function createAdminTrashExportFetchPage<T>(
  fetchList: (params: {
    page: number
    limit: number
    search?: string
    status: "deleted"
    [key: string]: string | number | undefined
  }) => Promise<{ items: T[]; total: number }>,
  exportParams: AdminTrashExportParams
) {
  return async ({ page, limit }: { page: number; limit: number }) => {
    const result = await fetchList({
      page,
      limit,
      search: exportParams.search,
      status: "deleted",
      ...exportParams.filters,
    })
    return { items: result.items, total: result.total }
  }
}
