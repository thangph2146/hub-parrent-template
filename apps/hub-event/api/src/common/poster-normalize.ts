/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Trích URL poster thuần; chuẩn hóa metadata `{ url }` khi lưu/đọc DB. */
export function unwrapPosterUrl(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.url === 'string') return unwrapPosterUrl(record.url);
    if (typeof record.src === 'string') return unwrapPosterUrl(record.src);
    return null;
  }

  if (typeof value !== 'string') return null;

  let trimmed = value.trim();
  if (!trimmed) return null;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) break;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === 'string') {
        trimmed = parsed.trim();
        continue;
      }
      if (parsed && typeof parsed === 'object') {
        const record = parsed as Record<string, unknown>;
        if (typeof record.url === 'string') {
          trimmed = record.url.trim();
          continue;
        }
        if (typeof record.src === 'string') {
          trimmed = record.src.trim();
          continue;
        }
      }
      break;
    } catch {
      break;
    }
  }

  return trimmed;
}

export function normalizePosterField(poster: unknown): { url: string } | null {
  const raw = unwrapPosterUrl(poster);
  if (!raw) return null;
  return { url: raw.replace(/\/api\/api\//g, '/api/') };
}
