import type { EntityManager, EntityName } from '@mikro-orm/core';
import { resolvePreserveUserIdForImport } from './acting-user';
import { repairImportNullMarkerValues } from './null-marker-repair';
import { runPostImportSingleRoleHooks, type ImportRbacHooks } from './rbac-transaction';
import {
  runImportInTransaction,
  type ImportTransactionContext,
} from './transaction-fk';
import {
  buildImportDataResponse,
  runImportTransactionBody,
  type ImportDataResponse,
  type ImportModelTiming,
  type ImportRowError,
  type ImportTransactionCallbacks,
} from './transaction-run';

export type RunSingleTargetImportOptions = {
  em: EntityManager;
  data: Record<string, any[]>;
  resolvedTargetModel?: string;
  modelOrder: readonly string[];
  skipClear: boolean;
  actingUserIdHeader?: string;
  actingUserEmailHeader?: string;
  entityByModelName: Record<string, EntityName<any>>;
  settingEntityCtor: new () => Record<string, unknown>;
  callbacks: ImportTransactionCallbacks;
  rbacHooks: ImportRbacHooks;
  getModelTableName: (modelName: string) => string;
  onLog: (message: string) => void;
  onWarn: (message: string) => void;
  onDebug: (message: string) => void;
  onClearError: (modelName: string, error: unknown) => void;
  onImportError: (modelName: string, error: unknown) => void;
};

/** Import một model hoặc full backup (một transaction). */
export async function runSingleTargetImport(
  opts: RunSingleTargetImportOptions,
): Promise<ImportDataResponse> {
  const requestStarted = Date.now();
  const clearMsByModel = new Map<string, number>();
  let rowErrors: ImportRowError[] = [];
  const modelTimings: ImportModelTiming[] = [];

  await runImportInTransaction(
    opts.em,
    opts.settingEntityCtor,
    async ({ em, idMap, flags }: ImportTransactionContext) => {
      const clearOrder = opts.resolvedTargetModel
        ? [opts.resolvedTargetModel]
        : opts.modelOrder;
      const preserveUserId = resolvePreserveUserIdForImport(
        opts.skipClear,
        !opts.skipClear && clearOrder.includes('user'),
        opts.actingUserIdHeader,
      );
      const importOrder = opts.resolvedTargetModel
        ? [opts.resolvedTargetModel]
        : [...opts.modelOrder].reverse();

      rowErrors = [];
      modelTimings.push(
        ...(await runImportTransactionBody(em, flags, {
          data: opts.data,
          clearOrder,
          importOrder,
          skipClear: opts.skipClear,
          preserveUserId,
          entityByModelName: opts.entityByModelName,
          idMap,
          callbacks: opts.callbacks,
          rowErrors,
          clearMsByModel,
          onLog: opts.onLog,
          onWarn: opts.onWarn,
          onClearError: opts.onClearError,
          onImportError: opts.onImportError,
        })),
      );

      if (!opts.skipClear && opts.resolvedTargetModel === 'role') {
        await runPostImportSingleRoleHooks(
          em,
          opts.resolvedTargetModel,
          opts.getModelTableName,
          {
            ...opts.rbacHooks,
            repairNullMarkers: (txn, models, getTableName) =>
              repairImportNullMarkerValues(
                txn,
                models,
                getTableName,
                opts.onLog,
                opts.onWarn,
              ),
            onDebug: opts.onDebug,
          },
        );
      }
    },
  );

  return buildImportDataResponse(rowErrors, {
    requestMs: Date.now() - requestStarted,
    models: modelTimings,
  });
}
