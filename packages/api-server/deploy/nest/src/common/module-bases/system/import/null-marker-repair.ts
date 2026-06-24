import type { EntityManager } from '@mikro-orm/core';
import { EXCEL_NULL_MARKER } from './value-coerce';

const REPAIRABLE_NULL_MARKER_MODELS = new Set([
  'role',
  'user',
  'category',
  'tag',
  'post',
  'contactRequest',
  'seoMeta',
  'pageContent',
]);

const DEFAULT_REPAIR_TABLES = [
  'roles',
  'users',
  'categories',
  'tags',
  'posts',
  'contact_requests',
  'seo_metas',
  'page_contents',
];

export function resolveRepairNullMarkerTables(
  importedModelNames: string[] | undefined,
  getModelTableName: (modelName: string) => string,
): string[] {
  if (!importedModelNames?.length) {
    return DEFAULT_REPAIR_TABLES;
  }
  return [
    ...new Set(
      importedModelNames
        .filter((m) => REPAIRABLE_NULL_MARKER_MODELS.has(m))
        .map((m) => getModelTableName(m)),
    ),
  ];
}

export async function repairImportNullMarkerValues(
  em: EntityManager,
  importedModelNames: string[] | undefined,
  getModelTableName: (modelName: string) => string,
  onLog?: (message: string) => void,
  onWarn?: (message: string) => void,
): Promise<void> {
  const conn = em.getConnection();
  const driverName = em.getDriver().constructor.name;
  if (!/mysql|mariadb/i.test(driverName)) return;

  const tables = resolveRepairNullMarkerTables(
    importedModelNames,
    getModelTableName,
  );
  for (const table of tables) {
    try {
      const tableStarted = Date.now();
      const countRows = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM \`${table}\` WHERE \`deletedAt\` = ? LIMIT 1`,
        [EXCEL_NULL_MARKER],
      );
      const needRepair = Number(
        (countRows as { cnt?: number }[] | { cnt?: number })?.[0]?.cnt ??
          (countRows as { cnt?: number })?.cnt ??
          0,
      );
      if (needRepair <= 0) continue;

      const updated = await conn.execute(
        `UPDATE \`${table}\` SET \`deletedAt\` = NULL WHERE \`deletedAt\` = ?`,
        [EXCEL_NULL_MARKER],
      );
      const elapsed = Date.now() - tableStarted;
      const count =
        typeof updated === 'number'
          ? updated
          : Number((updated as { affectedRows?: number })?.affectedRows ?? 0);
      if (count > 0) {
        onLog?.(
          `Import repair: ${table}.deletedAt — đã chuyển ${count} giá trị ${EXCEL_NULL_MARKER} → NULL (${elapsed}ms).`,
        );
      } else if (elapsed > 200) {
        onWarn?.(
          `Import repair: ${table}.deletedAt — 0 dòng, nhưng mất ${elapsed}ms (có thể chờ lock).`,
        );
      }
    } catch {
      /* bảng/cột có thể không tồn tại trên product line */
    }
  }
  em.clear();
}
