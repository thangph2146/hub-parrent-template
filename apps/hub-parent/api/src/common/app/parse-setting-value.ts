/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** Giá trị settings từ DB có thể bị JSON double-encode (MikroORM type:json). */
export function parseSettingValue(raw: unknown, fallback: string): string {
  if (raw === '') return '';
  if (raw == null) return fallback;

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' ? parsed : raw;
    } catch {
      return raw;
    }
  }

  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw);
  }

  return fallback;
}
