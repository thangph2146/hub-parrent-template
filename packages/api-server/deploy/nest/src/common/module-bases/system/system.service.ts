/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
export interface ExportDataResult {
  modelOrder: string[];
  data: Record<string, unknown[]>;
  exportedAt: string;
}

export interface ImportDataResult {
  affected: number;
  message: string;
  errors?: string[];
}


/** System import/export admin — logic dùng chung; app binding: ormEntities + bootstrap deps. */
import { Logger } from '@nestjs/common';
import {
  EntityManager,
  type EntityName,
} from '@mikro-orm/core';

import type { SystemBootstrapDeps } from './system-bootstrap.deps';
import {
  logExportPivotSanitizeWarnings,
  reportImportRowError,
  sanitizePivotRowsInExportJson,
} from './import/helpers';
import { resolveLegacyTableModelName } from './export/schema';
import { LegacyImportIdMap } from './import/legacy-id-map';
import type { SystemBootstrapResult } from './system-bootstrap.deps';
import type { JsonPersistInsertContext } from './import/json-persist';
import { getErrorMessage } from './import/row-schema';
import { buildEntityByModelName } from './system-entity-map';
import { excelWorkbookContext } from './import/excel/workbook';
import {
  buildExcelExportBuffer,
  parseExcelImportBuffer,
} from './import/excel/io';
import { runExportModelData, toTableKeyedExport } from './export/data-run';
import {
  orderModelsForDependencySafeImport,
} from './import/order';
import {
  parseImportActingUserEmail,
  parseImportActingUserId,
} from './import/acting-user';
import {
  clearModelTableForImport,
  type ImportClearEntities,
} from './import/clear-tables';
import {
  prepareImportPayload,
} from './import/bundle-validation';
import {
  buildSanitizedImportRows as sanitizeModelImportRows,
  registerLegacyIdsAfterModelImport as persistModelLegacyIds,
  type ImportLegacyContext,
} from './import/legacy-fk';
import {
  insertSanitizedModel,
  type ImportInsertDeps,
} from './import/insert-sanitized';
import {
  runImportInTransaction,
} from './import/transaction-fk';
import {
  runImportUsersWithRolesBody,
  runOrderedBundleImportBody,
  type ImportRbacHooks,
} from './import/rbac-transaction';
import { buildModelOrder } from './import/model-order';
import { buildSystemImportConfig } from './import/config';
import { buildDatabaseSchema } from './database-schema';
import { runImportDataByModels } from './import/by-models';
import { runSingleTargetImport } from './import/data-single';
import {
  buildImportDataResponse,
  type ImportTransactionCallbacks,
} from './import/transaction-run';

export class BaseSystemService {
  private readonly logger = new Logger(BaseSystemService.name);

  protected readonly entityByModelName: Record<string, EntityName<any>>;
  protected readonly modelNameByEntityClass: Record<string, string>;

  /** Thứ tự xóa bảng: con trước cha. Import full dùng thứ tự đảo lại: cha trước con. */
  private readonly modelOrder: string[];

  constructor(
    protected readonly em: EntityManager,
    ormEntities: readonly EntityName<any>[],
    protected readonly bootstrap: SystemBootstrapDeps,
  ) {
    this.entityByModelName = buildEntityByModelName(ormEntities);
    this.modelNameByEntityClass = {};
    for (const [model, entity] of Object.entries(this.entityByModelName)) {
      const className =
        typeof entity === 'function'
          ? (entity as { name: string }).name
          : String(entity);
      this.modelNameByEntityClass[className] = model;
    }
    this.modelOrder = this.buildModelOrder();
  }

  protected modelEntity(modelKey: string): EntityName<any> {
    const entity = this.entityByModelName[modelKey];
    if (!entity) {
      throw new Error(`Unknown export model "${modelKey}"`);
    }
    return entity;
  }

  protected createEntityInstance(modelKey: string): Record<string, unknown> {
    const Entity = this.modelEntity(modelKey);
    return new (Entity as new () => Record<string, unknown>)();
  }

  private getEntityName(entity: EntityName<any>): string {
    return typeof entity === 'string'
      ? entity
      : typeof entity === 'function'
        ? entity.name
        : String(entity as unknown as string);
  }

  private resolveModelName(name?: string | null): string | undefined {
    const key = name?.trim();
    if (!key) return undefined;
    if (this.entityByModelName[key]) return key;

    const legacyModel = resolveLegacyTableModelName(key);
    if (legacyModel && this.entityByModelName[legacyModel]) {
      return legacyModel;
    }

    const lower = key.toLowerCase();
    for (const [modelName, entity] of Object.entries(this.entityByModelName)) {
      const entityName = this.getEntityName(entity);
      const meta = this.em.getMetadata().find(entityName);
      const aliases = [
        modelName,
        entityName,
        meta?.className,
        meta?.tableName,
        meta?.collection,
      ]
        .filter((v): v is string => Boolean(v))
        .map((v) => v.toLowerCase());
      if (aliases.includes(lower)) return modelName;
    }
    return undefined;
  }

  private importClearEntities(): ImportClearEntities {
    return {
      entityByModelName: this.entityByModelName,
      getEntityName: (entity) => this.getEntityName(entity),
    };
  }

  private importLegacyContext(): ImportLegacyContext {
    return {
      entityByModelName: this.entityByModelName,
      modelNameByEntityClass: this.modelNameByEntityClass,
      getEntityName: (entity) => this.getEntityName(entity),
      modelEntity: (modelKey) => this.modelEntity(modelKey),
    };
  }

  private importInsertDeps(): ImportInsertDeps {
    return {
      entityByModelName: this.entityByModelName,
      modelEntity: (modelKey) => this.modelEntity(modelKey),
      jsonPersistCtx: (em) => this.jsonPersistInsertContext(em),
      onLog: (message) => this.logger.log(message),
      onWarn: (message) => this.logger.warn(message),
      onDebug: (message) => this.logger.debug(message),
    };
  }

  private getModelTableName(modelName: string): string {
    const entity = this.entityByModelName[modelName];
    if (!entity) return modelName;
    const meta = this.em.getMetadata().find(this.getEntityName(entity));
    return meta?.tableName ?? modelName;
  }

  private buildModelOrder(): string[] {
    return buildModelOrder({
      em: this.em,
      entityByModelName: this.entityByModelName,
      resolveModelName: (name) => this.resolveModelName(name),
      getEntityName: (entity) => this.getEntityName(entity),
    });
  }

  private excelCtx() {
    return excelWorkbookContext({
      em: this.em,
      entityByModelName: this.entityByModelName,
      resolveModelName: (name) => this.resolveModelName(name),
      getModelTableName: (m) => this.getModelTableName(m),
    });
  }

  async exportExcelData(modelName?: string): Promise<Buffer> {
    const data = (await this.exportData(modelName)) as Record<
      string,
      Record<string, unknown>[]
    >;
    return buildExcelExportBuffer(data, this.excelCtx());
  }

  async importExcelData(
    fileBuffer: Buffer,
    targetModel?: string,
    skipClear: boolean = false,
    onProgress?: (event: object) => void,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ) {
    const { data, resolvedTargetModel } = await parseExcelImportBuffer(
      fileBuffer,
      {
        targetModel,
        resolveModelName: (name) => this.resolveModelName(name),
      },
    );
    return this.importData(
      data,
      resolvedTargetModel,
      skipClear,
      onProgress,
      actingUserIdHeader,
      actingUserEmailHeader,
    );
  }

  private sanitizeExportedPivotTables(data: Record<string, unknown>): void {
    logExportPivotSanitizeWarnings(
      sanitizePivotRowsInExportJson(data),
      (message) => this.logger.warn(message),
    );
  }

  private jsonPersistInsertContext(
    em: EntityManager,
  ): JsonPersistInsertContext {
    return {
      em,
      createEntityInstance: (modelKey) => this.createEntityInstance(modelKey),
      modelEntity: (modelKey) => this.modelEntity(modelKey),
      reportImportRowError,
      getErrorMessage,
    };
  }

  private async insertSanitizedModel(
    em: EntityManager,
    mName: string,
    sanitized: Record<string, unknown>[],
    onRowError?: (index: number, message: string) => void,
    importContext?: {
      rawRecords?: Record<string, unknown>[];
      idMap?: LegacyImportIdMap;
    },
  ) {
    return insertSanitizedModel(
      em,
      this.importInsertDeps(),
      mName,
      sanitized,
      onRowError,
      importContext,
    );
  }

  private async ensureActingUserRoleAfterImportFromHeaders(
    em: EntityManager,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ): Promise<void> {
    await this.bootstrap.ensureActingUserRoleAfterImport(
      em,
      parseImportActingUserId(actingUserIdHeader),
      parseImportActingUserEmail(actingUserEmailHeader),
    );
  }

  private async clearModelTableForImport(
    em: EntityManager,
    mName: string,
    isMysqlFamily: boolean,
    isSqlite: boolean,
    preserveUserId?: number,
    skipClear: boolean = false,
  ): Promise<void> {
    await clearModelTableForImport(
      em,
      this.importClearEntities(),
      this.logger,
      mName,
      isMysqlFamily,
      isSqlite,
      preserveUserId,
      skipClear,
    );
  }

  private settingEntityCtor(): new () => Record<string, unknown> {
    return this.modelEntity('setting') as unknown as new () => Record<
      string,
      unknown
    >;
  }

  private importRbacHooks(
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ): ImportRbacHooks {
    return {
      ensureSeedUserRoleLinks: (em) =>
        this.bootstrap.ensureSeedUserRoleLinks(em),
      ensureActingUserRole: (em) =>
        this.ensureActingUserRoleAfterImportFromHeaders(
          em,
          actingUserIdHeader,
          actingUserEmailHeader,
        ),
      onLog: (message) => this.logger.log(message),
    };
  }

  private importTransactionCallbacks(
    skipClear: boolean,
  ): ImportTransactionCallbacks {
    return {
      sanitizeRows: (em, mName, raw, idMap, preserveUserId) =>
        this.buildSanitizedImportRows(em, mName, raw, idMap, preserveUserId),
      insertModel: (em, mName, sanitized, onRowError, ctx) =>
        this.insertSanitizedModel(em, mName, sanitized, onRowError, ctx),
      registerLegacyIds: (em, mName, raw, idMap, preserveUserId) =>
        this.registerLegacyIdsAfterModelImport(
          em,
          mName,
          raw,
          idMap,
          preserveUserId,
        ),
      clearModel: (em, mName, flags, preserveUserId) =>
        this.clearModelTableForImport(
          em,
          mName,
          flags.isMysqlFamily,
          flags.isSqlite,
          preserveUserId,
          skipClear,
        ),
    };
  }

  /** Import nhiều bảng liên quan trong một transaction (cha + pivot cùng request). */
  private async importOrderedModelsInTransaction(
    data: Record<string, any[]>,
    modelNames: string[],
    skipClear: boolean,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ): Promise<{
    rowErrors: Array<{ model: string; index: number; message: string }>;
    modelTimings: Array<{
      model: string;
      clearMs: number;
      insertMs: number;
      imported: number;
    }>;
    requestMs: number;
  }> {
    const rowErrors: Array<{ model: string; index: number; message: string }> =
      [];
    const modelTimings: Array<{
      model: string;
      clearMs: number;
      insertMs: number;
      imported: number;
    }> = [];
    const clearMsByModel = new Map<string, number>();
    const requestStarted = Date.now();

    await runImportInTransaction(
      this.em,
      this.settingEntityCtor(),
      async ({ em, idMap, flags }) => {
        modelTimings.push(
          ...(await runOrderedBundleImportBody(em, flags, {
            data,
            modelNames,
            modelOrder: this.modelOrder,
            skipClear,
            actingUserIdHeader,
            entityByModelName: this.entityByModelName,
            idMap,
            callbacks: this.importTransactionCallbacks(skipClear),
            rowErrors,
            clearMsByModel,
            hooks: this.importRbacHooks(
              actingUserIdHeader,
              actingUserEmailHeader,
            ),
            onLog: (message) => this.logger.log(message),
            onWarn: (message) => this.logger.warn(message),
            onClearError: (mName, error) =>
              this.logger.error(`Error clearing model ${mName}:`, error),
            onImportError: (mName, error) =>
              this.logger.error(`Error importing model ${mName}:`, error),
          })),
        );
      },
    );

    return {
      rowErrors,
      modelTimings,
      requestMs: Date.now() - requestStarted,
    };
  }

  private async importUsersWithRolesInTransaction(
    userRows: any[],
    userRoleRows: any[],
    skipClear: boolean,
    onRowError?: (model: string, index: number, message: string) => void,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ): Promise<void> {
    await runImportInTransaction(
      this.em,
      this.settingEntityCtor(),
      async ({ em, idMap, flags }) => {
        await runImportUsersWithRolesBody(em, flags, {
          userRows: userRows as Record<string, unknown>[],
          userRoleRows: userRoleRows as Record<string, unknown>[],
          skipClear,
          actingUserIdHeader,
          clearEntities: this.importClearEntities(),
          clearLog: this.logger,
          callbacks: this.importTransactionCallbacks(skipClear),
          idMap,
          hooks: this.importRbacHooks(
            actingUserIdHeader,
            actingUserEmailHeader,
          ),
          onRowError,
        });
      },
    );
  }

  private async buildSanitizedImportRows(
    em: EntityManager,
    mName: string,
    records: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    preserveUserId?: number,
  ): Promise<Record<string, unknown>[]> {
    return sanitizeModelImportRows(
      em,
      this.importLegacyContext(),
      mName,
      records,
      idMap,
      preserveUserId,
      (skipped, userId) =>
        this.logger.log(
          `Import user: bỏ qua ${skipped} bản ghi trùng user #${userId} (id/email) — giữ phiên admin hiện tại.`,
        ),
    );
  }

  private async registerLegacyIdsAfterModelImport(
    em: EntityManager,
    mName: string,
    rawRecords: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    preserveUserId?: number,
  ): Promise<void> {
    return persistModelLegacyIds(
      em,
      this.importLegacyContext(),
      mName,
      rawRecords,
      idMap,
      preserveUserId,
    );
  }

  getModels() {
    return this.modelOrder.map((modelName) => {
      const entity = this.entityByModelName[modelName];
      const entityName =
        typeof entity === 'string'
          ? entity
          : typeof entity === 'function'
            ? entity.name
            : modelName;
      const meta = this.em.getMetadata().find(entityName);
      return {
        modelName,
        tableName: meta?.tableName ?? entityName,
      };
    });
  }

  /** Cấu hình import theo lô — client dùng để chia file JSON/Excel lớn thành nhiều request nhỏ. */
  getImportConfig() {
    return buildSystemImportConfig(this.modelOrder, (m) =>
      this.getModelTableName(m),
    );
  }

  async getDatabaseSchema() {
    return buildDatabaseSchema({
      em: this.em,
      modelOrder: this.modelOrder,
      entityByModelName: this.entityByModelName,
      modelEntity: (modelKey) => this.modelEntity(modelKey),
      onCountError: (entityName, message) =>
        this.logger.warn(
          `getDatabaseSchema: count failed for ${entityName}: ${message}`,
        ),
    });
  }

  /** Giống `pnpm run seed:superadmin` — idempotent, dùng từ API bảo trì. */
  async runSuperadminBootstrapSeed(): Promise<SystemBootstrapResult> {
    return this.bootstrap.runSuperadminBootstrap(this.em.fork());
  }

  async exportData(modelName?: string) {
    const resolvedModelName = this.resolveModelName(modelName) ?? modelName;
    this.logger.log(
      `Starting data export ${resolvedModelName ? `for ${resolvedModelName}` : 'all models'}...`,
    );

    const exportOrder = resolvedModelName
      ? [resolvedModelName]
      : [...this.modelOrder].reverse();

    const data = await runExportModelData(
      {
        em: this.em,
        entityByModelName: this.entityByModelName,
        getEntityName: (entity) => this.getEntityName(entity),
        modelEntity: (modelKey) => this.modelEntity(modelKey),
        onDebug: (message) => this.logger.debug(message),
        onWarn: (message) => this.logger.warn(message),
        onError: (mName, error) =>
          this.logger.error(`Error exporting model ${mName}:`, error),
      },
      exportOrder,
    );

    if (!resolvedModelName) {
      this.sanitizeExportedPivotTables(data);
    }

    return toTableKeyedExport(data, (m) => this.getModelTableName(m));
  }

  async importData(
    data: Record<string, any[]>,
    targetModel?: string,
    skipClear: boolean = false,
    onProgress?: (event: object) => void,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ) {
    const resolvedTargetModel =
      this.resolveModelName(targetModel) ?? targetModel;
    data = prepareImportPayload(
      data,
      (key) => this.resolveModelName(key),
      this.entityByModelName,
      this.logger,
    );
    this.logger.log(
      `Starting data import ${resolvedTargetModel ? `for ${resolvedTargetModel}` : 'all models'} (skipClear: ${skipClear})...`,
    );

    if (!resolvedTargetModel && Object.keys(data).length > 1) {
      return runImportDataByModels({
        data,
        modelOrder: this.modelOrder,
        hasEntity: (m) => Boolean(this.entityByModelName[m]),
        skipClear,
        onProgress,
        importOne: (payload, targetModel) =>
          this.importData(
            payload,
            targetModel,
            skipClear,
            undefined,
            actingUserIdHeader,
            actingUserEmailHeader,
          ),
        onInfo: (message) => this.logger.log(message),
        onModelStart: (model, count) =>
          this.logger.log(`Importing ${model} (${count} records)...`),
        onModelSuccess: (model) =>
          this.logger.log(`Successfully imported ${model}`),
        onModelFailure: (model, error) =>
          this.logger.error(`Failed to import ${model}:`, error),
      });
    }

    const payloadKeys = Object.keys(data).filter(
      (k) => Array.isArray(data[k]) && data[k].length > 0,
    );

    if (resolvedTargetModel && payloadKeys.length > 1) {
      if (
        resolvedTargetModel === 'user' &&
        payloadKeys.includes('user') &&
        payloadKeys.includes('userRole')
      ) {
        this.logger.log(
          `Import user + userRole trong một transaction (skipClear: ${skipClear})…`,
        );
        const userRowErrors: Array<{
          model: string;
          index: number;
          message: string;
        }> = [];
        await this.importUsersWithRolesInTransaction(
          Array.isArray(data.user) ? data.user : [],
          Array.isArray(data.userRole) ? data.userRole : [],
          skipClear,
          (model, idx, msg) =>
            userRowErrors.push({ model, index: idx, message: msg }),
          actingUserIdHeader,
          actingUserEmailHeader,
        );
        return buildImportDataResponse(userRowErrors, undefined, 'user+userRole');
      }

      const ordered = orderModelsForDependencySafeImport(
        payloadKeys,
        this.modelOrder,
      );
      this.logger.log(
        `Import bundle [${ordered.join(', ')}] trong một transaction (skipClear: ${skipClear})…`,
      );
      const bundleResult = await this.importOrderedModelsInTransaction(
        data,
        ordered,
        skipClear,
        actingUserIdHeader,
        actingUserEmailHeader,
      );
      return buildImportDataResponse(
        bundleResult.rowErrors,
        {
          requestMs: bundleResult.requestMs,
          models: bundleResult.modelTimings,
        },
        'bundle',
      );
    }

    return runSingleTargetImport({
      em: this.em,
      data,
      resolvedTargetModel,
      modelOrder: this.modelOrder,
      skipClear,
      actingUserIdHeader,
      actingUserEmailHeader,
      entityByModelName: this.entityByModelName,
      settingEntityCtor: this.settingEntityCtor(),
      callbacks: this.importTransactionCallbacks(skipClear),
      rbacHooks: this.importRbacHooks(
        actingUserIdHeader,
        actingUserEmailHeader,
      ),
      getModelTableName: (m) => this.getModelTableName(m),
      onLog: (message) => this.logger.log(message),
      onWarn: (message) => this.logger.warn(message),
      onDebug: (message) => this.logger.debug(message),
      onClearError: (mName, error) =>
        this.logger.error(`Error clearing model ${mName}:`, error),
      onImportError: (mName, error) =>
        this.logger.error(`Error importing model ${mName}:`, error),
    });
  }

}

/** @deprecated Dùng `BaseSystemService`. */
export class BaseSystemAdminService extends BaseSystemService {}
