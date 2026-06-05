/** Giới hạn tải toàn bộ danh sách (khớp API admin export). */
export const ADMIN_PAGED_LIST_FETCH_LIMIT = 5000

export type PagedListResult<T> = {
  items: T[]
  total: number
}

/**
 * Gọi API phân trang để lấy đủ bản ghi (xuất Excel / hiển thị tất cả).
 */
export async function fetchAllPagedList<T>(
  fetchPage: (params: {
    page: number
    limit: number
  }) => Promise<PagedListResult<T>>,
  limit = ADMIN_PAGED_LIST_FETCH_LIMIT,
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
