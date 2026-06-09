const INVALID_FOLDER_SEGMENT = /^\.{1,2}$/;

/** Ký tự cấm trên Windows / path traversal — giữ Unicode (tiếng Việt) khi nhập label. */
// eslint-disable-next-line no-control-regex -- loại control chars khỏi tên folder
const FORBIDDEN_FOLDER_CHARS = /[\x00-\x1f\x7f\\/:*?"<>|]/g;

/** Giống slug bài viết — dùng cho segment path trên disk / URL. */
export function slugifyStorageFolderSegment(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isPlainAsciiPathSegment(segment: string): boolean {
  return (
    /^[a-z0-9][a-z0-9_-]*$/i.test(segment) &&
    // eslint-disable-next-line no-control-regex -- phát hiện ký tự ngoài ASCII
    !/[^\x00-\x7F]/.test(segment)
  );
}

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

export function resolveStorageFolderSegment(displaySegment: string): {
  slug: string;
  label: string;
} {
  const label = sanitizeStorageFolderSegment(displaySegment);
  const slugCandidate = slugifyStorageFolderSegment(label);
  if (!slugCandidate) {
    throw new Error('Tên thư mục không hợp lệ');
  }

  const slug = isPlainAsciiPathSegment(label)
    ? label.toLowerCase().replace(/_/g, '-')
    : slugCandidate;

  return { slug, label };
}

/** Map tên hiển thị → slug path (disk/URL) + label cấp lá. */
export function resolveStorageFolderSlugPath(folderName: string): {
  slugPath: string;
  leafLabel: string;
} {
  const normalized = folderName.trim().replace(/\\/g, '/');
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

  const resolved = segments.map((segment) =>
    resolveStorageFolderSegment(segment),
  );
  return {
    slugPath: resolved.map((entry) => entry.slug).join('/'),
    leafLabel: resolved[resolved.length - 1]?.label ?? '',
  };
}

/** Chuẩn hóa tên folder nhập vào → slug path trên disk (vd. Sự kiện 1 → su-kien-1). */
export function sanitizeStorageFolderName(name: string): string {
  return resolveStorageFolderSlugPath(name).slugPath;
}
