/** Format VND — đồng bộ storefront + admin (`1.250.000đ`). */
export function formatProductVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—"
  }
  return `${amount.toLocaleString("vi-VN")}đ`
}
