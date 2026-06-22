/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import * as path from 'path';

const UPLOADS_PATH_MARKERS = ['/api/uploads/', '/uploads/'] as const;

/** Chuẩn hóa orderId cho tên folder trên disk. */
export function sanitizeOrderFolderSegment(orderId: string): string {
  const trimmed = orderId.trim();
  if (!trimmed) return 'unknown-order';
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

/**
 * Trích relativePath kho lưu trữ từ URL/path ảnh sản phẩm.
 * Trả null nếu là URL ngoài (CDN, hub.edu.vn, …) — caller giữ nguyên URL gốc.
 */
export function extractStorageRelativePathFromAssetRef(
  assetRef: string,
): string | null {
  const trimmed = assetRef.trim();
  if (!trimmed) return null;

  const withoutQuery = trimmed.split('?')[0]?.split('#')[0] ?? trimmed;

  if (withoutQuery.startsWith('/api/uploads/')) {
    return withoutQuery.slice('/api/uploads/'.length);
  }
  if (withoutQuery.startsWith('api/uploads/')) {
    return withoutQuery.slice('api/uploads/'.length);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    for (const marker of UPLOADS_PATH_MARKERS) {
      const idx = trimmed.indexOf(marker);
      if (idx >= 0) {
        const rest = trimmed
          .slice(idx + marker.length)
          .split('?')[0]
          ?.split('#')[0];
        return rest ? decodeURIComponent(rest) : null;
      }
    }
    return null;
  }

  if (
    withoutQuery.startsWith('images/') ||
    withoutQuery.startsWith('files/') ||
    withoutQuery.startsWith('videos/') ||
    withoutQuery.startsWith('audio/')
  ) {
    return withoutQuery.replace(/^\//, '');
  }

  return null;
}

export function buildOrderSnapshotFolderRelativePath(orderId: string): string {
  return `images/orders/${sanitizeOrderFolderSegment(orderId)}`;
}

export function buildOrderSnapshotFileName(
  productId: number,
  sku: string,
  ext: string,
  lineIndex = 0,
): string {
  const safeSku =
    sku
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'item';
  const normalizedExt = ext.startsWith('.')
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;
  const suffix = lineIndex > 0 ? `_${lineIndex}` : '';
  return `p${productId}_${safeSku}${suffix}${normalizedExt}`;
}

export function buildOrderSnapshotRelativePath(
  orderId: string,
  productId: number,
  sku: string,
  ext: string,
  lineIndex = 0,
): string {
  const folder = buildOrderSnapshotFolderRelativePath(orderId);
  const fileName = buildOrderSnapshotFileName(productId, sku, ext, lineIndex);
  return path.posix.join(folder, fileName);
}

export type OrderLineSnapshotInput = {
  productId: number;
  sku: string;
  sourceImageRef?: string | null;
};

export type OrderLineSnapshotPlan = OrderLineSnapshotInput & {
  lineIndex: number;
  sourceRelativePath: string | null;
  destinationRelativePath: string | null;
};

/** Lập kế hoạch copy ảnh từng dòng — dùng khi checkout tạo đơn. */
export function planOrderLineImageSnapshots(
  orderId: string,
  lines: OrderLineSnapshotInput[],
): OrderLineSnapshotPlan[] {
  return lines.map((line, lineIndex) => {
    const sourceImageRef = line.sourceImageRef?.trim() ?? '';
    const sourceRelativePath = sourceImageRef
      ? extractStorageRelativePathFromAssetRef(sourceImageRef)
      : null;

    let destinationRelativePath: string | null = null;
    if (sourceRelativePath) {
      const ext = path.posix.extname(sourceRelativePath) || '.webp';
      destinationRelativePath = buildOrderSnapshotRelativePath(
        orderId,
        line.productId,
        line.sku,
        ext,
        lineIndex,
      );
    }

    return {
      ...line,
      lineIndex,
      sourceRelativePath,
      destinationRelativePath,
    };
  });
}
