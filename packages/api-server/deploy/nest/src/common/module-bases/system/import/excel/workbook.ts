import type { EntityManager, EntityName } from '@mikro-orm/core';
import type ExcelJS from 'exceljs';
import { EXCEL_META_SHEET } from './value';
import { getExportFieldKey, shouldSkipImportProperty } from '../row-schema';

export type ExcelWorkbookContext = {
  em: EntityManager;
  entityByModelName: Record<string, EntityName<any>>;
  resolveModelName: (name?: string | null) => string | undefined;
  getModelTableName: (modelName: string) => string;
};

export function getWorkbookSheetName(
  ctx: ExcelWorkbookContext,
  modelName: string,
): string {
  const tableName = ctx.getModelTableName(
    ctx.resolveModelName(modelName) ?? modelName,
  );
  return tableName.slice(0, 31);
}

export function getDefaultExcelColumns(
  ctx: ExcelWorkbookContext,
  inputModelName: string,
): string[] {
  const modelName = ctx.resolveModelName(inputModelName) ?? inputModelName;
  if (modelName === 'postCategory') return ['postId', 'categoryId'];
  if (modelName === 'postTag') return ['postId', 'tagId'];

  const entity = ctx.entityByModelName[modelName];
  if (!entity) return [];
  const entityName =
    typeof entity === 'string'
      ? entity
      : typeof entity === 'function'
        ? entity.name
        : String(entity as unknown as string);
  const meta = ctx.em.getMetadata().find(entityName);
  if (!meta) return [];

  const columns: string[] = [];
  for (const prop of Object.values(meta.properties)) {
    if (shouldSkipImportProperty(prop)) continue;
    columns.push(getExportFieldKey(prop));
  }
  return columns;
}

export function getExcelColumns(
  ctx: ExcelWorkbookContext,
  modelName: string,
  rows: Record<string, unknown>[],
): string[] {
  const columns = [...getDefaultExcelColumns(ctx, modelName)];
  const seen = new Set(columns);

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      columns.push(key);
    }
  }

  return columns;
}

export function addWorkbookMetadataSheet(
  workbook: ExcelJS.Workbook,
  data: Record<string, unknown[]>,
  ctx: ExcelWorkbookContext,
): void {
  const sheet = workbook.addWorksheet(EXCEL_META_SHEET, {
    state: 'veryHidden',
  });
  sheet.columns = [
    { header: 'modelName', key: 'modelName', width: 24 },
    { header: 'sheetName', key: 'sheetName', width: 24 },
    { header: 'tableName', key: 'tableName', width: 28 },
    { header: 'rowCount', key: 'rowCount', width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const [key, rows] of Object.entries(data)) {
    const modelName = ctx.resolveModelName(key) ?? key;
    const tableName = ctx.getModelTableName(modelName);
    sheet.addRow({
      modelName,
      sheetName: getWorkbookSheetName(ctx, tableName),
      tableName,
      rowCount: rows.length,
    });
  }
}

export function excelWorkbookContext(service: {
  em: EntityManager;
  entityByModelName: Record<string, EntityName<any>>;
  resolveModelName: (name?: string | null) => string | undefined;
  getModelTableName: (modelName: string) => string;
}): ExcelWorkbookContext {
  return {
    em: service.em,
    entityByModelName: service.entityByModelName,
    resolveModelName: (name) => service.resolveModelName(name),
    getModelTableName: (modelName) => service.getModelTableName(modelName),
  };
}
