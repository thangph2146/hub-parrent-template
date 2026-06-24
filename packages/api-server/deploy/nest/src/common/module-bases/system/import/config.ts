import { IMPORT_MODEL_BUNDLES } from './order';
import {
  getImportReferenceFilePath,
  loadImportReferenceManifest,
} from './reference';

export function aliasImportConfigByTableName<T extends Record<string, unknown>>(
  byModel: T,
  getModelTableName: (modelName: string) => string,
): T {
  const out: Record<string, unknown> = { ...byModel };
  for (const [modelName, value] of Object.entries(byModel)) {
    const table = getModelTableName(modelName);
    if (table && table !== modelName) {
      out[table] = value;
    }
  }
  return out as T;
}

/** Cấu hình import theo lô — client chia file JSON/Excel thành nhiều request nhỏ. */
export function buildSystemImportConfig(
  modelOrder: readonly string[],
  getModelTableName: (modelName: string) => string,
) {
  const rowChunkSize = Math.max(
    1,
    parseInt(
      process.env.SYSTEM_IMPORT_ROW_CHUNK_SIZE ||
        process.env.SYSTEM_IMPORT_DB_BATCH_SIZE ||
        '500',
      10,
    ) || 500,
  );
  const postChunkRaw = process.env.SYSTEM_IMPORT_CLIENT_CHUNK_POST?.trim();
  const postChunk = postChunkRaw
    ? Math.max(1, parseInt(postChunkRaw, 10) || rowChunkSize)
    : Math.max(
        1,
        parseInt(process.env.SYSTEM_IMPORT_POST_BATCH_SIZE || '5', 10) || 5,
      );
  const contactChunk = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_CLIENT_CHUNK_CONTACT || '800', 10) ||
      800,
  );
  const notificationChunk = Math.max(
    1,
    parseInt(
      process.env.SYSTEM_IMPORT_CLIENT_CHUNK_NOTIFICATION || '400',
      10,
    ) || 400,
  );
  const sessionChunk = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_CLIENT_CHUNK_SESSION || '500', 10) ||
      500,
  );
  const parallelChunkConcurrency = Math.max(
    1,
    parseInt(process.env.SYSTEM_IMPORT_PARALLEL_CHUNKS || '3', 10) || 3,
  );
  const reference = loadImportReferenceManifest();
  const modelTableNames: Record<string, string> = {};
  for (const modelName of modelOrder) {
    modelTableNames[modelName] = getModelTableName(modelName);
  }
  const modelChunkSizesByModel = {
    post: postChunk,
    contactRequest: contactChunk,
    notification: notificationChunk,
    session: sessionChunk,
  };
  const modelParallelByModel = {
    post: 1,
    contactRequest: parallelChunkConcurrency,
    notification: 1,
    session: 1,
  };
  const postPayloadChunkBytes = Math.max(
    256 * 1024,
    parseInt(
      process.env.SYSTEM_IMPORT_POST_PAYLOAD_MAX_BYTES ||
        String(2 * 1024 * 1024),
      10,
    ) || 2 * 1024 * 1024,
  );
  return {
    modelOrder: [...modelOrder],
    modelTableNames,
    bundles: aliasImportConfigByTableName(
      { ...IMPORT_MODEL_BUNDLES },
      getModelTableName,
    ),
    rowChunkSize,
    modelChunkSizes: aliasImportConfigByTableName(
      modelChunkSizesByModel,
      getModelTableName,
    ),
    parallelChunkConcurrency,
    postPayloadChunkBytes,
    modelParallelConcurrency: aliasImportConfigByTableName(
      modelParallelByModel,
      getModelTableName,
    ),
    reference: reference
      ? {
          source: reference.source,
          exportedAt: reference.exportedAt,
          description: reference.description,
          expectedCounts: { ...reference.expectedCounts },
          file: getImportReferenceFilePath(),
        }
      : null,
    recommendedExportFile: reference?.source ?? 'full-export-2026-06-10.json',
  };
}
