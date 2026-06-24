import {
  appendImportBundleToPayload,
  orderModelsForDependencySafeImport,
} from './order';
import { getErrorMessage } from './row-schema';

export type ImportRowError = {
  model: string;
  index: number;
  message: string;
};

export type ImportOneModelResult = {
  success?: boolean;
  message?: string;
  rowErrors?: ImportRowError[];
};

export type ImportByModelsModelResult = {
  model: string;
  success: boolean;
  result?: ImportOneModelResult;
  error?: unknown;
};

export type ImportByModelsResult = {
  success: boolean;
  message: string;
  results?: ImportByModelsModelResult[];
  failed?: string[];
};

export type RunImportByModelsDeps = {
  data: Record<string, any[]>;
  modelOrder: readonly string[];
  hasEntity: (model: string) => boolean;
  skipClear: boolean;
  onProgress?: (event: object) => void;
  importOne: (
    payload: Record<string, any[]>,
    targetModel: string,
  ) => Promise<ImportOneModelResult>;
  onInfo?: (message: string) => void;
  onModelStart?: (model: string, recordCount: number) => void;
  onModelSuccess?: (model: string) => void;
  onModelFailure?: (model: string, error: unknown) => void;
};

/** Import full backup — một HTTP request / model (client chunked). */
export async function runImportDataByModels(
  deps: RunImportByModelsDeps,
): Promise<ImportByModelsResult> {
  deps.onInfo?.(
    'Importing data theo từng model (một request HTTP / model từ client)…',
  );

  const results: ImportByModelsModelResult[] = [];
  const presentModels = deps.modelOrder.filter(
    (m) =>
      deps.hasEntity(m) &&
      Array.isArray(deps.data[m]) &&
      deps.data[m].length > 0,
  );
  const ordered = orderModelsForDependencySafeImport(
    presentModels,
    deps.modelOrder,
  );
  const skipModels = new Set<string>();

  const modelRecords = ordered.map((m) => deps.data[m]?.length ?? 0);
  const totalRecords = modelRecords.reduce((a, b) => a + b, 0);

  deps.onProgress?.({
    type: 'start',
    total: ordered.length,
    totalRecords,
    models: ordered,
    records: modelRecords,
  });

  let cumulativeImported = 0;

  for (const modelName of ordered) {
    if (skipModels.has(modelName)) continue;
    const records = deps.data[modelName];
    if (!records?.length) continue;

    try {
      deps.onModelStart?.(modelName, records.length);
      const payload: Record<string, any[]> = { [modelName]: records };
      const bundledModels = appendImportBundleToPayload(
        deps.data,
        modelName,
        payload,
        skipModels,
      );

      deps.onProgress?.({
        type: 'model-start',
        model: modelName,
        records: records.length,
        index: results.length,
        total: ordered.length,
        cumulativeImported,
        totalRecords,
        bundledModels: bundledModels.length ? bundledModels : undefined,
      });

      for (const bundled of bundledModels) {
        deps.onProgress?.({
          type: 'model-start',
          model: bundled,
          bundledWith: modelName,
          records: deps.data[bundled]?.length ?? 0,
          index: results.length,
          total: ordered.length,
          cumulativeImported,
          totalRecords,
        });
      }

      const result = await deps.importOne(payload, modelName);
      const rowErrors = result.rowErrors;
      const importOk = result.success !== false;

      results.push({ model: modelName, success: importOk, result });
      if (importOk) deps.onModelSuccess?.(modelName);

      cumulativeImported +=
        records.length +
        bundledModels.reduce(
          (sum, name) => sum + (deps.data[name]?.length ?? 0),
          0,
        );

      deps.onProgress?.({
        type: 'model-end',
        model: modelName,
        success: importOk,
        records: records.length,
        cumulativeImported,
        totalRecords,
        bundledModels,
        rowErrors: rowErrors?.length ? rowErrors : undefined,
        error: importOk ? undefined : result.message,
      });

      for (const bundled of bundledModels) {
        const bundledRowErrors = rowErrors?.filter((r) => r.model === bundled);
        deps.onProgress?.({
          type: 'model-end',
          model: bundled,
          bundledWith: modelName,
          success: importOk && !bundledRowErrors?.length,
          records: deps.data[bundled]?.length ?? 0,
          cumulativeImported,
          totalRecords,
          rowErrors: bundledRowErrors?.length ? bundledRowErrors : undefined,
          error: bundledRowErrors?.[0]?.message,
        });
      }
    } catch (error) {
      deps.onModelFailure?.(modelName, error);
      results.push({ model: modelName, success: false, error });
      deps.onProgress?.({
        type: 'model-end',
        model: modelName,
        success: false,
        error: getErrorMessage(error),
        cumulativeImported,
        totalRecords,
      });
    }
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      success: false,
      message: `Imported ${results.length - failed.length}/${results.length} models successfully`,
      results,
      failed: failed.map((f) => f.model),
    };
  }

  return {
    success: true,
    message: `Imported ${results.length} models successfully`,
    results,
  };
}
