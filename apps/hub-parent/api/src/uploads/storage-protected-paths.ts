/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Thư mục snapshot ảnh đơn hàng — chỉ ghi nội bộ lúc checkout, không xóa qua admin. */
export const ORDER_SNAPSHOT_IMAGES_PREFIX = 'images/orders';

function normalizeStorageRelativePath(relativePath: string): string {
  return relativePath
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

/** Path nằm trong vùng snapshot đơn hàng (folder gốc hoặc con). */
export function isProtectedStorageRelativePath(relativePath: string): boolean {
  const clean = normalizeStorageRelativePath(relativePath);
  if (!clean) return false;
  return (
    clean === ORDER_SNAPSHOT_IMAGES_PREFIX ||
    clean.startsWith(`${ORDER_SNAPSHOT_IMAGES_PREFIX}/`)
  );
}

export function assertStoragePathMutable(relativePath: string): void {
  if (isProtectedStorageRelativePath(relativePath)) {
    throw new Error(
      'Không thể xóa hoặc sửa thư mục snapshot đơn hàng (images/orders/)',
    );
  }
}
