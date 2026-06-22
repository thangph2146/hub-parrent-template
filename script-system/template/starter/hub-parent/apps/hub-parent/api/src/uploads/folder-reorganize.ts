/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
export type FlattenDatePathResult = {
  from: string;
  to: string;
  dateSegments: number;
};

export function isYearSegment(segment: string): boolean {
  return /^\d{4}$/.test(segment);
}

export function isMonthSegment(segment: string): boolean {
  return /^(0[1-9]|1[0-2])$/.test(segment);
}

export function isDaySegment(segment: string): boolean {
  return /^(0[1-9]|[12]\d|3[01])$/.test(segment);
}

/** Đếm số segment YYYY[/MM[/DD]] liên tiếp ở cuối đường dẫn thư mục. */
export function countTrailingDateSegments(folderParts: string[]): number {
  const parts = folderParts.filter(Boolean);
  if (!parts.length) return 0;

  const last = parts[parts.length - 1];
  if (!last) return 0;

  if (
    parts.length >= 3 &&
    isYearSegment(parts[parts.length - 3]) &&
    isMonthSegment(parts[parts.length - 2]) &&
    isDaySegment(last)
  ) {
    return 3;
  }
  if (
    parts.length >= 2 &&
    isYearSegment(parts[parts.length - 2]) &&
    isMonthSegment(last)
  ) {
    return 2;
  }
  if (isYearSegment(last)) {
    return 1;
  }
  return 0;
}

/** Gỡ YYYY/MM/DD hoặc YYYY/MM hoặc YYYY — đưa file về folder chính. */
export function flattenDateStoragePath(
  relativePath: string,
): FlattenDatePathResult | null {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\//, '');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length < 2) return null;

  const fileName = parts[parts.length - 1];
  const folderParts = parts.slice(0, -1);
  const dateSegments = countTrailingDateSegments(folderParts);
  if (dateSegments === 0) return null;

  const mainFolderParts = folderParts.slice(0, -dateSegments);
  const toParts = [...mainFolderParts, fileName];
  const to = toParts.join('/');
  if (!to || to === normalized) return null;

  return { from: normalized, to, dateSegments };
}

export function isUnderReorganizeScope(
  relativePath: string,
  scopePath?: string,
): boolean {
  if (!scopePath?.trim()) return true;
  const scope = scopePath.trim().replace(/\\/g, '/').replace(/\/$/, '');
  const normalized = relativePath.replace(/\\/g, '/');
  return normalized === scope || normalized.startsWith(`${scope}/`);
}

export function uniqueFlattenTargetPath(
  target: string,
  used: Set<string>,
): string {
  if (!used.has(target)) {
    used.add(target);
    return target;
  }
  const dot = target.lastIndexOf('.');
  const stem = dot > 0 ? target.slice(0, dot) : target;
  const ext = dot > 0 ? target.slice(dot) : '';
  let index = 2;
  let candidate = `${stem}-${index}${ext}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${stem}-${index}${ext}`;
  }
  used.add(candidate);
  return candidate;
}

export function collectDateFolderCleanupPaths(
  relativePaths: string[],
): string[] {
  const dirs = new Set<string>();
  for (const relativePath of relativePaths) {
    const normalized = relativePath.replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 2) continue;
    const folderParts = parts.slice(0, -1);
    const dateSegments = countTrailingDateSegments(folderParts);
    if (dateSegments === 0) continue;
    const dateFolders = folderParts.slice(-dateSegments);
    const prefixParts = folderParts.slice(0, -dateSegments);
    let current = prefixParts.join('/');
    for (const segment of dateFolders) {
      current = current ? `${current}/${segment}` : segment;
      dirs.add(current);
    }
  }
  return [...dirs].sort((a, b) => b.length - a.length);
}
