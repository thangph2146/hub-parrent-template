import type { EntityManager, EntityName } from '@mikro-orm/core';
import { flattenEntityRowForExport } from './row-flatten';
import {
  exportPostCategoryRows,
  exportPostTagRows,
  exportUserRows,
} from './special-rows';

export type ExportDataRunContext = {
  em: EntityManager;
  entityByModelName: Record<string, EntityName<any>>;
  getEntityName: (entity: EntityName<any>) => string;
  modelEntity: (modelKey: string) => EntityName<any>;
  onDebug?: (message: string) => void;
  onWarn?: (message: string) => void;
  onError?: (modelName: string, error: unknown) => void;
};

export async function runExportModelData(
  ctx: ExportDataRunContext,
  exportOrder: readonly string[],
): Promise<Record<string, any[]>> {
  const data: Record<string, any[]> = {};

  for (const mName of exportOrder) {
    data[mName] = [];
    try {
      const entity = ctx.entityByModelName[mName];
      if (!entity) {
        ctx.onWarn?.(`Export: không có entity cho model "${mName}"`);
        continue;
      }

      if (mName === 'postCategory') {
        data[mName] = await exportPostCategoryRows(
          ctx.em,
          ctx.modelEntity('postCategory'),
        );
      } else if (mName === 'postTag') {
        data[mName] = await exportPostTagRows(
          ctx.em,
          ctx.modelEntity('postTag'),
        );
      } else if (mName === 'user') {
        data[mName] = await exportUserRows(
          ctx.em,
          ctx.modelEntity('user'),
          ctx.getEntityName(ctx.modelEntity('user')),
        );
      } else {
        const rows = await ctx.em.find(entity, {});
        const entityKey =
          typeof entity === 'string'
            ? entity
            : typeof entity === 'function'
              ? entity.name
              : mName;
        data[mName] = rows.map((row: object) =>
          flattenEntityRowForExport(ctx.em, entityKey, row),
        );
      }
      ctx.onDebug?.(
        `Exported ${(data[mName] as unknown[]).length} records from ${mName}`,
      );
    } catch (error) {
      ctx.onError?.(mName, error);
      data[mName] = [];
    }
  }

  return data;
}

export function toTableKeyedExport(
  data: Record<string, any[]>,
  getModelTableName: (modelName: string) => string,
): Record<string, any[]> {
  const tableData: Record<string, any[]> = {};
  for (const [modelName, rows] of Object.entries(data)) {
    tableData[getModelTableName(modelName)] = rows;
  }
  return tableData;
}
