import type { EntityManager, EntityName } from '@mikro-orm/core';
import { isSkippableImportRowError } from './helpers';
import {
  clearUsersTableForImport,
  shouldFastClearUsersForImport,
  type ImportClearEntities,
  type ImportClearLog,
} from './clear-tables';
import { resolvePreserveUserIdForImport } from './acting-user';
import {
  orderModelsForDependencySafeImport,
  resolveImportClearOrder,
} from './order';
import type { LegacyImportIdMap } from './legacy-id-map';
import type { ImportDbDriverFlags } from './transaction-fk';
import {
  runImportTransactionBody,
  type ImportModelTiming,
  type ImportRowError,
  type ImportTransactionCallbacks,
} from './transaction-run';

export type ImportRbacHooks = {
  ensureSeedUserRoleLinks: (em: EntityManager) => Promise<void>;
  ensureActingUserRole: (em: EntityManager) => Promise<void>;
  onLog?: (message: string) => void;
};

/** Sau import bundle: seed user_roles + giữ quyền user đang thao tác. */
export async function runPostImportRbacHooks(
  em: EntityManager,
  modelNames: readonly string[],
  skipClear: boolean,
  hooks: ImportRbacHooks,
): Promise<void> {
  if (skipClear) return;

  if (modelNames.includes('role')) {
    const seedStarted = Date.now();
    await hooks.ensureSeedUserRoleLinks(em);
    hooks.onLog?.(
      `Import RBAC: ensureSeedUserRoleLinks ${Date.now() - seedStarted}ms`,
    );
    const actingStarted = Date.now();
    await hooks.ensureActingUserRole(em);
    hooks.onLog?.(
      `Import RBAC: ensureActingUserRole ${Date.now() - actingStarted}ms`,
    );
    return;
  }

  if (modelNames.includes('user') && modelNames.includes('userRole')) {
    await hooks.ensureActingUserRole(em);
  }
}

export type RunImportUsersWithRolesOptions = {
  userRows: Record<string, unknown>[];
  userRoleRows: Record<string, unknown>[];
  skipClear: boolean;
  actingUserIdHeader?: string;
  clearEntities: ImportClearEntities;
  clearLog: ImportClearLog;
  callbacks: ImportTransactionCallbacks;
  idMap: LegacyImportIdMap;
  hooks: ImportRbacHooks;
  onRowError?: (model: string, index: number, message: string) => void;
};

/** Import user + userRole trong một transaction. */
export async function runImportUsersWithRolesBody(
  em: EntityManager,
  flags: ImportDbDriverFlags,
  opts: RunImportUsersWithRolesOptions,
): Promise<void> {
  const preserveUserId = resolvePreserveUserIdForImport(
    opts.skipClear,
    true,
    opts.actingUserIdHeader,
  );

  if (!opts.skipClear) {
    const startTime = Date.now();
    await clearUsersTableForImport(
      em,
      opts.clearEntities,
      opts.clearLog,
      preserveUserId,
      {
        fastPath: shouldFastClearUsersForImport(flags.isMysqlFamily, opts.skipClear),
      },
    );
    opts.clearLog.log(
      `Cleared data from user in ${Date.now() - startTime}ms`,
    );
  }

  if (opts.userRows.length > 0) {
    const sanitized = await opts.callbacks.sanitizeRows(
      em,
      'user',
      opts.userRows,
      opts.idMap,
      preserveUserId,
    );
    await opts.callbacks.insertModel(
      em,
      'user',
      sanitized,
      (idx, msg) => {
        if (!isSkippableImportRowError(msg)) {
          opts.onRowError?.('user', idx, msg);
        }
      },
      { rawRecords: opts.userRows, idMap: opts.idMap },
    );
    await opts.callbacks.registerLegacyIds(
      em,
      'user',
      opts.userRows,
      opts.idMap,
      preserveUserId,
    );
    await em.flush();
  }

  if (opts.userRoleRows.length > 0) {
    const sanitized = await opts.callbacks.sanitizeRows(
      em,
      'userRole',
      opts.userRoleRows,
      opts.idMap,
    );
    await opts.callbacks.insertModel(
      em,
      'userRole',
      sanitized,
      (idx, msg) => {
        if (!isSkippableImportRowError(msg)) {
          opts.onRowError?.('userRole', idx, msg);
        }
      },
      { rawRecords: opts.userRoleRows, idMap: opts.idMap },
    );
  }

  if (!opts.skipClear) {
    if (opts.userRows.length > 0 && opts.userRoleRows.length === 0) {
      await opts.hooks.ensureSeedUserRoleLinks(em);
    }
    await opts.hooks.ensureActingUserRole(em);
  }
}

export type RunOrderedBundleImportOptions = {
  data: Record<string, any[]>;
  modelNames: string[];
  modelOrder: readonly string[];
  skipClear: boolean;
  actingUserIdHeader?: string;
  entityByModelName: Record<string, EntityName<any>>;
  idMap: LegacyImportIdMap;
  callbacks: ImportTransactionCallbacks;
  rowErrors: ImportRowError[];
  clearMsByModel: Map<string, number>;
  hooks: ImportRbacHooks;
  onLog?: (message: string) => void;
  onWarn?: (message: string) => void;
  onClearError?: (modelName: string, error: unknown) => void;
  onImportError?: (modelName: string, error: unknown) => void;
};

/** Import bundle nhiều model + RBAC hooks. */
export async function runOrderedBundleImportBody(
  em: EntityManager,
  flags: ImportDbDriverFlags,
  opts: RunOrderedBundleImportOptions,
): Promise<ImportModelTiming[]> {
  const clearOrder = resolveImportClearOrder(opts.modelNames, opts.modelOrder);
  const preserveUserId = resolvePreserveUserIdForImport(
    opts.skipClear,
    clearOrder.includes('user'),
    opts.actingUserIdHeader,
  );
  const importOrder = orderModelsForDependencySafeImport(
    opts.modelNames,
    opts.modelOrder,
  );

  const timings = await runImportTransactionBody(em, flags, {
    data: opts.data,
    clearOrder,
    importOrder,
    skipClear: opts.skipClear,
    preserveUserId,
    entityByModelName: opts.entityByModelName,
    idMap: opts.idMap,
    callbacks: opts.callbacks,
    rowErrors: opts.rowErrors,
    clearMsByModel: opts.clearMsByModel,
    onLog: opts.onLog,
    onWarn: opts.onWarn,
    onClearError: opts.onClearError,
    onImportError: opts.onImportError,
  });

  await runPostImportRbacHooks(em, opts.modelNames, opts.skipClear, opts.hooks);

  return timings;
}

/** Sau import single role: repair deletedAt + seed user_roles. */
export async function runPostImportSingleRoleHooks(
  em: EntityManager,
  roleModel: string,
  getModelTableName: (modelName: string) => string,
  hooks: ImportRbacHooks & {
    repairNullMarkers: (
      em: EntityManager,
      models: string[],
      getTableName: (m: string) => string,
    ) => Promise<void>;
    onDebug?: (message: string) => void;
  },
): Promise<void> {
  hooks.onDebug?.(
    'Sau import role: bổ sung lại user_roles seed (nếu user + role tồn tại).',
  );
  await hooks.repairNullMarkers(em, [roleModel], getModelTableName);
  await hooks.ensureSeedUserRoleLinks(em);
  await hooks.ensureActingUserRole(em);
}
