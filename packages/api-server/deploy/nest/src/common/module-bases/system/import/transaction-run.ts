import type { EntityManager, EntityName } from '@mikro-orm/core';
import { isSkippableImportRowError } from './helpers';
import type { LegacyImportIdMap } from './legacy-id-map';
import type { ImportDbDriverFlags } from './transaction-fk';

export type ImportRowError = {
  model: string;
  index: number;
  message: string;
};

export type ImportModelTiming = {
  model: string;
  clearMs: number;
  insertMs: number;
  imported: number;
};

export type ImportInsertStats = {
  imported: number;
  skipped: number;
  total: number;
  insertMs: number;
};

export type ImportTransactionCallbacks = {
  sanitizeRows: (
    em: EntityManager,
    modelName: string,
    rawRecords: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    preserveUserId?: number,
  ) => Promise<Record<string, unknown>[]>;
  insertModel: (
    em: EntityManager,
    modelName: string,
    sanitized: Record<string, unknown>[],
    onRowError: (index: number, message: string) => void,
    ctx: {
      rawRecords: Record<string, unknown>[];
      idMap: LegacyImportIdMap;
    },
  ) => Promise<ImportInsertStats>;
  registerLegacyIds: (
    em: EntityManager,
    modelName: string,
    rawRecords: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    preserveUserId?: number,
  ) => Promise<void>;
  clearModel: (
    em: EntityManager,
    modelName: string,
    flags: ImportDbDriverFlags,
    preserveUserId?: number,
  ) => Promise<void>;
};

export type RunImportTransactionBodyOptions = {
  data: Record<string, any[]>;
  clearOrder: readonly string[];
  importOrder: readonly string[];
  skipClear: boolean;
  preserveUserId?: number;
  entityByModelName: Record<string, EntityName<any>>;
  idMap: LegacyImportIdMap;
  callbacks: ImportTransactionCallbacks;
  rowErrors: ImportRowError[];
  clearMsByModel: Map<string, number>;
  onLog?: (message: string) => void;
  onWarn?: (message: string) => void;
  onClearError?: (modelName: string, error: unknown) => void;
  onImportError?: (modelName: string, error: unknown) => void;
};

/** Clear + insert models trong transaction (FK checks đã tắt ở caller). */
export async function runImportTransactionBody(
  em: EntityManager,
  flags: ImportDbDriverFlags,
  opts: RunImportTransactionBodyOptions,
): Promise<ImportModelTiming[]> {
  const modelTimings: ImportModelTiming[] = [];

  if (!opts.skipClear) {
    for (const mName of opts.clearOrder) {
      try {
        const clearStart = Date.now();
        await opts.callbacks.clearModel(
          em,
          mName,
          flags,
          mName === 'user' ? opts.preserveUserId : undefined,
        );
        const clearMs = Date.now() - clearStart;
        opts.clearMsByModel.set(mName, clearMs);
        opts.onLog?.(`Import clear ${mName}: ${clearMs}ms`);
      } catch (error) {
        opts.onClearError?.(mName, error);
        throw error;
      }
    }
  }

  for (const mName of opts.importOrder) {
    const records = opts.data[mName];
    if (!records?.length) continue;
    if (!opts.entityByModelName[mName]) continue;

    try {
      const rawRecords = records as Record<string, unknown>[];
      const sanitized = await opts.callbacks.sanitizeRows(
        em,
        mName,
        rawRecords,
        opts.idMap,
        opts.preserveUserId,
      );
      const stats = await opts.callbacks.insertModel(
        em,
        mName,
        sanitized,
        (rowIndex, errMsg) => {
          if (!isSkippableImportRowError(errMsg)) {
            opts.rowErrors.push({
              model: mName,
              index: rowIndex,
              message: errMsg,
            });
          }
        },
        { rawRecords, idMap: opts.idMap },
      );
      await opts.callbacks.registerLegacyIds(
        em,
        mName,
        rawRecords,
        opts.idMap,
        opts.preserveUserId,
      );
      if (stats.skipped > 0) {
        opts.onWarn?.(
          `${mName}: imported ${stats.imported}/${stats.total} (${stats.skipped} skipped)`,
        );
      }
      modelTimings.push({
        model: mName,
        clearMs: opts.clearMsByModel.get(mName) ?? 0,
        insertMs: stats.insertMs,
        imported: stats.imported,
      });
    } catch (error) {
      opts.onImportError?.(mName, error);
      throw error;
    }
  }

  return modelTimings;
}

export type ImportDataResponse = {
  success: boolean;
  message: string;
  rowErrors?: ImportRowError[];
  timing?: {
    requestMs: number;
    models: ImportModelTiming[];
  };
};

/** Kết quả import thống nhất — tránh lặp success/message/rowErrors trong service. */
export function buildImportDataResponse(
  rowErrors: ImportRowError[],
  timing?: ImportDataResponse['timing'],
  scope?: 'bundle' | 'user+userRole',
): ImportDataResponse {
  const count = rowErrors.length;
  const errorMsg =
    scope === 'user+userRole'
      ? `Imported user+userRole with ${count} row error(s)`
      : scope === 'bundle'
        ? `Imported bundle with ${count} row error(s)`
        : `Imported with ${count} row error(s)`;
  return {
    success: count === 0,
    message: count > 0 ? errorMsg : 'Data imported successfully',
    rowErrors: count > 0 ? rowErrors : undefined,
    timing,
  };
}
