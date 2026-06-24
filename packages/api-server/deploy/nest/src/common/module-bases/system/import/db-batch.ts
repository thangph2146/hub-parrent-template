import type { EntityManager, EntityName } from '@mikro-orm/core';
import {
  isSkippableImportRowError,
  reportImportRowError,
} from './helpers';
import { getErrorMessage } from './row-schema';

/** Bảng có cột JSON/text lớn — insertMany từng lô nhỏ ngay. */
export const JSON_HEAVY_IMPORT_MODELS = new Set(['post', 'event']);

export type InsertImportModelRowsOptions = {
  modelName: string;
  entity: EntityName<any>;
  rows: Record<string, unknown>[];
  onRowError?: (index: number, message: string) => void;
  onDebug?: (message: string) => void;
  onWarn?: (message: string) => void;
};

export async function insertImportModelRows(
  em: EntityManager,
  options: InsertImportModelRowsOptions,
): Promise<{ imported: number; skipped: number }> {
  const { modelName, entity, rows, onRowError, onDebug, onWarn } = options;
  const preFilterSkipped = 0;
  let imported = 0;
  let skipped = preFilterSkipped;
  const startTime = Date.now();
  const defaultBatchSize = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_DB_BATCH_SIZE || '500', 10) || 500,
  );
  const jsonChunkSize = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_JSON_BATCH_SIZE || '10', 10) || 10,
  );
  const postBatchSize = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_POST_BATCH_SIZE || '5', 10) || 5,
  );
  const proactiveChunkSize = JSON_HEAVY_IMPORT_MODELS.has(modelName)
    ? Math.min(
        modelName === 'post' ? postBatchSize : jsonChunkSize,
        rows.length,
      )
    : rows.length;

  const insertManyChunks = async (
    chunkRows: object[],
    batchSize: number,
  ): Promise<void> => {
    for (let i = 0; i < chunkRows.length; i += batchSize) {
      const chunk = chunkRows.slice(i, i + batchSize);
      try {
        await em.insertMany(entity, chunk);
        if (JSON_HEAVY_IMPORT_MODELS.has(modelName)) {
          await em.flush();
        }
        imported += chunk.length;
      } catch (inner: unknown) {
        const innerMsg = getErrorMessage(inner);
        onDebug?.(
          `Batch insert failed for ${modelName}, fallback từng dòng: ${innerMsg}`,
        );
        for (const record of chunk) {
          const rowIndex = rows.indexOf(record as Record<string, unknown>);
          try {
            await em.insert(entity, record);
            imported++;
          } catch (rowErr: unknown) {
            skipped++;
            const errMsg = getErrorMessage(rowErr);
            if (!isSkippableImportRowError(errMsg)) {
              reportImportRowError(onRowError, rowIndex, errMsg);
              throw rowErr;
            }
          }
        }
      }
    }
  };

  if (JSON_HEAVY_IMPORT_MODELS.has(modelName)) {
    onDebug?.(
      `${modelName}: insertMany theo lô ${proactiveChunkSize} (JSON-heavy)…`,
    );
    await insertManyChunks(rows as object[], proactiveChunkSize);
  } else if (proactiveChunkSize < rows.length) {
    onDebug?.(`${modelName}: insertMany theo lô ${proactiveChunkSize}…`);
    await insertManyChunks(rows as object[], proactiveChunkSize);
  } else {
    try {
      await em.insertMany(entity, rows as object[]);
      imported = rows.length;
    } catch (e: unknown) {
      const message = getErrorMessage(e);
      onWarn?.(
        `insertMany toàn bộ ${modelName} thất bại (${message}), thử theo lô nhỏ hơn…`,
      );
      await insertManyChunks(rows as object[], defaultBatchSize);
    }
  }

  onDebug?.(
    `Imported ${imported}/${rows.length} records into ${modelName} in ${Date.now() - startTime}ms${skipped > 0 ? ` (${skipped} skipped)` : ''}`,
  );
  return { imported, skipped };
}
