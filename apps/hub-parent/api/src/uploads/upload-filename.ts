/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Chuẩn hóa user id để dùng trong tên file trên disk. */
export function sanitizeUploadUserId(userId: string): string {
  const trimmed = userId.trim();
  if (!trimmed) return '';
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

/** Tên file lưu disk: `{userId}_{baseName}_{timestamp}{ext}` khi có userId. */
export function buildStoredUploadFileName(
  baseName: string,
  ext: string,
  options?: { userId?: string; timestamp?: number },
): string {
  const safeBase = baseName || 'file';
  const stamp = options?.timestamp ?? Date.now();
  const safeUser = options?.userId ? sanitizeUploadUserId(options.userId) : '';
  if (safeUser) {
    return `${safeUser}_${safeBase}_${stamp}${ext}`;
  }
  return `${safeBase}_${stamp}${ext}`;
}

const UPLOAD_STAMP_SUFFIX_RE = /^(.+)_(\d{10,13})(\.[^.]+)$/i;

/**
 * Trích prefix userId từ tên file (chủ ảnh / đại diện) — không dùng làm người upload.
 * Người upload thực tế lưu trong bảng `storage_files`.
 */
export function extractUploadOwnerIdFromFileName(
  fileName: string,
): string | null {
  const base = fileName.replace(/\\/g, '/').split('/').pop() ?? fileName;
  const match = base.match(UPLOAD_STAMP_SUFFIX_RE);
  if (!match?.[1]) return null;
  const body = match[1];

  const uuidMatch = body.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})_(.+)$/i,
  );
  if (uuidMatch?.[1]) return uuidMatch[1];

  const underscore = body.indexOf('_');
  if (underscore <= 0) return null;
  const candidate = body.slice(0, underscore);
  if (!/^[a-zA-Z0-9_-]{2,64}$/.test(candidate)) return null;
  return candidate;
}

/** ID dùng trong tên file ảnh — ưu tiên chủ sở hữu (ảnh đại diện), fallback người upload. */
export function resolveImageFileOwnerId(
  ownerUserId?: string,
  uploaderUserId?: string,
): string | undefined {
  const owner = ownerUserId?.trim();
  if (owner) return owner;
  const uploader = uploaderUserId?.trim();
  return uploader || undefined;
}

/** Prefix để tìm file trùng baseName (bỏ qua timestamp cuối). */
export function storedUploadFilePrefix(
  baseName: string,
  options?: { userId?: string },
): string {
  const safeBase = baseName || 'file';
  const safeUser = options?.userId ? sanitizeUploadUserId(options.userId) : '';
  if (safeUser) {
    return `${safeUser}_${safeBase}_`;
  }
  return `${safeBase}_`;
}
