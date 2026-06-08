const INVALID_FOLDER_SEGMENT = /^\.{1,2}$/;

/** Ký tự cấm trên Windows / path traversal — giữ Unicode (tiếng Việt). */
// eslint-disable-next-line no-control-regex -- loại control chars khỏi tên folder
const FORBIDDEN_FOLDER_CHARS = /[\x00-\x1f\x7f\\/:*?"<>|]/g;

export function sanitizeStorageFolderSegment(name: string): string {
  const sanitized = name
    .trim()
    .replace(FORBIDDEN_FOLDER_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized || INVALID_FOLDER_SEGMENT.test(sanitized)) {
    throw new Error('Tên thư mục không hợp lệ');
  }

  return sanitized;
}

/** Chuẩn hóa tên folder (một cấp hoặc nhiều cấp `2026/06/sự kiện 1`). */
export function sanitizeStorageFolderName(name: string): string {
  const normalized = name.trim().replace(/\\/g, '/');
  if (!normalized) {
    throw new Error('Tên thư mục không hợp lệ');
  }

  const segments = normalized
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error('Tên thư mục không hợp lệ');
  }

  return segments.map(sanitizeStorageFolderSegment).join('/');
}
