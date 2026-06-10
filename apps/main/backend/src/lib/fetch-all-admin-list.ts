/** Giới hạn tải toàn bộ danh sách admin (khớp `ADMIN_TABLE_EXPORT_MAX_LIMIT` trên API). */
export const ADMIN_LIST_EXPORT_FETCH_LIMIT = 5000

export type AdminListPageResult<T> = {
  items: T[]
  total: number
}

/**
 * Gọi API phân trang một lần với limit cao để xuất Excel / hiển thị đầy đủ.
 * Truyền vào `xlsxExport.fetchAllForExport` của AdminDataTable.
 */
export async function fetchAllAdminList<T>(
  fetchPage: (params: {
    page: number
    limit: number
  }) => Promise<AdminListPageResult<T>>,
  limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
): Promise<T[]> {
  const first = await fetchPage({ page: 1, limit })
  if (first.total <= first.items.length) return first.items

  const pages = Math.ceil(first.total / limit)
  const all = [...first.items]
  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchPage({ page, limit })
    all.push(...next.items)
  }
  return all
}
