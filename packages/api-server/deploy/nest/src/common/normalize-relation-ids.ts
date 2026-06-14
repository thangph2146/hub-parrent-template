/** Chuẩn hóa mảng id quan hệ từ body admin (string, number hoặc object có `id`). */
export function normalizeRelationIds(
  value: unknown,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    const arr = value
      .map((item) => {
        if (item == null) return '';
        const obj = item as Record<string, unknown>;
        if (typeof item === 'object' && 'id' in obj && obj.id != null) {
          const id = obj.id;
          if (typeof id === 'string' || typeof id === 'number') {
            return String(id).trim();
          }
          if (typeof id === 'boolean') return String(id);
          return '';
        }
        return typeof item === 'string' || typeof item === 'number'
          ? String(item).trim()
          : '';
      })
      .filter((id) => id !== '');
    return arr;
  }
  if (typeof value === 'string' && value.trim() !== '') return [value.trim()];
  return undefined;
}
