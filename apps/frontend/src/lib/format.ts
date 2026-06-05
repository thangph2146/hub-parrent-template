/** Format a numeric VND amount as "1.250.000đ". */
export const formatVND = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || Number.isNaN(amount))
    return "—"
  return `${amount.toLocaleString("vi-VN")}đ`
}

/** Format an ISO date as "HH:mm dd/MM/yyyy" in vi-VN. */
export const formatDate = (iso: string | Date | undefined | null): string => {
  if (!iso) return "—"
  const date = iso instanceof Date ? iso : new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes} ${day}/${month}/${year}`
}

/** Chỉ ngày — dùng cho bảng tóm tắt dữ liệu. */
export const formatDateShort = (
  iso: string | Date | undefined | null
): string => {
  if (!iso) return "—"
  const date = iso instanceof Date ? iso : new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
