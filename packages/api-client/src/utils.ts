/**
 * Shared utilities used by both backend admin UI and other consumers.
 * Platform-agnostic helpers (no React / no DOM assumptions).
 */

export interface PagedResult<T> {
  items: T[];
  total: number;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  parentId?: string | null;
  icon?: string | null;
  sortOrder?: number;
  subRows?: CategoryTreeNode[];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FORBIDDEN_FOLDER_CHARS =
  // eslint-disable-next-line no-control-regex -- loại control chars khỏi tên folder
  /[\x00-\x1f\x7f\\/:*?"<>|]/g;

function sanitizeFolderInputSegment(name: string): string {
  return name
    .trim()
    .replace(FORBIDDEN_FOLDER_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlainAsciiPathSegment(segment: string): boolean {
  return (
    /^[a-z0-9][a-z0-9_-]*$/i.test(segment) &&
    // eslint-disable-next-line no-control-regex -- phát hiện ký tự ngoài ASCII
    !/[^\x00-\x7F]/.test(segment)
  );
}

/** Preview slug path khi tạo folder kho lưu trữ (khớp logic API). */
export function resolveStorageFolderSlugPath(folderName: string): {
  slugPath: string;
  leafLabel: string;
} | null {
  const normalized = folderName.trim().replace(/\\/g, "/");
  if (!normalized) return null;

  const segments = normalized
    .split("/")
    .map((segment) => sanitizeFolderInputSegment(segment))
    .filter(Boolean);

  if (!segments.length) return null;

  const resolved = segments.map((label) => {
    const slugCandidate = slugify(label);
    const slug = isPlainAsciiPathSegment(label)
      ? label.toLowerCase().replace(/_/g, "-")
      : slugCandidate;
    return { slug: slug || label, label };
  });

  return {
    slugPath: resolved.map((entry) => entry.slug).join("/"),
    leafLabel: resolved[resolved.length - 1]?.label ?? "",
  };
}

export function formatDateTime(value: string): string {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    }
  } catch {
    // Ignore
  }
  return "";
}

function sortCategoryTreeNodes<T extends CategoryTreeNode>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => {
      const sortDelta = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (sortDelta !== 0) return sortDelta;
      return a.name.localeCompare(b.name, "vi");
    })
    .map((item) => ({
      ...item,
      subRows: sortCategoryTreeNodes((item.subRows ?? []) as T[]),
    }));
}

/** Dựng cây danh mục từ danh sách phẳng — luôn so khớp id/parentId dạng string. */
export function buildCategoryTree<T extends CategoryTreeNode>(rows: T[]): T[] {
  const byId = new Map<string, T>();

  for (const row of rows) {
    byId.set(String(row.id), {
      ...row,
      id: String(row.id),
      parentId:
        row.parentId != null && row.parentId !== ""
          ? String(row.parentId)
          : null,
      subRows: [] as T[],
    });
  }

  const roots: T[] = [];
  for (const row of byId.values()) {
    const parentId = row.parentId ?? null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.subRows!.push(row);
      continue;
    }
    roots.push(row);
  }

  return sortCategoryTreeNodes(roots);
}

export function buildCategoryOptionTree(
  rows: CategoryTreeNode[]
): CategoryTreeNode[] {
  return buildCategoryTree(
    rows.map((row) => ({
      ...row,
      id: String(row.id),
      parentId:
        row.parentId != null && row.parentId !== ""
          ? String(row.parentId)
          : null,
    }))
  );
}
