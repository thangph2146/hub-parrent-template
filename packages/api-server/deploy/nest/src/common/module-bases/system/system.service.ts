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
import {
  coerceImportPrimaryKey,
  parseEntityId,
  relationEntityId,
  toEntityId,
  toEntityIdList,
} from '../../index';
import { Logger } from '@nestjs/common';
import {
  EntityManager,
  type EntityName,
  type EntityProperty,
  wrap,
} from '@mikro-orm/core';
import { hashSync } from 'bcryptjs';
import * as ExcelJS from 'exceljs';

import type { SystemBootstrapDeps } from './system-bootstrap.deps';
import {
  isSkippableImportRowError,
  orderCategoryRowsForImport,
  type ImportRow,
  pivotFk,
  sanitizePivotRowsInExportJson,
  stripHeroSlidesPermissions,
  stripLegacyHeroSlideFromBundle,
} from './import-helpers';
import {
  normalizeLegacyImportRow,
  resolveLegacyTableModelName,
} from './export-schema';
import {
  exportLegacyKey,
  IMPORT_ID_MAP_GROUP,
  LegacyImportIdMap,
} from './legacy-import-id-map';
import {
  buildImportVerification,
  getImportReferenceFilePath,
  loadImportReferenceManifest,
  type ImportVerificationResult,
} from './import-reference';
import type { SystemBootstrapResult } from './system-bootstrap.deps';

const EXCEL_META_SHEET = '__meta';
const EXCEL_NULL_MARKER = '__HUB_NULL__';
const EXCEL_MAX_CELL_CHARS = 32767;
type ExcelWorkbookLoadInput = Parameters<ExcelJS.Workbook['xlsx']['load']>[0];

/**
 * Thứ tự xóa/import an toàn FK (cha trước con khi xóa; import dùng reverse).
 * Bổ sung khi thêm entity mới có quan hệ rõ ràng.
 */
const PREFERRED_MIDDLE_MODEL_ORDER: readonly string[] = [
  'setting',
  'seoMeta',
  'template',
  'trainingLevel',
  'trainingSystem',
  'academicYear',
  'department',
  'major',
  'course',
  'location',
  'camera',
  'screen',
  'faceData',
  'speaker',
  'importedUser',
  'category',
  'tag',
  'post',
  'comment',
  'contactRequest',
  'student',
  'parentStudent',
  'group',
  'groupMember',
  'message',
  'messageRead',
  'notification',
  'pageContent',
  'event',
  'eventSpeaker',
  'eventRegistration',
  'eventCheckin',
  'account',
  'session',
];

/**
 * Các bảng con / pivot import cùng request với bảng cha (một transaction).
 * Khớp thứ tự FK: role → user → userRole; post → postCategory/postTag; …
 */
const IMPORT_MODEL_BUNDLES: Record<string, readonly string[]> = {
  user: ['userRole'],
  post: ['postCategory', 'postTag'],
  event: ['eventSpeaker', 'eventRegistration'],
};

/** Bảng có cột JSON/text lớn — insertMany từng lô nhỏ ngay (tránh 1 INSERT khổng lồ). */
const JSON_HEAVY_IMPORT_MODELS = new Set(['post', 'event']);

/** Xoá ký tự điều khiển XML (0x00–0x08, 0x0B–0x0C, 0x0E–0x1F) có thể làm hỏng XLSX. */
function sanitizeExcelString(raw: string): string {
  if (!raw) return raw;
  const re = new RegExp(
    '[\x00-\x08\x0B\x0C\x0E-\x1F]', // eslint-disable-line no-control-regex
    'g',
  );
  return raw.replace(re, '');
}

/** bcrypt — chỉ khi bản ghi user thiếu password trong JSON export. */
let importUserFallbackPasswordHash: string | null = null;
function getImportUserFallbackPasswordHash(): string {
  if (!importUserFallbackPasswordHash) {
    const plain =
      process.env.IMPORT_FALLBACK_PASSWORD_PLAIN?.trim() ||
      'ImportFallback#2026';
    importUserFallbackPasswordHash = hashSync(plain, 10);
  }
  return importUserFallbackPasswordHash;
}

/** Khớp tên model export (`postCategory`) với tên class entity (`PostCategory`). */
function entityClassToExportModelName(entity: EntityName<any>): string {
  const name =
    typeof entity === 'function'
      ? (entity as { name: string }).name
      : typeof entity === 'string'
        ? entity
        : String(entity as unknown as string);
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** Tự động xây dựng entityByModelName từ ormEntities — không cần maintain thủ công. */
function buildEntityByModelName(
  ormEntities: readonly EntityName<any>[],
): Record<string, EntityName<any>> {
  const map: Record<string, EntityName<any>> = {};
  for (const E of ormEntities) {
    map[entityClassToExportModelName(E)] = E;
  }
  return map;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

/** Bỏ qua quan hệ không map trực tiếp ra cột (MikroORM v6: `EntityProperty.reference`). */
function shouldSkipImportProperty(prop: EntityProperty): boolean {
  if (prop.persist === false) return true;
  const kind = String((prop as { kind?: unknown }).kind ?? '');
  if (kind === '1:m' || kind === 'm:n') {
    return true;
  }
  if (kind === '1:1' && prop.mappedBy) {
    return true;
  }
  return false;
}

/** Excel ô trống → thiếu key; NOT NULL không default → lỗi MySQL khi insert. */
function fillRequiredImportScalarDefaults(
  meta: { properties: Record<string, EntityProperty> },
  row: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...row };
  for (const prop of Object.values(meta.properties)) {
    if (shouldSkipImportProperty(prop)) continue;
    if (isManyToOneImportProperty(prop)) continue;
    if (prop.primary && (prop as { autoincrement?: boolean }).autoincrement) {
      continue;
    }
    if (prop.nullable) continue;
    if (prop.default != null) continue;

    const key = prop.name;
    const current = out[key];
    if (current !== undefined && current !== null) continue;

    const typeStr = String(prop.type ?? '').toLowerCase();
    const colType = String(prop.columnTypes?.[0] ?? '').toLowerCase();
    if (
      typeStr.includes('string') ||
      typeStr.includes('text') ||
      colType.includes('char') ||
      colType.includes('text')
    ) {
      out[key] = '';
    }
  }
  return out;
}

const IMPORT_DATE_SCALAR_PROP_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'readAt',
  'expiresAt',
  'lastActivity',
  'emailVerified',
]);

/** Cột date/time trên MySQL không chấp nhận literal ISO (`...T...Z`); cần Date để driver format đúng. */
function isTemporalColumn(prop: EntityProperty): boolean {
  const col = prop.columnTypes?.[0]?.toLowerCase() ?? '';
  if (
    col === 'date' ||
    col === 'datetime' ||
    col === 'timestamp' ||
    col === 'time' ||
    col === 'timestamptz' ||
    col.includes('datetime') ||
    col.includes('timestamp')
  ) {
    return true;
  }
  const t = String(prop.type ?? '').toLowerCase();
  if (t.includes('date') || t.includes('time')) {
    return true;
  }
  return IMPORT_DATE_SCALAR_PROP_NAMES.has(prop.name);
}

function isManyToOneImportProperty(prop: EntityProperty): boolean {
  const kind = String((prop as { kind?: string }).kind ?? '');
  return (
    kind === 'm:1' ||
    (kind === '1:1' && !(prop as { mappedBy?: string }).mappedBy)
  );
}

function coerceManyToOneScalar(raw: unknown): unknown {
  if (raw === null || raw === undefined) return raw;
  const id = relationEntityId(raw);
  if (id != null) return id;
  if (typeof raw === 'object' && raw !== null && 'id' in raw) {
    const nested = relationEntityId((raw as { id: unknown }).id);
    if (nested != null) return nested;
  }
  return null;
}

function coerceImportNullMarker(raw: unknown): unknown {
  if (raw === EXCEL_NULL_MARKER) return null;
  if (typeof raw === 'string' && raw.trim() === EXCEL_NULL_MARKER) return null;
  return raw;
}

function normalizeImportScalar(prop: EntityProperty, raw: unknown): unknown {
  const unmarked = coerceImportNullMarker(raw);
  if (unmarked === null) return null;
  raw = unmarked;
  if (!isTemporalColumn(prop)) return raw;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? raw : d;
  }
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return raw;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? raw : d;
  }
  return raw;
}

/**
 * Post / PageContent: `content` là JSON object (Lexical…). Export đôi khi là chuỗi;
 * insertMany + driver lỗi nếu không parse — đồng bộ với seed-full-export.
 */
function normalizeContentJsonForImport(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return {};
    try {
      const parsed = JSON.parse(s) as unknown;
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

/** MySQL JSON + insertMany đôi khi lỗi với object phức tạp — ép plain object qua JSON. */
function plainJsonRecord(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  try {
    return JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function coerceImportDate(val: unknown, fallback: Date): Date {
  if (val instanceof Date && !Number.isNaN(val.getTime())) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return fallback;
}

function encodeExcelCellValue(value: unknown): string | number | boolean {
  if (value === null) return EXCEL_NULL_MARKER;
  if (value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string')
    return sanitizeExcelString(value).slice(0, EXCEL_MAX_CELL_CHARS);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
    return EXCEL_NULL_MARKER;
  }
  try {
    const str = JSON.stringify(value);
    return sanitizeExcelString(str).slice(0, EXCEL_MAX_CELL_CHARS);
  } catch {
    return EXCEL_NULL_MARKER;
  }
}

function parseExcelObjectValue(value: object): unknown {
  if ('result' in value) {
    return parseExcelCellValue((value as { result?: unknown }).result);
  }
  if ('text' in value) {
    return String((value as { text?: unknown }).text ?? '');
  }
  if ('richText' in value) {
    return ((value as { richText?: Array<{ text?: string }> }).richText ?? [])
      .map((item) => item.text ?? '')
      .join('');
  }
  return String(value);
}

function parseExcelCellValue(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object') {
    return parseExcelObjectValue(value);
  }
  if (typeof value !== 'string') {
    return value;
  }
  if (value === EXCEL_NULL_MARKER) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

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

  private normalizeImportBundle(
    data: Record<string, any[]>,
  ): Record<string, any[]> {
    const normalized: Record<string, any[]> = {};
    for (const [key, rows] of Object.entries(data)) {
      const modelName = this.resolveModelName(key) ?? key;
      if (!Array.isArray(rows)) continue;
      if (!this.entityByModelName[modelName]) {
        this.logger.warn(
          `Import: bỏ qua model "${key}" (${rows.length} bản ghi) vì API hiện tại không có entity tương ứng.`,
        );
        continue;
      }
      normalized[modelName] = [...(normalized[modelName] ?? []), ...rows];
    }
    return normalized;
  }

  /**
   * Backup hợp lệ phải có dữ liệu field thật. File export lỗi trước đây có dạng
   * `{ settings: [{}, {}, ...] }` hoặc row thiếu `id`; nếu cho import sẽ rất dễ
   * xóa dữ liệu cũ rồi nạp bản ghi rỗng.
   */
  private assertRestorableImportBundle(data: Record<string, any[]>): void {
    const modelsWithoutId = new Set(['postCategory', 'postTag']);

    for (const [modelName, rows] of Object.entries(data)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;

      const emptyRows = rows.filter(
        (row) =>
          row != null &&
          typeof row === 'object' &&
          !Array.isArray(row) &&
          Object.keys(row as Record<string, unknown>).length === 0,
      ).length;

      if (emptyRows > 0) {
        throw new Error(
          `File import không hợp lệ: bảng/model "${modelName}" có ${emptyRows}/${rows.length} dòng rỗng. Vui lòng export lại bằng phiên bản mới trước khi import.`,
        );
      }

      if (modelsWithoutId.has(modelName)) continue;

      const missingIdRows = rows.filter((row) => {
        if (row == null || typeof row !== 'object' || Array.isArray(row)) {
          return true;
        }
        const record = row as Record<string, unknown>;
        return record.id == null || String(record.id).trim() === '';
      }).length;

      if (missingIdRows > 0) {
        throw new Error(
          `File import không hợp lệ: bảng/model "${modelName}" có ${missingIdRows}/${rows.length} dòng thiếu khóa chính "id". Vui lòng export lại bằng phiên bản mới trước khi import.`,
        );
      }
    }
  }

  private getModelTableName(modelName: string): string {
    const entity = this.entityByModelName[modelName];
    if (!entity) return modelName;
    const meta = this.em.getMetadata().find(this.getEntityName(entity));
    return meta?.tableName ?? modelName;
  }

  private toTableKeyedExport(
    data: Record<string, any[]>,
  ): Record<string, any[]> {
    const tableData: Record<string, any[]> = {};
    for (const [modelName, rows] of Object.entries(data)) {
      tableData[this.getModelTableName(modelName)] = rows;
    }
    return tableData;
  }

  private buildModelOrder(): string[] {
    const all = Object.keys(this.entityByModelName);
    const dependencies = new Map<string, Set<string>>();

    for (const modelName of all) {
      dependencies.set(modelName, new Set());
    }

    for (const [modelName, entity] of Object.entries(this.entityByModelName)) {
      const meta = this.em.getMetadata().find(this.getEntityName(entity));
      if (!meta) continue;

      for (const prop of Object.values(meta.properties)) {
        if (!isManyToOneImportProperty(prop)) continue;
        const targetClassName = (
          prop as { targetMeta?: { className?: string } }
        ).targetMeta?.className;
        if (!targetClassName) continue;

        const targetModel = this.resolveModelName(targetClassName);
        if (targetModel && targetModel !== modelName) {
          dependencies.get(modelName)?.add(targetModel);
        }
      }
    }

    const parentFirst: string[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const preferred = [
      ...PREFERRED_MIDDLE_MODEL_ORDER,
      ...all.filter((m) => !PREFERRED_MIDDLE_MODEL_ORDER.includes(m)).sort(),
    ];

    const visit = (modelName: string) => {
      if (visited.has(modelName)) return;
      if (visiting.has(modelName)) return;
      visiting.add(modelName);
      for (const dep of dependencies.get(modelName) ?? []) {
        visit(dep);
      }
      visiting.delete(modelName);
      visited.add(modelName);
      parentFirst.push(modelName);
    };

    for (const modelName of preferred) {
      if (this.entityByModelName[modelName]) visit(modelName);
    }

    // Clear/delete cần con trước cha; import dùng reverse của mảng này.
    return parentFirst.reverse();
  }

  /** Khóa export chuẩn: property name (scalar) hoặc FK column tiếng Anh (`authorId`, …). */
  private getExportFieldKey(prop: EntityProperty): string {
    if (isManyToOneImportProperty(prop)) {
      return prop.fieldNames?.[0] ?? `${prop.name}Id`;
    }
    return prop.name;
  }

  /**
   * Export theo property entity (tiếng Anh, camelCase):
   * - scalar → `name`, `startDate`, …
   * - ManyToOne → FK column (`authorId`, `academicYearId`, …)
   */
  private flattenEntityRowForExport(
    entityKey: string,
    row: object,
  ): Record<string, unknown> {
    const meta = this.em.getMetadata().get(entityKey);
    const entityRow = row as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const prop of Object.values(meta.properties)) {
      if (shouldSkipImportProperty(prop)) continue;
      const exportKey = this.getExportFieldKey(prop);
      const dbField = prop.fieldNames?.[0] ?? prop.name;

      if (isManyToOneImportProperty(prop)) {
        const rel = entityRow[prop.name] ?? entityRow[dbField];
        let pk: unknown = null;
        if (typeof rel === 'string' || typeof rel === 'number') {
          pk = rel;
        } else if (rel && typeof rel === 'object') {
          pk =
            'id' in rel
              ? (rel as { id: unknown }).id
              : wrap(rel, true).getPrimaryKey();
        }
        out[exportKey] = pk;
        continue;
      }

      const val = entityRow[prop.name] ?? entityRow[dbField];
      if (val === undefined) continue;
      const encoded =
        val instanceof Date ? val.toISOString() : (val as unknown);
      out[exportKey] = encoded;
    }

    return out;
  }

  private getWorkbookSheetName(modelName: string): string {
    const tableName = this.getModelTableName(
      this.resolveModelName(modelName) ?? modelName,
    );
    return tableName.slice(0, 31);
  }

  private getDefaultExcelColumns(inputModelName: string): string[] {
    const modelName = this.resolveModelName(inputModelName) ?? inputModelName;
    if (modelName === 'postCategory') return ['postId', 'categoryId'];
    if (modelName === 'postTag') return ['postId', 'tagId'];

    const entity = this.entityByModelName[modelName];
    if (!entity) return [];
    const entityName =
      typeof entity === 'string'
        ? entity
        : typeof entity === 'function'
          ? entity.name
          : String(entity as unknown as string);
    const meta = this.em.getMetadata().find(entityName);
    if (!meta) return [];

    const columns: string[] = [];
    for (const prop of Object.values(meta.properties)) {
      if (shouldSkipImportProperty(prop)) continue;
      columns.push(this.getExportFieldKey(prop));
    }
    return columns;
  }

  private getExcelColumns(
    modelName: string,
    rows: Record<string, unknown>[],
  ): string[] {
    const columns = [...this.getDefaultExcelColumns(modelName)];
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

  private addWorkbookMetadataSheet(
    workbook: ExcelJS.Workbook,
    data: Record<string, any[]>,
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
      const modelName = this.resolveModelName(key) ?? key;
      const tableName = this.getModelTableName(modelName);
      sheet.addRow({
        modelName,
        sheetName: this.getWorkbookSheetName(tableName),
        tableName,
        rowCount: rows.length,
      });
    }
  }

  async exportExcelData(modelName?: string): Promise<Buffer> {
    const data = (await this.exportData(modelName)) as Record<
      string,
      Record<string, unknown>[]
    >;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HUB API';
    workbook.created = new Date();
    workbook.modified = new Date();

    this.addWorkbookMetadataSheet(workbook, data);

    for (const [currentModelName, rows] of Object.entries(data)) {
      const sheet = workbook.addWorksheet(
        this.getWorkbookSheetName(currentModelName),
      );
      const columns = this.getExcelColumns(currentModelName, rows);

      if (columns.length === 0) {
        sheet.addRow(['id']);
        continue;
      }

      sheet.columns = columns.map((column) => ({
        header: column,
        key: column,
        width: Math.max(14, Math.min(40, column.length + 4)),
      }));
      sheet.getRow(1).font = { bold: true };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length },
      };

      for (const row of rows) {
        const encodedRow: Record<string, string | number | boolean> = {};
        for (const column of columns) {
          encodedRow[column] = encodeExcelCellValue(row[column]);
        }
        sheet.addRow(encodedRow);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async importExcelData(
    fileBuffer: Buffer,
    targetModel?: string,
    skipClear: boolean = false,
    onProgress?: (event: object) => void,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as unknown as ExcelWorkbookLoadInput);

    const metaSheet = workbook.getWorksheet(EXCEL_META_SHEET);
    const sheetMap = new Map<string, string>();
    if (metaSheet) {
      metaSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const modelName = row.getCell(1).text?.trim();
        const sheetName = row.getCell(2).text?.trim();
        const tableName = row.getCell(3).text?.trim();
        if (modelName && sheetName) {
          sheetMap.set(modelName, sheetName);
          if (tableName) sheetMap.set(tableName, sheetName);
        }
      });
    }

    const resolvedTargetModel =
      this.resolveModelName(targetModel) ?? targetModel;
    const modelNames = resolvedTargetModel
      ? [resolvedTargetModel]
      : sheetMap.size > 0
        ? [...sheetMap.keys()]
        : workbook.worksheets
            .map((sheet) => sheet.name)
            .filter((name) => name !== EXCEL_META_SHEET);

    const data: Record<string, any[]> = {};

    for (const rawModelName of modelNames) {
      const modelName = this.resolveModelName(rawModelName) ?? rawModelName;
      const worksheet =
        workbook.getWorksheet(sheetMap.get(rawModelName) ?? rawModelName) ??
        workbook.getWorksheet(rawModelName) ??
        workbook.getWorksheet(modelName);
      if (!worksheet) continue;

      const headerRow = worksheet.getRow(1);
      const headerValues = Array.isArray(headerRow.values)
        ? headerRow.values.slice(1)
        : [];
      const headers = headerValues
        .map((value) => String(value ?? '').trim())
        .filter(Boolean);
      if (headers.length === 0) {
        data[modelName] = [];
        continue;
      }

      const rows: Record<string, unknown>[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const record: Record<string, unknown> = {};
        let hasValue = false;

        headers.forEach((header, index) => {
          const parsed = parseExcelCellValue(row.getCell(index + 1).value);
          if (parsed === undefined) return;
          record[header] = parsed;
          hasValue = true;
        });

        if (hasValue) {
          rows.push(record);
        }
      });

      data[modelName] = rows;
    }

    return this.importData(
      data,
      resolvedTargetModel,
      skipClear,
      onProgress,
      actingUserIdHeader,
      actingUserEmailHeader,
    );
  }

  /** Bỏ pivot trỏ tới post/category không tồn tại (tránh lỗi FK / file export lệch). */
  private async filterSanitizedPostCategories(
    em: EntityManager,
    sanitized: Record<string, unknown>[],
    idMap?: LegacyImportIdMap,
  ): Promise<Record<string, unknown>[]> {
    if (idMap) {
      for (const row of sanitized) {
        for (const [field, model, rel] of [
          ['postId', 'post', 'post'],
          ['categoryId', 'category', 'category'],
        ] as const) {
          const raw = pivotFk(row, field, rel);
          if (!raw) continue;
          const resolved = await idMap.resolve(em, model, raw);
          if (resolved != null) row[field] = resolved;
        }
      }
    }

    const postIds = [
      ...new Set(
        sanitized
          .map((r) => relationEntityId(pivotFk(r, 'postId', 'post')))
          .filter((id): id is number => id != null),
      ),
    ];
    const categoryIds = [
      ...new Set(
        sanitized
          .map((r) => relationEntityId(pivotFk(r, 'categoryId', 'category')))
          .filter((id): id is number => id != null),
      ),
    ];
    const [existingPosts, existingCats] = await Promise.all([
      postIds.length
        ? em.find(this.modelEntity('post'), { id: { $in: postIds } }, { fields: ['id'] })
        : [],
      categoryIds.length
        ? em.find(this.modelEntity('category'), { id: { $in: categoryIds } }, { fields: ['id'] })
        : [],
    ]);
    const pSet = new Set(existingPosts.map((p) => p.id));
    const cSet = new Set(existingCats.map((c) => c.id));
    const out = sanitized.filter((r) => {
      const pid = relationEntityId(pivotFk(r, 'postId', 'post'));
      const cid = relationEntityId(pivotFk(r, 'categoryId', 'category'));
      return pid != null && cid != null && pSet.has(pid) && cSet.has(cid);
    });
    if (out.length < sanitized.length) {
      this.logger.warn(
        `postCategory: bỏ qua ${sanitized.length - out.length} dòng (post/category FK chưa resolve hoặc không có trong DB — import post và category trước).`,
      );
    }
    return out;
  }

  /** Category: insert theo thứ tự cha→con, map legacy parentId sau từng dòng. */
  private async insertCategoriesWithLegacyParents(
    em: EntityManager,
    rawRecords: Record<string, unknown>[],
    sanitized: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    onRowError?: (index: number, message: string) => void,
  ): Promise<{ imported: number; skipped: number }> {
    const sanitizedBySlug = new Map<string, Record<string, unknown>>();
    for (const row of sanitized) {
      const slug = typeof row.slug === 'string' ? row.slug.trim() : '';
      if (slug) sanitizedBySlug.set(slug, row);
    }

    const orderedRaw = orderCategoryRowsForImport(
      rawRecords.map((raw) => ({
        ...raw,
        parent: raw.parent ?? raw.parentId,
      })) as ImportRow[],
    );
    let imported = 0;
    let skipped = 0;

    for (let index = 0; index < orderedRaw.length; index++) {
      const raw = orderedRaw[index];
      const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
      if (!slug || !sanitizedBySlug.has(slug)) {
        skipped++;
        continue;
      }
      const row = { ...sanitizedBySlug.get(slug)! };
      if (row.type == null || row.type === '') row.type = 'post';
      if (row.sortOrder == null) row.sortOrder = 0;

      const parentLegacy = exportLegacyKey(raw.parent ?? raw.parentId);
      if (parentLegacy) {
        const parentId = await idMap.resolve(em, 'category', parentLegacy);
        if (parentId != null) {
          row.parentId = parentId;
        }
      }

      try {
        await em.insert(this.modelEntity('category'), row as object);
        imported++;
        if (raw) {
          const legacy = exportLegacyKey(raw.id);
          if (legacy && slug) {
            const inserted = await em.findOne(
              this.modelEntity('category'),
              { slug },
              { fields: ['id'] },
            );
            if (inserted?.id) {
              await idMap.persist(em, 'category', legacy, inserted.id);
            }
          }
        }
      } catch (err: unknown) {
        skipped++;
        const errMsg = getErrorMessage(err);
        if (!isSkippableImportRowError(errMsg)) {
          onRowError?.(index, errMsg);
          throw err;
        }
      }
    }

    await em.flush();
    return { imported, skipped };
  }

  private applyUserImportRowsDefaults(
    rows: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const now = new Date();
    const fallbackHash = getImportUserFallbackPasswordHash();
    let missingPw = 0;
    const next = rows.map((row) => {
      const r = { ...row };
      const pw = r.password;
      if (pw == null || (typeof pw === 'string' && pw.trim() === '')) {
        r.password = fallbackHash;
        missingPw++;
      }
      r.createdAt = coerceImportDate(r.createdAt, now);
      r.updatedAt = coerceImportDate(r.updatedAt, now);
      if (r.isActive === undefined) r.isActive = true;
      else r.isActive = Boolean(r.isActive);
      return r;
    });
    if (missingPw > 0) {
      this.logger.warn(
        `user import: ${missingPw} bản ghi thiếu password — dùng hash từ IMPORT_FALLBACK_PASSWORD_PLAIN (mặc định ImportFallback#2026). Yêu cầu đổi mật khẩu sau đăng nhập.`,
      );
    }
    return next;
  }

  /** Tránh 500 FK: chỉ chèn user_roles khi user + role đã có trong DB. */
  private async filterSanitizedUserRoles(
    em: EntityManager,
    sanitized: Record<string, unknown>[],
  ): Promise<Record<string, unknown>[]> {
    const userIds = [
      ...new Set(
        sanitized
          .map((r) => relationEntityId(pivotFk(r, 'userId', 'user')))
          .filter((id): id is number => id != null),
      ),
    ];
    const roleIds = [
      ...new Set(
        sanitized
          .map((r) => relationEntityId(pivotFk(r, 'roleId', 'role')))
          .filter((id): id is number => id != null),
      ),
    ];
    const [users, roles] = await Promise.all([
      userIds.length
        ? em.find(this.modelEntity('user'), { id: { $in: userIds } }, { fields: ['id'] })
        : [],
      roleIds.length
        ? em.find(this.modelEntity('role'), { id: { $in: roleIds } }, { fields: ['id'] })
        : [],
    ]);
    const uSet = new Set(users.map((u) => u.id));
    const rSet = new Set(roles.map((ro) => ro.id));
    let out = sanitized.filter((row) => {
      const uid = relationEntityId(pivotFk(row, 'userId', 'user'));
      const rid = relationEntityId(pivotFk(row, 'roleId', 'role'));
      return uid != null && rid != null && uSet.has(uid) && rSet.has(rid);
    });
    if (out.length < sanitized.length) {
      this.logger.warn(
        `userRole: bỏ qua ${sanitized.length - out.length} dòng (userId hoặc roleId không tồn tại — import user và role trước).`,
      );
    }

    if (out.length > 0) {
      const existingLinks = await em.find(
        this.modelEntity('userRole'),
        {
          user: { $in: userIds },
          role: { $in: roleIds },
        },
        { populate: ['user', 'role'] },
      );
      const existingPairs = new Set(
        existingLinks.map(
          (link) =>
            `${relationEntityId(link.user)}:${relationEntityId(link.role)}`,
        ),
      );
      const beforeExisting = out.length;
      out = out.filter((row) => {
        const uid = relationEntityId(pivotFk(row, 'userId', 'user'));
        const rid = relationEntityId(pivotFk(row, 'roleId', 'role'));
        if (uid == null || rid == null) return false;
        return !existingPairs.has(`${uid}:${rid}`);
      });
      if (out.length < beforeExisting) {
        this.logger.log(
          `userRole: bỏ qua ${beforeExisting - out.length} dòng đã tồn tại (userId, roleId).`,
        );
      }
    }

    return out;
  }

  private async filterSanitizedFkPivot(
    em: EntityManager,
    sanitized: Record<string, unknown>[],
    options: {
      leftKey: string;
      leftRel: string;
      leftEntity: EntityName<any>;
      rightKey: string;
      rightRel: string;
      rightEntity: EntityName<any>;
      label: string;
    },
  ): Promise<Record<string, unknown>[]> {
    const leftIds = [
      ...new Set(
        sanitized
          .map((r) => pivotFk(r, options.leftKey, options.leftRel))
          .filter(Boolean),
      ),
    ];
    const rightIds = [
      ...new Set(
        sanitized
          .map((r) => pivotFk(r, options.rightKey, options.rightRel))
          .filter(Boolean),
      ),
    ];
    const [leftRows, rightRows] = await Promise.all([
      leftIds.length
        ? em.find(
            options.leftEntity,
            { id: { $in: leftIds } },
            { fields: ['id'] },
          )
        : [],
      rightIds.length
        ? em.find(
            options.rightEntity,
            { id: { $in: rightIds } },
            { fields: ['id'] },
          )
        : [],
    ]);
    const leftSet = new Set(
      leftRows.map((r) => String((r as { id: unknown }).id)),
    );
    const rightSet = new Set(
      rightRows.map((r) => String((r as { id: unknown }).id)),
    );
    const out = sanitized.filter((row) => {
      const left = pivotFk(row, options.leftKey, options.leftRel);
      const right = pivotFk(row, options.rightKey, options.rightRel);
      return Boolean(left && right && leftSet.has(left) && rightSet.has(right));
    });
    if (out.length < sanitized.length) {
      this.logger.warn(
        `${options.label}: bỏ qua ${sanitized.length - out.length} dòng (FK không tồn tại trong DB).`,
      );
    }
    return out;
  }

  /**
   * Lọc FK theo metadata thật của entity: fieldName DB (`createdById`) hoặc
   * property relation (`createdBy`) đều được hiểu. Cách này tự bắt các bảng
   * liên kết mới mà không cần bổ sung hard-code từng bảng.
   */
  private async filterRowsByExistingManyToOneRefs(
    em: EntityManager,
    modelName: string,
    rows: Record<string, unknown>[],
  ): Promise<Record<string, unknown>[]> {
    const entity = this.entityByModelName[modelName];
    if (!entity || rows.length === 0) return rows;

    const meta = em.getMetadata().find(this.getEntityName(entity));
    if (!meta) return rows;

    let filtered = rows;
    for (const prop of Object.values(meta.properties)) {
      if (!isManyToOneImportProperty(prop)) continue;

      const targetClassName = (prop as { targetMeta?: { className?: string } })
        .targetMeta?.className;
      if (!targetClassName) continue;
      if (targetClassName === meta.className) continue;

      const fieldName = prop.fieldNames?.[0] ?? `${prop.name}Id`;
      const nullable = Boolean(prop.nullable);
      const ids = [
        ...new Set(
          filtered
            .map((row) => relationEntityId(pivotFk(row, fieldName, prop.name)))
            .filter((id): id is number => id != null),
        ),
      ];

      const existingRows = ids.length
        ? await em.find(
            targetClassName as EntityName<any>,
            { id: { $in: ids } },
            { fields: ['id'] },
          )
        : [];
      const existingIds = new Set(
        existingRows.map((row) => (row as { id: number }).id),
      );

      const before = filtered.length;
      filtered = filtered.filter((row) => {
        const id = relationEntityId(pivotFk(row, fieldName, prop.name));
        if (id == null) return nullable;
        return existingIds.has(id);
      });

      if (filtered.length < before) {
        this.logger.warn(
          `${modelName}: bỏ qua ${before - filtered.length} dòng vì FK ${fieldName} -> ${targetClassName}.id không tồn tại.`,
        );
      }
      if (filtered.length === 0) break;
    }

    return filtered;
  }

  private sanitizeExportedPivotTables(data: Record<string, unknown>): void {
    const {
      droppedPostCategory,
      droppedPostTag,
      droppedEventSpeaker,
      droppedEventRegistration,
      droppedEventCheckin,
      droppedGroupMember,
      droppedMessageRead,
      droppedUserRole,
    } = sanitizePivotRowsInExportJson(data);
    if (droppedPostCategory > 0) {
      this.logger.warn(
        `Export: loại ${droppedPostCategory} postCategory trỏ tới post/category không có trong cùng file export.`,
      );
    }
    if (droppedPostTag > 0) {
      this.logger.warn(
        `Export: loại ${droppedPostTag} postTag trỏ tới post/tag không có trong cùng file export.`,
      );
    }
    if (droppedEventSpeaker > 0) {
      this.logger.warn(
        `Export: loại ${droppedEventSpeaker} eventSpeaker trỏ tới event/speaker không có trong cùng file export.`,
      );
    }
    if (droppedEventRegistration > 0) {
      this.logger.warn(
        `Export: loại ${droppedEventRegistration} eventRegistration trỏ tới event không có trong cùng file export.`,
      );
    }
    if (droppedEventCheckin > 0) {
      this.logger.warn(
        `Export: loại ${droppedEventCheckin} eventCheckin trỏ tới event không có trong cùng file export.`,
      );
    }
    if (droppedGroupMember > 0) {
      this.logger.warn(
        `Export: loại ${droppedGroupMember} groupMember trỏ tới group/user không có trong cùng file export.`,
      );
    }
    if (droppedMessageRead > 0) {
      this.logger.warn(
        `Export: loại ${droppedMessageRead} messageRead trỏ tới message/user không có trong cùng file export.`,
      );
    }
    if (droppedUserRole > 0) {
      this.logger.warn(
        `Export: loại ${droppedUserRole} userRole trỏ tới user/role không có trong cùng file export.`,
      );
    }
  }

  /**
   * pageContent: dùng persist + flush (như seed-full-export), tránh lỗi insertMany + cột JSON trên MySQL.
   */
  private async insertPageContentsWithPersist(
    em: EntityManager,
    rows: Record<string, unknown>[],
  ): Promise<{ imported: number; skipped: number }> {
    const now = new Date();
    const seenKeys = new Set<string>();
    let imported = 0;
    let skipped = 0;

    for (const r of rows) {
      const pageKey =
        r.pageKey != null ? String(r.pageKey as string | number).trim() : '';
      const sectionKey =
        r.sectionKey != null
          ? String(r.sectionKey as string | number).trim()
          : '';
      if (!pageKey || !sectionKey) {
        skipped++;
        continue;
      }
      const dedupeKey = `${pageKey}\0${sectionKey}`;
      if (seenKeys.has(dedupeKey)) {
        skipped++;
        continue;
      }
      seenKeys.add(dedupeKey);

      const contentRaw = normalizeContentJsonForImport(r.content);
      const content = plainJsonRecord(contentRaw);
      const e = this.createEntityInstance('pageContent');
      const pk = coerceImportPrimaryKey(r.id);
      if (pk != null) e.id = pk;
      e.pageKey = pageKey;
      e.sectionKey = sectionKey;
      e.content = content;
      e.isVisible = Boolean(r.isVisible ?? true);
      e.createdAt = coerceImportDate(r.createdAt, now);
      e.updatedAt = coerceImportDate(r.updatedAt, now);
      em.persist(e);
      imported++;
    }

    if (imported === 0 && rows.length > 0) {
      throw new Error(
        'pageContent import: không có dòng hợp lệ (thiếu pageKey/sectionKey)',
      );
    }

    await em.flush();
    return { imported, skipped };
  }

  private reportImportRowError(
    onRowError: ((index: number, message: string) => void) | undefined,
    rowIndex: number,
    errMsg: string,
  ): void {
    if (isSkippableImportRowError(errMsg)) return;
    onRowError?.(rowIndex, errMsg);
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
  ): Promise<{
    imported: number;
    skipped: number;
    total: number;
    insertMs: number;
  }> {
    const insertStarted = Date.now();
    const done = (result: {
      imported: number;
      skipped: number;
      total: number;
    }) => ({
      ...result,
      insertMs: Date.now() - insertStarted,
    });

    const entity = this.entityByModelName[mName];
    const total = sanitized.length;
    if (!entity || sanitized.length === 0)
      return done({ imported: 0, skipped: 0, total });

    if (
      mName === 'category' &&
      importContext?.rawRecords?.length &&
      importContext.idMap
    ) {
      const categoryResult = await this.insertCategoriesWithLegacyParents(
        em,
        importContext.rawRecords,
        sanitized,
        importContext.idMap,
        onRowError,
      );
      return done({
        imported: categoryResult.imported,
        skipped: categoryResult.skipped,
        total,
      });
    }

    let rows = sanitized;
    rows = await this.filterRowsByExistingManyToOneRefs(em, mName, rows);
    if (rows.length === 0) return done({ imported: 0, skipped: total, total });

    if (mName === 'postCategory') {
      rows = await this.filterSanitizedPostCategories(
        em,
        rows,
        importContext?.idMap,
      );
      if (rows.length === 0)
        return done({ imported: 0, skipped: total, total });
    }

    if (mName === 'user') {
      rows = this.applyUserImportRowsDefaults(rows);
    }

    if (mName === 'userRole') {
      await em.flush();
      rows = await this.filterSanitizedUserRoles(em, rows);
      if (rows.length === 0)
        return done({ imported: 0, skipped: total, total });
    }

    if (mName === 'eventSpeaker') {
      rows = await this.filterSanitizedFkPivot(em, rows, {
        leftKey: 'eventId',
        leftRel: 'event',
        leftEntity: this.modelEntity('event'),
        rightKey: 'speakerId',
        rightRel: 'speaker',
        rightEntity: this.modelEntity('speaker'),
        label: 'eventSpeaker',
      });
      if (rows.length === 0)
        return done({ imported: 0, skipped: total, total });
    }

    if (mName === 'groupMember') {
      rows = await this.filterSanitizedFkPivot(em, rows, {
        leftKey: 'groupId',
        leftRel: 'group',
        leftEntity: this.modelEntity('group'),
        rightKey: 'userId',
        rightRel: 'user',
        rightEntity: this.modelEntity('user'),
        label: 'groupMember',
      });
      if (rows.length === 0)
        return done({ imported: 0, skipped: total, total });
    }

    if (mName === 'messageRead') {
      rows = await this.filterSanitizedFkPivot(em, rows, {
        leftKey: 'messageId',
        leftRel: 'message',
        leftEntity: this.modelEntity('message'),
        rightKey: 'userId',
        rightRel: 'user',
        rightEntity: this.modelEntity('user'),
        label: 'messageRead',
      });
      if (rows.length === 0)
        return done({ imported: 0, skipped: total, total });
    }

    if (mName === 'eventRegistration' || mName === 'eventCheckin') {
      const eventIds = [
        ...new Set(
          rows.map((r) => pivotFk(r, 'eventId', 'event')).filter(Boolean),
        ),
      ];
      const events = eventIds.length
        ? await em.find(
            this.modelEntity('event'),
            { id: { $in: toEntityIdList(eventIds) } },
            { fields: ['id'] },
          )
        : [];
      const eventSet = new Set(events.map((e) => e.id));
      const filtered = rows.filter((row) => {
        const eid = pivotFk(row, 'eventId', 'event');
        return Boolean(eid && eventSet.has(toEntityId(String(eid))));
      });
      if (filtered.length < rows.length) {
        this.logger.warn(
          `${mName}: bỏ qua ${rows.length - filtered.length} dòng (eventId không tồn tại).`,
        );
      }
      rows = filtered;
      if (rows.length === 0)
        return done({ imported: 0, skipped: total, total });
    }

    if (mName === 'role') {
      const beforeDedupe = rows.length;
      const seenKeys = new Set<string>();
      rows = rows
        .filter((r) => {
          const pk = coerceImportPrimaryKey(r.id);
          const name = String(r.name ?? '').trim();
          const key =
            pk != null ? `id:${pk}` : name ? `name:${name}` : undefined;
          if (!key || seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        })
        .map((r) => ({
          ...r,
          permissions: stripHeroSlidesPermissions(r.permissions),
        }));
      if (rows.length < beforeDedupe) {
        this.logger.warn(
          `${mName}: bỏ qua ${beforeDedupe - rows.length} dòng trùng id/name trong file import.`,
        );
      }
    }

    if (mName === 'pageContent') {
      const pageStats = await this.insertPageContentsWithPersist(em, rows);
      return done({
        imported: pageStats.imported,
        skipped: total - pageStats.imported,
        total,
      });
    }

    const preFilterSkipped = total - rows.length;
    let imported = 0;
    let skipped = preFilterSkipped;
    const startTime = Date.now();
    const defaultBatchSize = Math.max(
      1,
      parseInt(process.env.SYSTEM_IMPORT_DB_BATCH_SIZE || '500', 10) || 500,
    );
    const jsonChunkSize = Math.max(
      1,
      parseInt(process.env.SYSTEM_IMPORT_JSON_BATCH_SIZE || '40', 10) || 40,
    );
    const proactiveChunkSize = JSON_HEAVY_IMPORT_MODELS.has(mName)
      ? rows.length <= 200
        ? rows.length
        : Math.min(jsonChunkSize, rows.length)
      : rows.length;

    const insertManyChunks = async (
      chunkRows: object[],
      batchSize: number,
    ): Promise<void> => {
      for (let i = 0; i < chunkRows.length; i += batchSize) {
        const chunk = chunkRows.slice(i, i + batchSize);
        try {
          await em.insertMany(entity, chunk);
          imported += chunk.length;
        } catch (inner: unknown) {
          const innerMsg = getErrorMessage(inner);
          this.logger.debug(
            `Batch insert failed for ${mName}, fallback từng dòng: ${innerMsg}`,
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
                this.reportImportRowError(onRowError, rowIndex, errMsg);
                throw rowErr;
              }
            }
          }
        }
      }
    };

    if (proactiveChunkSize < rows.length) {
      this.logger.debug(
        `${mName}: insertMany theo lô ${proactiveChunkSize} (JSON-heavy)…`,
      );
      await insertManyChunks(rows as object[], proactiveChunkSize);
    } else {
      try {
        await em.insertMany(entity, rows as object[]);
        imported = rows.length;
      } catch (e: unknown) {
        const message = getErrorMessage(e);
        this.logger.warn(
          `insertMany toàn bộ ${mName} thất bại (${message}), thử theo lô nhỏ hơn…`,
        );
        await insertManyChunks(rows as object[], defaultBatchSize);
      }
    }
    this.logger.debug(
      `Imported ${imported}/${total} records into ${mName} in ${Date.now() - startTime}ms${skipped > 0 ? ` (${skipped} skipped)` : ''}`,
    );
    return done({ imported, skipped, total });
  }

  private parseImportActingUserId(
    actingUserIdHeader?: string,
  ): number | undefined {
    const raw = actingUserIdHeader?.trim();
    if (!raw) return undefined;
    try {
      return parseEntityId(raw);
    } catch {
      return undefined;
    }
  }

  private parseImportActingUserEmail(
    actingUserEmailHeader?: string,
  ): string | undefined {
    const email = actingUserEmailHeader?.trim().toLowerCase();
    return email || undefined;
  }

  private async ensureActingUserRoleAfterImportFromHeaders(
    em: EntityManager,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ): Promise<void> {
    await this.bootstrap.ensureActingUserRoleAfterImport(
      em,
      this.parseImportActingUserId(actingUserIdHeader),
      this.parseImportActingUserEmail(actingUserEmailHeader),
    );
  }

  /** Giữ user đang import để các lô HTTP tiếp theo không bị 401 (PermissionsGuard). */
  private resolvePreserveUserIdForImport(
    skipClear: boolean,
    clearsUserTable: boolean,
    actingUserIdHeader?: string,
  ): number | undefined {
    if (skipClear || !clearsUserTable) return undefined;
    return this.parseImportActingUserId(actingUserIdHeader);
  }

  private async filterUserRowsForActingUserPreserve(
    em: EntityManager,
    rows: Record<string, unknown>[],
    preserveUserId?: number,
  ): Promise<Record<string, unknown>[]> {
    if (preserveUserId == null) return rows;

    const preserved = await em.findOne(
      this.modelEntity('user'),
      { id: preserveUserId },
      { fields: ['id', 'email'] },
    );
    const preservedEmail = preserved?.email?.trim().toLowerCase() ?? '';

    const filtered = rows.filter((row) => {
      if (row.id != null && row.id !== '') {
        try {
          if (toEntityId(row.id as string | number) === preserveUserId) {
            return false;
          }
        } catch {
          /* id legacy (UUID) — kiểm tra email bên dưới */
        }
      }
      if (preservedEmail) {
        const email =
          typeof row.email === 'string' ? row.email.trim().toLowerCase() : '';
        if (email && email === preservedEmail) return false;
      }
      return true;
    });
    if (filtered.length < rows.length) {
      this.logger.log(
        `Import user: bỏ qua ${rows.length - filtered.length} bản ghi trùng user #${preserveUserId} (id/email) — giữ phiên admin hiện tại.`,
      );
    }
    return filtered;
  }

  /** MySQL + FOREIGN_KEY_CHECKS=0: xóa user rồi insert lại cùng transaction — FK tạm orphan, không cần UPDATE hàng loạt. */
  private shouldFastClearUsersForImport(
    isMysqlFamily: boolean,
    skipClear: boolean,
  ): boolean {
    return isMysqlFamily && !skipClear;
  }

  private async clearUsersTableForImport(
    em: EntityManager,
    preserveUserId?: number,
    options?: { fastPath?: boolean },
  ): Promise<void> {
    const started = Date.now();
    if (!options?.fastPath) {
      await this.detachUserForeignKeysBeforeImportClear(em, preserveUserId);
      this.logger.log(
        `Import user clear: detach FK ${Date.now() - started}ms`,
      );
    } else {
      this.logger.log(
        'Import user clear: fast path (MySQL FK_CHECKS=0, bỏ qua detach FK hàng loạt).',
      );
    }
    const deleteStarted = Date.now();
    if (preserveUserId != null) {
      const deleted = await em.nativeDelete(this.modelEntity('user'), {
        id: { $ne: preserveUserId },
      });
      this.logger.log(
        `Import user: giữ user #${preserveUserId} cho phiên import; đã xóa ${deleted} user khác (${Date.now() - deleteStarted}ms).`,
      );
    } else {
      await em.nativeDelete(this.modelEntity('user'), {});
      this.logger.debug(
        `Import user clear: nativeDelete all ${Date.now() - deleteStarted}ms`,
      );
    }
    em.clear();
  }

  /**
   * Trước khi xóa users: gỡ FK nullable + tránh CASCADE xóa dữ liệu đã import
   * (posts, sessions, notifications…) khi giữ user đang thao tác import.
   */
  private async detachUserForeignKeysBeforeImportClear(
    em: EntityManager,
    preserveUserId?: number,
  ): Promise<void> {
    await this.detachNullableUserForeignKeys(em, preserveUserId);
    if (preserveUserId == null) return;

    const notPreserved = { $ne: preserveUserId };

    const reassignUserFk = async (
      modelKey: string,
      relation: string,
      label: string,
    ): Promise<void> => {
      const entity = this.entityByModelName[modelKey];
      if (!entity) return;
      const count = await em.nativeUpdate(
        entity,
        { [relation]: notPreserved },
        { [relation]: preserveUserId },
      );
      if (count > 0) {
        this.logger.log(
          `Import user: chuyển ${count} ${label} sang user #${preserveUserId}.`,
        );
      }
    };

    await reassignUserFk('post', 'author', 'bài viết');
    await reassignUserFk('comment', 'author', 'bình luận');
    await reassignUserFk('group', 'creator', 'nhóm');

    const sessionEntity = this.entityByModelName.session;
    if (sessionEntity) {
      const deleted = await em.nativeDelete(sessionEntity, {
        user: notPreserved,
      });
      if (deleted > 0) {
        this.logger.log(
          `Import user: xóa ${deleted} session của user sẽ thay thế (import lại sau).`,
        );
      }
    }

    const notificationEntity = this.entityByModelName.notification;
    if (notificationEntity) {
      const deleted = await em.nativeDelete(notificationEntity, {
        user: notPreserved,
      });
      if (deleted > 0) {
        this.logger.log(
          `Import user: xóa ${deleted} notification của user sẽ thay thế.`,
        );
      }
    }

    const storageFileEntity = this.entityByModelName.storageFile;
    if (storageFileEntity) {
      await em.nativeUpdate(
        storageFileEntity,
        { uploadedBy: notPreserved },
        { uploadedBy: null },
      );
    }

    const eventEntity = this.entityByModelName.event;
    if (eventEntity) {
      await em.nativeUpdate(
        eventEntity,
        { createdBy: notPreserved },
        { createdBy: null },
      );
    }
  }

  /**
   * Trước khi xóa users: bỏ liên kết nullable tới users (FK thường là NO ACTION).
   * Khi giữ user đang import (`preserveUserId`), chỉ gỡ FK trỏ tới user sẽ bị xóa —
   * tránh UPDATE toàn bảng (vd. contact_requests hàng nghìn dòng) gây lock chậm.
   */
  private async detachNullableUserForeignKeys(
    em: EntityManager,
    preserveUserId?: number,
  ): Promise<void> {
    const nullifyNullableUserFk = async (
      modelKey: string,
      relations: string[],
    ): Promise<void> => {
      const entity = this.entityByModelName[modelKey];
      if (!entity) return;

      if (preserveUserId == null) {
        const patch: Record<string, null> = {};
        for (const relation of relations) patch[relation] = null;
        await em.nativeUpdate(entity, {}, patch);
        return;
      }

      const notPreserved = { $ne: preserveUserId };
      for (const relation of relations) {
        await em.nativeUpdate(
          entity,
          { [relation]: notPreserved },
          { [relation]: null },
        );
      }
    };

    await nullifyNullableUserFk('contactRequest', [
      'submittedBy',
      'assignedTo',
    ]);
    await nullifyNullableUserFk('message', ['receiver', 'sender']);
    await nullifyNullableUserFk('student', ['user']);
  }

  /**
   * categories.parentId → categories.id: schema thực tế có thể ON DELETE NO ACTION.
   * nativeDelete toàn bảng sẽ lỗi khi còn hàng con trỏ tới cha — bỏ liên kết cây trước.
   */
  private async clearCategoryTableForImport(
    em: EntityManager,
    isMysqlFamily: boolean,
  ): Promise<void> {
    const meta = em.getMetadata().get(this.getEntityName(this.modelEntity('category')));
    const table = meta.tableName;
    if (isMysqlFamily) {
      await em.getConnection().execute(`TRUNCATE TABLE \`${table}\``);
      return;
    }
    const parentCol = meta.properties.parent?.fieldNames[0] ?? 'parentId';
    await em
      .getConnection()
      .execute(`UPDATE \`${table}\` SET \`${parentCol}\` = NULL`);
    await em.nativeDelete(this.modelEntity('category'), {});
  }

  /** Thứ tự xóa trước import — RBAC bundle: role xóa user_roles trước, bỏ clear userRole riêng. */
  private resolveImportClearOrder(modelNames: string[]): string[] {
    const set = new Set(modelNames);
    const hasRbacBundle =
      set.has('role') && set.has('user') && set.has('userRole');
    if (hasRbacBundle) {
      const out: string[] = [];
      if (set.has('role')) out.push('role');
      if (set.has('user')) out.push('user');
      for (const m of this.modelOrder) {
        if (set.has(m) && m !== 'role' && m !== 'user' && m !== 'userRole') {
          out.push(m);
        }
      }
      return out;
    }
    return this.modelOrder.filter((m) => set.has(m));
  }

  /** Excel/JSON export dùng __HUB_NULL__ — sửa cột date nullable bị ghi literal sau import. */
  private resolveRepairNullMarkerTables(importedModelNames?: string[]): string[] {
    const repairableModels = new Set([
      'role',
      'user',
      'category',
      'tag',
      'post',
      'contactRequest',
      'seoMeta',
      'pageContent',
    ]);
    if (!importedModelNames?.length) {
      return [
        'roles',
        'users',
        'categories',
        'tags',
        'posts',
        'contact_requests',
        'seo_metas',
        'page_contents',
      ];
    }
    return [
      ...new Set(
        importedModelNames
          .filter((m) => repairableModels.has(m))
          .map((m) => this.getModelTableName(m)),
      ),
    ];
  }

  private async repairImportNullMarkerValues(
    em: EntityManager,
    importedModelNames?: string[],
  ): Promise<void> {
    const conn = em.getConnection();
    const driverName = em.getDriver().constructor.name;
    if (!/mysql|mariadb/i.test(driverName)) return;

    const tables = this.resolveRepairNullMarkerTables(importedModelNames);
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
          this.logger.log(
            `Import repair: ${table}.deletedAt — đã chuyển ${count} giá trị ${EXCEL_NULL_MARKER} → NULL (${elapsed}ms).`,
          );
        } else if (elapsed > 200) {
          this.logger.warn(
            `Import repair: ${table}.deletedAt — 0 dòng, nhưng mất ${elapsed}ms (có thể chờ lock).`,
          );
        }
      } catch {
        /* bảng/cột có thể không tồn tại trên product line */
      }
    }
    em.clear();
  }

  /** Xóa sạch bảng trước import — role cần xóa user_roles trước để tránh FK / dữ liệu còn sót. */
  private async clearModelTableForImport(
    em: EntityManager,
    mName: string,
    isMysqlFamily: boolean,
    isSqlite: boolean,
    preserveUserId?: number,
    skipClear: boolean = false,
  ): Promise<void> {
    if (mName === 'user') {
      await this.clearUsersTableForImport(em, preserveUserId, {
        fastPath: this.shouldFastClearUsersForImport(isMysqlFamily, skipClear),
      });
      return;
    }
    if (mName === 'category') {
      await this.clearCategoryTableForImport(em, isMysqlFamily);
      em.clear();
      return;
    }
    if (mName === 'role') {
      // DELETE trong transaction — TRUNCATE là DDL (implicit commit + metadata lock mạnh trên MySQL).
      await em.nativeDelete(this.modelEntity('userRole'), {});
      await em.nativeDelete(this.modelEntity('role'), {});
      em.clear();
      return;
    }
    if (mName === 'setting') {
      const deleted = await em.nativeDelete(this.modelEntity('setting'), {
        group: { $ne: IMPORT_ID_MAP_GROUP },
      });
      this.logger.log(
        `Import setting: giữ ${IMPORT_ID_MAP_GROUP}; đã xóa ${deleted} setting khác.`,
      );
      em.clear();
      return;
    }

    const entity = this.entityByModelName[mName];
    if (entity) {
      await em.nativeDelete(entity, {});
      em.clear();
    }
  }

  /**
   * Một request: xóa user (CASCADE xóa user_roles) + insert user + insert user_roles.
   * Tránh 403 giữa các HTTP: sau khi replace user, phiên hiện tại mất role nếu userRole ở request sau.
   */
  private appendImportBundleToPayload(
    data: Record<string, any[]>,
    primary: string,
    payload: Record<string, any[]>,
    skipModels: Set<string>,
  ): string[] {
    const bundled: string[] = [];
    for (const extra of IMPORT_MODEL_BUNDLES[primary] ?? []) {
      if (skipModels.has(extra)) continue;
      if (!Object.prototype.hasOwnProperty.call(data, extra)) continue;
      payload[extra] = Array.isArray(data[extra]) ? data[extra] : [];
      skipModels.add(extra);
      bundled.push(extra);
    }
    return bundled;
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

    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      const driverName = em.getDriver().constructor.name;
      const isMysqlFamily = /mysql|mariadb/i.test(driverName);
      const isSqlite = /sqlite/i.test(driverName);

      if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
      if (isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

      const idMap = new LegacyImportIdMap(
        this.modelEntity('setting') as unknown as new () => Record<string, unknown>,
      );

      try {
        const clearOrder = this.resolveImportClearOrder(modelNames);

        const preserveUserId = this.resolvePreserveUserIdForImport(
          skipClear,
          clearOrder.includes('user'),
          actingUserIdHeader,
        );

        if (!skipClear) {
          for (const mName of clearOrder) {
            const clearStart = Date.now();
            await this.clearModelTableForImport(
              em,
              mName,
              isMysqlFamily,
              isSqlite,
              mName === 'user' ? preserveUserId : undefined,
              skipClear,
            );
            clearMsByModel.set(mName, Date.now() - clearStart);
            this.logger.log(
              `Import clear ${mName}: ${Date.now() - clearStart}ms`,
            );
          }
        }

        const importOrder =
          this.orderModelsForDependencySafeImport(modelNames);
        for (const mName of importOrder) {
          const records = data[mName];
          if (!records?.length) continue;
          const entity = this.entityByModelName[mName];
          if (!entity) continue;

          const rawRecords = records as Record<string, unknown>[];
          const sanitized = await this.buildSanitizedImportRows(
            em,
            mName,
            rawRecords,
            idMap,
            preserveUserId,
          );
          const stats = await this.insertSanitizedModel(
            em,
            mName,
            sanitized,
            (rowIndex, errMsg) => {
              if (!isSkippableImportRowError(errMsg)) {
                rowErrors.push({
                  model: mName,
                  index: rowIndex,
                  message: errMsg,
                });
              }
            },
            { rawRecords, idMap },
          );
          await this.registerLegacyIdsAfterModelImport(
            em,
            mName,
            rawRecords,
            idMap,
            preserveUserId,
          );
          modelTimings.push({
            model: mName,
            clearMs: clearMsByModel.get(mName) ?? 0,
            insertMs: stats.insertMs,
            imported: stats.imported,
          });
        }

        if (!skipClear && modelNames.includes('role')) {
          // JSON RBAC cuối phiên: deletedAt đã null — bỏ repair (UPDATE users/roles hay chờ lock ~50s/lần).
          const seedLinksStarted = Date.now();
          await this.bootstrap.ensureSeedUserRoleLinks(em);
          this.logger.log(
            `Import RBAC: ensureSeedUserRoleLinks ${Date.now() - seedLinksStarted}ms`,
          );
          const actingRoleStarted = Date.now();
          await this.ensureActingUserRoleAfterImportFromHeaders(
            em,
            actingUserIdHeader,
            actingUserEmailHeader,
          );
          this.logger.log(
            `Import RBAC: ensureActingUserRole ${Date.now() - actingRoleStarted}ms`,
          );
        } else if (
          !skipClear &&
          modelNames.includes('user') &&
          modelNames.includes('userRole')
        ) {
          await this.ensureActingUserRoleAfterImportFromHeaders(
            em,
            actingUserIdHeader,
            actingUserEmailHeader,
          );
        }
      } finally {
        if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        if (isSqlite) await conn.execute('PRAGMA foreign_keys = ON');
      }
    });

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
    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      const driverName = em.getDriver().constructor.name;
      const isMysqlFamily = /mysql|mariadb/i.test(driverName);
      const isSqlite = /sqlite/i.test(driverName);

      if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
      if (isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

      const idMap = new LegacyImportIdMap(
        this.modelEntity('setting') as unknown as new () => Record<string, unknown>,
      );

      try {
        const preserveUserId = this.resolvePreserveUserIdForImport(
          skipClear,
          true,
          actingUserIdHeader,
        );

        if (!skipClear) {
          const startTime = Date.now();
          await this.clearUsersTableForImport(em, preserveUserId, {
            fastPath: this.shouldFastClearUsersForImport(isMysqlFamily, skipClear),
          });
          this.logger.log(
            `Cleared data from user in ${Date.now() - startTime}ms`,
          );
        }
        if (userRows.length > 0) {
          const rawUserRows = userRows as Record<string, unknown>[];
          const sanitized = await this.buildSanitizedImportRows(
            em,
            'user',
            rawUserRows,
            idMap,
            preserveUserId,
          );
          await this.insertSanitizedModel(
            em,
            'user',
            sanitized,
            (idx, msg) => {
              if (!isSkippableImportRowError(msg)) {
                onRowError?.('user', idx, msg);
              }
            },
            { rawRecords: rawUserRows, idMap },
          );
          await this.registerLegacyIdsAfterModelImport(
            em,
            'user',
            rawUserRows,
            idMap,
            preserveUserId,
          );
          await em.flush();
        }
        if (userRoleRows.length > 0) {
          const rawUserRoleRows = userRoleRows as Record<string, unknown>[];
          const sanitized = await this.buildSanitizedImportRows(
            em,
            'userRole',
            rawUserRoleRows,
            idMap,
          );
          await this.insertSanitizedModel(
            em,
            'userRole',
            sanitized,
            (idx, msg) => {
              if (!isSkippableImportRowError(msg)) {
                onRowError?.('userRole', idx, msg);
              }
            },
            { rawRecords: rawUserRoleRows, idMap },
          );
        }
        // Chỉ bổ sung seed khi file không có userRole — tránh chèn link seed (id cũ) sau khi đã xóa users.
        if (!skipClear) {
          if (userRows.length > 0 && userRoleRows.length === 0) {
            await this.bootstrap.ensureSeedUserRoleLinks(em);
          }
          await this.ensureActingUserRoleAfterImportFromHeaders(
            em,
            actingUserIdHeader,
            actingUserEmailHeader,
          );
        }
      } finally {
        if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        if (isSqlite) await conn.execute('PRAGMA foreign_keys = ON');
      }
    });
  }

  /** Gắn FK legacy (UUID) → id int mới qua map đã lưu khi import user/role/... */
  private async resolveLegacyForeignKeysInRows(
    em: EntityManager,
    mName: string,
    rows: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
  ): Promise<void> {
    const entity = this.entityByModelName[mName];
    if (!entity || rows.length === 0) return;
    const meta = em.getMetadata().find(this.getEntityName(entity));
    if (!meta) return;

    for (const prop of Object.values(meta.properties)) {
      if (!isManyToOneImportProperty(prop)) continue;
      const targetClass = (prop as { targetMeta?: { className?: string } })
        .targetMeta?.className;
      const targetModel = targetClass
        ? this.modelNameByEntityClass[targetClass]
        : undefined;
      if (!targetModel) continue;
      const fieldName = prop.fieldNames?.[0] ?? `${prop.name}Id`;

      for (const row of rows) {
        let raw: unknown;
        if (Object.prototype.hasOwnProperty.call(row, fieldName)) {
          raw = row[fieldName];
        } else if (Object.prototype.hasOwnProperty.call(row, prop.name)) {
          raw = row[prop.name];
        }
        if (raw == null || raw === '') continue;
        const resolved = await idMap.resolve(em, targetModel, raw);
        if (resolved != null) {
          row[fieldName] = resolved;
          if (fieldName !== prop.name) delete row[prop.name];
        }
      }
    }
  }

  /** Sau insert, lưu map id export cũ → id DB (settings) để các lô import sau resolve FK. */
  private async registerLegacyIdsAfterModelImport(
    em: EntityManager,
    mName: string,
    rawRecords: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    preserveUserId?: number,
  ): Promise<void> {
    let wrote = false;
    let preservedUserEmail: string | undefined;
    if (mName === 'user' && preserveUserId != null) {
      const preserved = await em.findOne(
        this.modelEntity('user'),
        { id: preserveUserId },
        { fields: ['email'] },
      );
      preservedUserEmail = preserved?.email?.trim().toLowerCase();
    }

    for (const raw of rawRecords) {
      const legacy = exportLegacyKey(raw.id);
      if (!legacy) continue;

      let newId: number | undefined;
      if (mName === 'user') {
        const email =
          typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
        if (!email) continue;
        if (preservedUserEmail && email === preservedUserEmail) {
          newId = preserveUserId;
        } else {
          newId = (await em.findOne(this.modelEntity('user'), { email }))?.id;
        }
      } else if (mName === 'role') {
        const name = typeof raw.name === 'string' ? raw.name.trim() : '';
        if (!name) continue;
        newId = (await em.findOne(this.modelEntity('role'), { name }))?.id;
      } else if (mName === 'category') {
        const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
        if (!slug) continue;
        newId = (await em.findOne(this.modelEntity('category'), { slug }))?.id;
      } else if (mName === 'tag') {
        const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
        if (!slug) continue;
        newId = (await em.findOne(this.modelEntity('tag'), { slug }))?.id;
      } else if (mName === 'post') {
        const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
        if (!slug) continue;
        newId = (await em.findOne(this.modelEntity('post'), { slug }))?.id;
      } else {
        continue;
      }

      if (newId != null) {
        await idMap.persist(em, mName, legacy, newId);
        wrote = true;
      }
    }
    if (wrote) await em.flush();
  }

  private async buildSanitizedImportRows(
    em: EntityManager,
    mName: string,
    records: Record<string, unknown>[],
    idMap: LegacyImportIdMap,
    preserveUserId?: number,
  ): Promise<Record<string, unknown>[]> {
    const entity = this.entityByModelName[mName];
    if (!entity) return [];

    const rawRows = records.map((r) => ({
      ...r,
    }));
    await this.resolveLegacyForeignKeysInRows(em, mName, rawRows, idMap);

    let sanitized = rawRows.map((r) => this.pickImportPayload(em, entity, r));
    if (mName === 'user') {
      sanitized = await this.filterUserRowsForActingUserPreserve(
        em,
        sanitized,
        preserveUserId,
      );
    }
    return sanitized;
  }

  /** Chỉ giữ field map được tới cột DB, tránh lỗi insert khi JSON export có key thừa. */
  private pickImportPayload(
    em: EntityManager,
    entity: EntityName<any>,
    row: Record<string, unknown>,
  ): Record<string, unknown> {
    const entityKey =
      typeof entity === 'string'
        ? entity
        : typeof entity === 'function'
          ? entity.name
          : String(entity as unknown as string);
    const normalizedRow = normalizeLegacyImportRow(entityKey, row);
    const meta = em.getMetadata().get(entityKey);
    const out: Record<string, unknown> = {};

    for (const prop of Object.values(meta.properties)) {
      if (shouldSkipImportProperty(prop)) continue;

      let raw: unknown;
      if (Object.prototype.hasOwnProperty.call(normalizedRow, prop.name)) {
        raw = normalizedRow[prop.name];
      } else if (prop.fieldNames?.length) {
        const col = prop.fieldNames[0];
        if (
          col &&
          col !== prop.name &&
          Object.prototype.hasOwnProperty.call(normalizedRow, col)
        ) {
          raw = normalizedRow[col];
        }
      }
      if (
        raw === undefined &&
        isManyToOneImportProperty(prop) &&
        Object.prototype.hasOwnProperty.call(normalizedRow, `${prop.name}Id`)
      ) {
        raw = normalizedRow[`${prop.name}Id`];
      }
      if (raw === undefined) continue;

      if (prop.primary && (prop as { autoincrement?: boolean }).autoincrement) {
        const pk = coerceImportPrimaryKey(raw);
        if (pk === undefined) continue;
        out[prop.name] = pk;
        continue;
      }

      let val = normalizeImportScalar(prop, raw);
      if (isManyToOneImportProperty(prop)) {
        val = coerceManyToOneScalar(val);
        if (val === null && raw !== null && raw !== undefined) continue;
        const fkField = prop.fieldNames?.[0] ?? `${prop.name}Id`;
        out[fkField] = val;
        continue;
      }
      if (
        prop.name === 'content' &&
        (entityKey === 'Post' ||
          entityKey === 'PageContent' ||
          entityKey === 'Event')
      ) {
        val = normalizeContentJsonForImport(val);
      }
      out[prop.name] = val;
    }
    return fillRequiredImportScalarDefaults(meta, out);
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
      : rowChunkSize;
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
    return {
      modelOrder: [...this.modelOrder],
      bundles: { ...IMPORT_MODEL_BUNDLES },
      rowChunkSize,
      modelChunkSizes: {
        ...(postChunkRaw ? { post: postChunk } : {}),
        contactRequest: contactChunk,
        notification: notificationChunk,
        session: sessionChunk,
      },
      parallelChunkConcurrency,
      /** post insert song song gây lock InnoDB — mặc định tuần tự. */
      modelParallelConcurrency: {
        post: 1,
        contactRequest: parallelChunkConcurrency,
        notification: 1,
        session: 1,
      },
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

  async getDatabaseSchema() {
    const tables: Array<{
      name: string;
      entityName: string;
      exportModelName: string;
      domain: string;
      description: string;
      rowCount: number;
      activeRowCount: number;
      trashedRowCount: number;
      auxiliaryRowCount?: number;
      columns: Array<{
        name: string;
        type: string;
        kind: 'pk' | 'fk' | 'field';
        nullable?: boolean;
        references?: string;
      }>;
    }> = [];
    const relations: Array<{
      fromTable: string;
      fromColumn: string;
      toTable: string;
      toColumn: string;
      cardinality: 'many-to-one' | 'one-to-one' | 'self';
      deleteRule?: 'cascade' | 'set null' | 'restrict';
    }> = [];

    const domainMapping: Record<string, string> = {
      User: 'Identity',
      Role: 'Identity',
      UserRole: 'Identity',
      Account: 'Auth',
      Session: 'Auth',
      Student: 'Student',
      ParentStudent: 'Student',
      ContactRequest: 'Support',
      Post: 'Content',
      Category: 'Content',
      Tag: 'Content',
      PostCategory: 'Content',
      PostTag: 'Content',
      Comment: 'Content',
      Group: 'Messaging',
      GroupMember: 'Messaging',
      Message: 'Messaging',
      MessageRead: 'Messaging',
      Notification: 'Messaging',
      PageContent: 'System',
      Setting: 'System',
      AdmissionResult: 'System',
      VerificationToken: 'Auth',
    };

    const descriptionMapping: Record<string, string> = {
      User: 'Tai khoan nguoi dung, phu huynh va nhan su noi bo.',
      Role: 'Vai tro va tap permission RBAC.',
      UserRole: 'Bang pivot gan nhieu role cho mot user.',
      Account: 'Tai khoan OAuth/provider lien ket voi user.',
      Session: 'Phien dang nhap va refresh token.',
      Student: 'Ho so hoc sinh noi bo lien ket tuy chon voi user.',
      ParentStudent: 'Phu huynh gui yeu cau lien ket voi ma sinh vien.',
      ContactRequest: 'Yeu cau lien he va xu ly tuyen sinh/ho tro.',
      Post: 'Bai viet, thong bao, su kien va noi dung truyen thong.',
      Category: 'Cay danh muc cha-con cho bai viet.',
      Tag: 'The gan cho bai viet qua pivot post_tags.',
      PostCategory: 'Pivot many-to-many giua posts va categories.',
      PostTag: 'Pivot many-to-many giua posts va tags.',
      Comment: 'Binh luan cua user tren post.',
      Group: 'Nhom hoi thoai/thong bao.',
      GroupMember: 'Thanh vien nhom vai tro trong nhom.',
      Message: 'Tin nhan ca nhan, nhom va thread tra loi.',
      MessageRead: 'Trang thai da doc theo user va message.',
      Notification: 'Thong bao he thong theo user.',
      PageContent: 'Noi dung trang tinh/CMS.',
      Setting: 'Cau hinh key-value cua he thong.',
      AdmissionResult: 'Ket qua tuyen sinh.',
      VerificationToken: 'Token xac thuc email/password reset.',
    };

    const pendingCounts: Array<{
      tableName: string;
      entityName: string;
      exportModelName: string;
      domain: string;
      description: string;
      columns: Array<{
        name: string;
        type: string;
        kind: 'pk' | 'fk' | 'field';
        nullable?: boolean;
        references?: string;
      }>;
      entity: EntityName<any>;
      hasSoftDelete: boolean;
    }> = [];

    for (const modelName of this.modelOrder) {
      const entity = this.entityByModelName[modelName];
      if (!entity) continue;

      const entityName =
        typeof entity === 'string'
          ? entity
          : typeof entity === 'function'
            ? entity.name
            : modelName;
      const meta = this.em.getMetadata().find(entityName);
      if (!meta) continue;

      const tableName = meta.tableName || entityName;
      const domain = domainMapping[entityName] || 'System';
      const description = descriptionMapping[entityName] || '';
      const hasSoftDelete = Object.prototype.hasOwnProperty.call(
        meta.properties,
        'deletedAt',
      );

      const columns: Array<{
        name: string;
        type: string;
        kind: 'pk' | 'fk' | 'field';
        nullable?: boolean;
        references?: string;
      }> = [];

      for (const [propName, prop] of Object.entries(meta.properties)) {
        const propKind = String((prop as { kind?: string }).kind || '');
        const kind = prop.primary
          ? 'pk'
          : propKind.includes('1:1') || propKind.includes('m:1')
            ? 'fk'
            : 'field';
        const type = prop.columnTypes?.[0] || String(prop.type || 'unknown');
        const nullable = prop.nullable ?? false;
        let references: string | undefined;

        // For foreign keys, try to get the referenced entity
        if (kind === 'fk') {
          const targetMeta = (prop as { targetMeta?: { className?: string } })
            .targetMeta;
          if (targetMeta?.className) {
            references = `${targetMeta.className}.id`;
          }
        }

        columns.push({
          name: prop.fieldNames?.[0] || propName,
          type,
          kind,
          nullable,
          references,
        });
      }

      pendingCounts.push({
        tableName,
        entityName,
        exportModelName: modelName,
        domain,
        description,
        columns,
        entity,
        hasSoftDelete,
      });
    }

    const countResults = await Promise.all(
      pendingCounts.map(async (entry) => {
        try {
          if (entry.exportModelName === 'setting') {
            const rowCount = await this.em.count(entry.entity, {});
            const importIdMapRowCount = await this.em.count(this.modelEntity('setting'), {
              group: IMPORT_ID_MAP_GROUP,
            });
            const businessRowCount = Math.max(
              0,
              rowCount - importIdMapRowCount,
            );
            return {
              rowCount,
              activeRowCount: businessRowCount,
              trashedRowCount: 0,
              auxiliaryRowCount: importIdMapRowCount,
            };
          }
          const rowCount = await this.em.count(entry.entity, {});
          if (!entry.hasSoftDelete) {
            return {
              rowCount,
              activeRowCount: rowCount,
              trashedRowCount: 0,
            };
          }
          const activeRowCount = await this.em.count(entry.entity, {
            deletedAt: null,
          });
          return {
            rowCount,
            activeRowCount,
            trashedRowCount: Math.max(0, rowCount - activeRowCount),
          };
        } catch (error) {
          this.logger.warn(
            `getDatabaseSchema: count failed for ${entry.entityName}: ${getErrorMessage(error)}`,
          );
          return {
            rowCount: -1,
            activeRowCount: -1,
            trashedRowCount: 0,
          };
        }
      }),
    );

    for (let i = 0; i < pendingCounts.length; i++) {
      const entry = pendingCounts[i];
      const counts = countResults[i];
      tables.push({
        name: entry.tableName,
        entityName: entry.entityName,
        exportModelName: entry.exportModelName,
        domain: entry.domain,
        description: entry.description,
        rowCount: counts.rowCount,
        activeRowCount: counts.activeRowCount,
        trashedRowCount: counts.trashedRowCount,
        auxiliaryRowCount:
          'auxiliaryRowCount' in counts ? counts.auxiliaryRowCount : undefined,
        columns: entry.columns,
      });
    }

    // Extract relationships from entity metadata
    for (const modelName of this.modelOrder) {
      const entity = this.entityByModelName[modelName];
      if (!entity) continue;

      const entityName =
        typeof entity === 'string'
          ? entity
          : typeof entity === 'function'
            ? entity.name
            : modelName;
      const meta = this.em.getMetadata().find(entityName);
      if (!meta) continue;

      const fromTable = meta.tableName || entityName;

      for (const [propName, prop] of Object.entries(meta.properties)) {
        const propKind = String((prop as { kind?: string }).kind || '');
        // Check if this is a relationship property (1:1, m:1, 1:m, m:n)
        const isRelation =
          propKind.includes('1:1') ||
          propKind.includes('m:1') ||
          propKind.includes('1:m') ||
          propKind.includes('m:n');
        if (!isRelation) continue;

        const targetMeta = (prop as { targetMeta?: { className?: string } })
          .targetMeta;
        if (!targetMeta?.className) continue;

        const refMeta = this.em
          .getMetadata()
          .find(targetMeta.className as EntityName<any>);
        if (!refMeta) continue;

        const toTable = refMeta.tableName || targetMeta.className;
        const fromColumn = prop.fieldNames?.[0] || propName;
        const toColumn = 'id';

        let cardinality: 'many-to-one' | 'one-to-one' | 'self' = 'many-to-one';
        if (targetMeta.className === entityName) {
          cardinality = 'self';
        } else if (propKind === '1:1') {
          cardinality = 'one-to-one';
        }

        const deleteRule = (prop as { deleteRule?: string }).deleteRule as
          | 'cascade'
          | 'set null'
          | 'restrict'
          | undefined;

        relations.push({
          fromTable,
          fromColumn,
          toTable,
          toColumn,
          cardinality,
          deleteRule,
        });
      }
    }

    const totalRows = tables.reduce(
      (sum, table) => sum + Math.max(0, table.rowCount),
      0,
    );
    const totalActiveRows = tables.reduce(
      (sum, table) => sum + Math.max(0, table.activeRowCount),
      0,
    );

    let verification: ImportVerificationResult | undefined;
    const reference = loadImportReferenceManifest();
    if (reference) {
      const actualByModel = new Map<
        string,
        { rowCount: number; note?: string }
      >();
      for (const table of tables) {
        if (!(table.exportModelName in reference.expectedCounts)) continue;
        let compareCount = table.activeRowCount;
        if (table.exportModelName === 'setting') {
          compareCount = table.activeRowCount;
        } else if (table.exportModelName === 'post') {
          compareCount = table.rowCount;
        }
        actualByModel.set(table.exportModelName, {
          rowCount: Math.max(0, compareCount),
          note:
            table.exportModelName === 'setting' && table.auxiliaryRowCount
              ? `${table.auxiliaryRowCount} dòng import_id_map (không tính vào kỳ vọng)`
              : undefined,
        });
      }
      verification = buildImportVerification(
        reference,
        getImportReferenceFilePath(),
        actualByModel,
      );
    }

    return {
      tables,
      relations,
      totalRows,
      totalActiveRows,
      verification,
    };
  }

  /** Giống `pnpm run seed:superadmin` — idempotent, dùng từ API bảo trì. */
  async runSuperadminBootstrapSeed(): Promise<SystemBootstrapResult> {
    return this.bootstrap.runSuperadminBootstrap(this.em.fork());
  }

  /**
   * Pivot chỉ có PK = ManyToOne: `serialize()` không ổn định / không khớp `postId`+`categoryId`
   * như bundle import cũ — xuất thủ công từ khóa chính quan hệ.
   */
  private async exportPostCategoryRows(): Promise<
    Array<{ postId: string; categoryId: string }>
  > {
    const rows = await this.em.find(this.modelEntity('postCategory'), {});
    return rows.map((pc) => ({
      postId: String(wrap(pc.post, true).getPrimaryKey()),
      categoryId: String(wrap(pc.category, true).getPrimaryKey()),
    }));
  }

  private async exportPostTagRows(): Promise<
    Array<{ postId: string; tagId: string }>
  > {
    const rows = await this.em.find(this.modelEntity('postTag'), {});
    return rows.map((pt) => ({
      postId: String(wrap(pt.post, true).getPrimaryKey()),
      tagId: String(wrap(pt.tag, true).getPrimaryKey()),
    }));
  }

  /** User: đảm bảo export cả password hash (serialize() có thể bỏ qua hidden fields). */
  private async exportUserRows(): Promise<Record<string, unknown>[]> {
    const rows = await this.em.find(this.modelEntity('user'), {});
    return rows.map((u) => {
      const obj = this.flattenEntityRowForExport(this.getEntityName(this.modelEntity('user')), u);
      obj.password = u.password;
      return obj;
    });
  }

  async exportData(modelName?: string) {
    const resolvedModelName = this.resolveModelName(modelName) ?? modelName;
    this.logger.log(
      `Starting data export ${resolvedModelName ? `for ${resolvedModelName}` : 'all models'}...`,
    );
    const data: Record<string, any[]> = {};

    const exportOrder = resolvedModelName
      ? [resolvedModelName]
      : [...this.modelOrder].reverse();

    for (const mName of exportOrder) {
      data[mName] = [];
      try {
        const entity = this.entityByModelName[mName];
        if (entity) {
          if (mName === 'postCategory') {
            data[mName] = await this.exportPostCategoryRows();
          } else if (mName === 'postTag') {
            data[mName] = await this.exportPostTagRows();
          } else if (mName === 'user') {
            data[mName] = await this.exportUserRows();
          } else {
            const rows = await this.em.find(entity, {});
            const entityKey =
              typeof entity === 'string'
                ? entity
                : typeof entity === 'function'
                  ? entity.name
                  : mName;
            data[mName] = rows.map((row: object) =>
              this.flattenEntityRowForExport(entityKey, row),
            );
          }
          this.logger.debug(
            `Exported ${(data[mName] as unknown[]).length} records from ${mName}`,
          );
        } else {
          this.logger.warn(`Export: không có entity cho model "${mName}"`);
        }
      } catch (error) {
        this.logger.error(`Error exporting model ${mName}:`, error);
        data[mName] = [];
      }
    }

    if (!resolvedModelName) {
      this.sanitizeExportedPivotTables(data);
    }

    return this.toTableKeyedExport(data);
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
    data = this.normalizeImportBundle(data);
    this.assertRestorableImportBundle(data);
    this.logger.log(
      `Starting data import ${resolvedTargetModel ? `for ${resolvedTargetModel}` : 'all models'} (skipClear: ${skipClear})...`,
    );

    const droppedHero = stripLegacyHeroSlideFromBundle(
      data as Record<string, unknown>,
    );
    if (droppedHero > 0) {
      this.logger.log(
        `Import: bỏ key heroSlide (${droppedHero} bản ghi legacy — không còn bảng).`,
      );
    }

    // Nếu import tất cả models, chia nhỏ và import từng model riêng
    if (!resolvedTargetModel && Object.keys(data).length > 1) {
      return this.importDataByModels(
        data,
        skipClear,
        onProgress,
        actingUserIdHeader,
        actingUserEmailHeader,
      );
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
        return {
          success: userRowErrors.length === 0,
          message:
            userRowErrors.length > 0
              ? `Imported user+userRole with ${userRowErrors.length} row error(s)`
              : 'Data imported successfully',
          rowErrors: userRowErrors.length > 0 ? userRowErrors : undefined,
        };
      }

      const ordered = this.orderModelsForDependencySafeImport(payloadKeys);
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
      return {
        success: bundleResult.rowErrors.length === 0,
        message:
          bundleResult.rowErrors.length > 0
            ? `Imported bundle with ${bundleResult.rowErrors.length} row error(s)`
            : 'Data imported successfully',
        rowErrors:
          bundleResult.rowErrors.length > 0
            ? bundleResult.rowErrors
            : undefined,
        timing: {
          requestMs: bundleResult.requestMs,
          models: bundleResult.modelTimings,
        },
      };
    }

    // Import single model hoặc khi chỉ có 1 model
    let rowErrors: Array<{ model: string; index: number; message: string }> =
      [];
    const requestStarted = Date.now();
    const clearMsByModel = new Map<string, number>();
    const modelTimings: Array<{
      model: string;
      clearMs: number;
      insertMs: number;
      imported: number;
    }> = [];

    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      const driverName = em.getDriver().constructor.name;
      const isMysqlFamily = /mysql|mariadb/i.test(driverName);
      const isSqlite = /sqlite/i.test(driverName);

      if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
      if (isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

      const idMap = new LegacyImportIdMap(
        this.modelEntity('setting') as unknown as new () => Record<string, unknown>,
      );

      try {
        const clearOrder = resolvedTargetModel
          ? [resolvedTargetModel]
          : this.modelOrder;

        const preserveUserId = this.resolvePreserveUserIdForImport(
          skipClear,
          !skipClear && clearOrder.includes('user'),
          actingUserIdHeader,
        );

        // Chỉ clear nếu skipClear=false
        if (!skipClear) {
          for (const mName of clearOrder) {
            try {
              const startTime = Date.now();
              await this.clearModelTableForImport(
                em,
                mName,
                isMysqlFamily,
                isSqlite,
                mName === 'user' ? preserveUserId : undefined,
                skipClear,
              );
              const clearMs = Date.now() - startTime;
              clearMsByModel.set(mName, clearMs);
              this.logger.log(`Cleared data from ${mName} in ${clearMs}ms`);
            } catch (error) {
              this.logger.error(`Error clearing model ${mName}:`, error);
              throw error;
            }
          }
        }

        const importOrder = resolvedTargetModel
          ? [resolvedTargetModel]
          : [...this.modelOrder].reverse();

        rowErrors = [];

        for (const mName of importOrder) {
          const records = data[mName];
          if (records && records.length > 0) {
            try {
              const entity = this.entityByModelName[mName];
              if (entity) {
                const rawRecords = records as Record<string, unknown>[];
                const sanitized = await this.buildSanitizedImportRows(
                  em,
                  mName,
                  rawRecords,
                  idMap,
                  preserveUserId,
                );
                const stats = await this.insertSanitizedModel(
                  em,
                  mName,
                  sanitized,
                  (rowIndex, errMsg) => {
                    if (!isSkippableImportRowError(errMsg)) {
                      rowErrors.push({
                        model: mName,
                        index: rowIndex,
                        message: errMsg,
                      });
                    }
                  },
                  { rawRecords, idMap },
                );
                await this.registerLegacyIdsAfterModelImport(
                  em,
                  mName,
                  rawRecords,
                  idMap,
                  preserveUserId,
                );
                if (stats.skipped > 0) {
                  this.logger.warn(
                    `${mName}: imported ${stats.imported}/${stats.total} (${stats.skipped} skipped)`,
                  );
                }
                modelTimings.push({
                  model: mName,
                  clearMs: clearMsByModel.get(mName) ?? 0,
                  insertMs: stats.insertMs,
                  imported: stats.imported,
                });
              }
            } catch (error) {
              this.logger.error(`Error importing model ${mName}:`, error);
              throw error;
            }
          }
        }

        // Xóa `roles` CASCADE xóa `user_roles` — request kế (import user) mất quyền → 403.
        if (!skipClear && resolvedTargetModel === 'role') {
          this.logger.debug(
            'Sau import role: bổ sung lại user_roles seed (nếu user + role tồn tại).',
          );
          await this.repairImportNullMarkerValues(em, [resolvedTargetModel]);
          await this.bootstrap.ensureSeedUserRoleLinks(em);
          await this.ensureActingUserRoleAfterImportFromHeaders(
            em,
            actingUserIdHeader,
            actingUserEmailHeader,
          );
        }
      } finally {
        if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        if (isSqlite) await conn.execute('PRAGMA foreign_keys = ON');
      }
    });
    return {
      success: rowErrors.length === 0,
      message:
        rowErrors.length > 0
          ? `Imported with ${rowErrors.length} row error(s)`
          : 'Data imported successfully',
      rowErrors: rowErrors.length > 0 ? rowErrors : undefined,
      timing: {
        requestMs: Date.now() - requestStarted,
        models: modelTimings,
      },
    };
  }

  /** Thứ tự an toàn FK khi mỗi lần chỉ import một bảng (vd. role → user → userRole). */
  private orderModelsForDependencySafeImport(models: string[]): string[] {
    const set = new Set(models);
    const out: string[] = [];
    const take = (m: string) => {
      if (set.has(m)) {
        out.push(m);
        set.delete(m);
      }
    };
    take('role');
    take('user');
    take('userRole');
    // Giống import một request: [...modelOrder].reverse() — post/tag/category trước postCategory/postTag.
    for (const m of [...this.modelOrder].reverse()) {
      take(m);
    }
    for (const m of set) {
      out.push(m);
    }
    return out;
  }

  private async importDataByModels(
    data: Record<string, any[]>,
    skipClear: boolean = false,
    onProgress?: (event: object) => void,
    actingUserIdHeader?: string,
    actingUserEmailHeader?: string,
  ) {
    this.logger.log(
      'Importing data theo từng model (một request HTTP / model từ client)…',
    );
    const results: Array<{
      model: string;
      success: boolean;
      result?: any;
      error?: any;
    }> = [];

    const presentModels = this.modelOrder.filter(
      (m) =>
        this.entityByModelName[m] && Array.isArray(data[m]) && data[m].length > 0,
    );
    const ordered = this.orderModelsForDependencySafeImport(presentModels);
    const skipModels = new Set<string>();

    const modelRecords = ordered.map((m) => data[m]?.length ?? 0);
    const totalRecords = modelRecords.reduce((a, b) => a + b, 0);

    onProgress?.({
      type: 'start',
      total: ordered.length,
      totalRecords,
      models: ordered,
      records: modelRecords,
    });
    let cumulativeImported = 0;

    for (const modelName of ordered) {
      if (skipModels.has(modelName)) continue;
      const records = data[modelName];
      if (records && records.length > 0) {
        try {
          this.logger.log(
            `Importing ${modelName} (${records.length} records)...`,
          );
          const payload: Record<string, any[]> = { [modelName]: records };
          const bundledModels = this.appendImportBundleToPayload(
            data,
            modelName,
            payload,
            skipModels,
          );
          onProgress?.({
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
            onProgress?.({
              type: 'model-start',
              model: bundled,
              bundledWith: modelName,
              records: data[bundled]?.length ?? 0,
              index: results.length,
              total: ordered.length,
              cumulativeImported,
              totalRecords,
            });
          }
          const result = await this.importData(
            payload,
            modelName,
            skipClear,
            undefined,
            actingUserIdHeader,
            actingUserEmailHeader,
          );
          const rowErrors = (result as any)?.rowErrors as
            | Array<{ model: string; index: number; message: string }>
            | undefined;
          const importOk = (result as { success?: boolean }).success !== false;
          results.push({
            model: modelName,
            success: importOk,
            result,
          });
          if (importOk) {
            this.logger.log(`Successfully imported ${modelName}`);
          }
          cumulativeImported +=
            records.length +
            bundledModels.reduce(
              (sum, name) => sum + (data[name]?.length ?? 0),
              0,
            );
          onProgress?.({
            type: 'model-end',
            model: modelName,
            success: importOk,
            records: records.length,
            cumulativeImported,
            totalRecords,
            bundledModels,
            rowErrors: rowErrors?.length ? rowErrors : undefined,
            error: importOk
              ? undefined
              : (result as { message?: string })?.message,
          });
          for (const bundled of bundledModels) {
            const bundledRowErrors = rowErrors?.filter(
              (r) => r.model === bundled,
            );
            onProgress?.({
              type: 'model-end',
              model: bundled,
              bundledWith: modelName,
              success: importOk && !bundledRowErrors?.length,
              records: data[bundled]?.length ?? 0,
              cumulativeImported,
              totalRecords,
              rowErrors: bundledRowErrors?.length
                ? bundledRowErrors
                : undefined,
              error: bundledRowErrors?.[0]?.message,
            });
          }
        } catch (error) {
          this.logger.error(`Failed to import ${modelName}:`, error);
          results.push({ model: modelName, success: false, error });
          onProgress?.({
            type: 'model-end',
            model: modelName,
            success: false,
            error: getErrorMessage(error),
            cumulativeImported,
            totalRecords,
          });
        }
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
}

/** @deprecated Dùng `BaseSystemService`. */
export class BaseSystemAdminService extends BaseSystemService {}
