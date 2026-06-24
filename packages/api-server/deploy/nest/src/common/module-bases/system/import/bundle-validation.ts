import { stripLegacyHeroSlideFromBundle } from './helpers';

const MODELS_WITHOUT_ID = new Set(['postCategory', 'postTag']);

export function normalizeImportBundle(
  data: Record<string, any[]>,
  resolveModelName: (key: string) => string | undefined,
  entityByModelName: Record<string, unknown>,
  onUnknownModel?: (key: string, rowCount: number) => void,
): Record<string, any[]> {
  const normalized: Record<string, any[]> = {};
  for (const [key, rows] of Object.entries(data)) {
    const modelName = resolveModelName(key) ?? key;
    if (!Array.isArray(rows)) continue;
    if (!entityByModelName[modelName]) {
      onUnknownModel?.(key, rows.length);
      continue;
    }
    normalized[modelName] = [...(normalized[modelName] ?? []), ...rows];
  }
  return normalized;
}

/**
 * Backup hợp lệ phải có dữ liệu field thật. File export lỗi có row rỗng hoặc thiếu id
 * sẽ xóa dữ liệu cũ rồi nạp bản ghi rỗng nếu không chặn.
 */
export function assertRestorableImportBundle(
  data: Record<string, any[]>,
): void {
  for (const [modelName, rows] of Object.entries(data)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const emptyRows = rows.filter(
      (row) =>
        row != null &&
        typeof row === 'object' &&
        !Array.isArray(row) &&
        Object.keys(row as Record<string, unknown>).length === 0,
    ).length;

    if (emptyRows > 0) {
      throw new Error(
        `File import không hợp lệ: bảng/model "${modelName}" có ${emptyRows}/${rows.length} dòng rỗng. Vui lòng export lại bằng phiên bản mới trước khi import.`,
      );
    }

    if (MODELS_WITHOUT_ID.has(modelName)) continue;

    const missingIdRows = rows.filter((row) => {
      if (row == null || typeof row !== 'object' || Array.isArray(row)) {
        return true;
      }
      const record = row as Record<string, unknown>;
      return record.id == null || String(record.id).trim() === '';
    }).length;

    if (missingIdRows > 0) {
      throw new Error(
        `File import không hợp lệ: bảng/model "${modelName}" có ${missingIdRows}/${rows.length} dòng thiếu khóa chính "id". Vui lòng export lại bằng phiên bản mới trước khi import.`,
      );
    }
  }
}

/** Chuẩn hóa + validate payload trước khi import. */
export function prepareImportPayload(
  data: Record<string, any[]>,
  resolveModelName: (key: string) => string | undefined,
  entityByModelName: Record<string, unknown>,
  log: { warn: (message: string) => void; log: (message: string) => void },
): Record<string, any[]> {
  const normalized = normalizeImportBundle(
    data,
    resolveModelName,
    entityByModelName,
    (key, count) =>
      log.warn(
        `Import: bỏ qua model "${key}" (${count} bản ghi) vì API hiện tại không có entity tương ứng.`,
      ),
  );
  assertRestorableImportBundle(normalized);
  const droppedHero = stripLegacyHeroSlideFromBundle(
    normalized as Record<string, unknown>,
  );
  if (droppedHero > 0) {
    log.log(
      `Import: bỏ key heroSlide (${droppedHero} bản ghi legacy — không còn bảng).`,
    );
  }
  return normalized;
}
