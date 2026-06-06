import { Injectable, Logger } from '@nestjs/common';
import {
  EntityManager,
  type EntityName,
  type EntityProperty,
  wrap,
} from '@mikro-orm/core';
import { hashSync } from 'bcryptjs';
import * as ExcelJS from 'exceljs';

import { Category } from '../entities/category.entity';
import { Comment } from '../entities/comment.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { Event } from '../entities/event.entity';
import { Group } from '../entities/group.entity';
import { Message } from '../entities/message.entity';
import { Speaker } from '../entities/speaker.entity';
import { Notification } from '../entities/notification.entity';
import { PageContent } from '../entities/page-content.entity';
import { PostCategory } from '../entities/post-category.entity';
import { PostTag } from '../entities/post-tag.entity';
import { Post } from '../entities/post.entity';
import { Role } from '../entities/role.entity';
import { Student } from '../entities/student.entity';
import { UserRole } from '../entities/user-role.entity';
import { User } from '../entities/user.entity';
import { ormEntities } from '../mikro-orm/orm-entities';
import {
  runSuperadminBootstrap,
  ensureSeedUserRoleLinks,
} from '../seeds/superadmin-bootstrap.runner';
import type { SuperadminBootstrapResult } from '../seeds/superadmin-bootstrap.runner';
import {
  isSkippableImportRowError,
  orderCategoryRowsForImport,
  pivotFk,
  sanitizePivotRowsInExportJson,
  stripHeroSlidesPermissions,
  stripLegacyHeroSlideFromBundle,
} from './import-helpers';
import {
  normalizeLegacyImportRow,
  resolveLegacyTableModelName,
} from './export-schema';

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
function buildEntityByModelName(): Record<string, EntityName<any>> {
  const map: Record<string, EntityName<any>> = {};
  for (const E of ormEntities) {
    map[entityClassToExportModelName(E)] = E;
  }
  return map;
}

const entityByModelName: Record<
  string,
  EntityName<any>
> = buildEntityByModelName();

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
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (typeof raw === 'object' && raw !== null && 'id' in raw) {
    return (raw as { id: unknown }).id;
  }
  return raw;
}

function normalizeImportScalar(prop: EntityProperty, raw: unknown): unknown {
  if (raw === null) return null;
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

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  /** Thứ tự xóa bảng: con trước cha. Import full dùng thứ tự đảo lại: cha trước con. */
  private readonly modelOrder: string[];

  constructor(private readonly em: EntityManager) {
    this.modelOrder = this.buildModelOrder();
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
    if (entityByModelName[key]) return key;

    const legacyModel = resolveLegacyTableModelName(key);
    if (legacyModel && entityByModelName[legacyModel]) {
      return legacyModel;
    }

    const lower = key.toLowerCase();
    for (const [modelName, entity] of Object.entries(entityByModelName)) {
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
    const entity = entityByModelName[modelName];
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
    const all = Object.keys(entityByModelName);
    const dependencies = new Map<string, Set<string>>();

    for (const modelName of all) {
      dependencies.set(modelName, new Set());
    }

    for (const [modelName, entity] of Object.entries(entityByModelName)) {
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
      if (entityByModelName[modelName]) visit(modelName);
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

    const entity = entityByModelName[modelName];
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

    return this.importData(data, resolvedTargetModel, skipClear, onProgress);
  }

  /** Bỏ pivot trỏ tới post/category không tồn tại (tránh lỗi FK / file export lệch). */
  private async filterSanitizedPostCategories(
    em: EntityManager,
    sanitized: Record<string, unknown>[],
  ): Promise<Record<string, unknown>[]> {
    const postIds = [
      ...new Set(
        sanitized.map((r) => pivotFk(r, 'postId', 'post')).filter(Boolean),
      ),
    ];
    const categoryIds = [
      ...new Set(
        sanitized
          .map((r) => pivotFk(r, 'categoryId', 'category'))
          .filter(Boolean),
      ),
    ];
    const [existingPosts, existingCats] = await Promise.all([
      postIds.length
        ? em.find(Post, { id: { $in: postIds } }, { fields: ['id'] })
        : [],
      categoryIds.length
        ? em.find(Category, { id: { $in: categoryIds } }, { fields: ['id'] })
        : [],
    ]);
    const pSet = new Set(existingPosts.map((p) => p.id));
    const cSet = new Set(existingCats.map((c) => c.id));
    const out = sanitized.filter((r) => {
      const pid = pivotFk(r, 'postId', 'post');
      const cid = pivotFk(r, 'categoryId', 'category');
      return pid && cid && pSet.has(pid) && cSet.has(cid);
    });
    if (out.length < sanitized.length) {
      this.logger.warn(
        `postCategory: bỏ qua ${sanitized.length - out.length} dòng (post hoặc category không có trong DB).`,
      );
    }
    return out;
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
        sanitized.map((r) => pivotFk(r, 'userId', 'user')).filter(Boolean),
      ),
    ];
    const roleIds = [
      ...new Set(
        sanitized.map((r) => pivotFk(r, 'roleId', 'role')).filter(Boolean),
      ),
    ];
    const [users, roles] = await Promise.all([
      userIds.length
        ? em.find(User, { id: { $in: userIds } }, { fields: ['id'] })
        : [],
      roleIds.length
        ? em.find(Role, { id: { $in: roleIds } }, { fields: ['id'] })
        : [],
    ]);
    const uSet = new Set(users.map((u) => u.id));
    const rSet = new Set(roles.map((ro) => ro.id));
    const out = sanitized.filter((row) => {
      const uid = pivotFk(row, 'userId', 'user');
      const rid = pivotFk(row, 'roleId', 'role');
      return uid && rid && uSet.has(uid) && rSet.has(rid);
    });
    if (out.length < sanitized.length) {
      this.logger.warn(
        `userRole: bỏ qua ${sanitized.length - out.length} dòng (userId hoặc roleId không tồn tại — import user và role trước).`,
      );
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
    const entity = entityByModelName[modelName];
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
            .map((row) => pivotFk(row, fieldName, prop.name))
            .filter(Boolean),
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
        existingRows.map((row) => String((row as { id: unknown }).id)),
      );

      const before = filtered.length;
      filtered = filtered.filter((row) => {
        const id = pivotFk(row, fieldName, prop.name);
        if (!id) return nullable;
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
  ): Promise<void> {
    const now = new Date();
    for (const r of rows) {
      const id = r.id != null ? String(r.id as string | number) : '';
      if (!id) {
        throw new Error('pageContent import: thiếu id');
      }
      const contentRaw = normalizeContentJsonForImport(r.content);
      const content = plainJsonRecord(contentRaw);
      const e = new PageContent();
      e.id = id;
      e.pageKey = r.pageKey != null ? String(r.pageKey as string | number) : '';
      e.sectionKey =
        r.sectionKey != null ? String(r.sectionKey as string | number) : '';
      e.content = content;
      e.isVisible = Boolean(r.isVisible ?? true);
      e.createdAt = coerceImportDate(r.createdAt, now);
      e.updatedAt = coerceImportDate(r.updatedAt, now);
      em.persist(e);
    }
    await em.flush();
  }

  private async insertSanitizedModel(
    em: EntityManager,
    mName: string,
    sanitized: Record<string, unknown>[],
    onRowError?: (index: number, message: string) => void,
  ): Promise<{ imported: number; skipped: number; total: number }> {
    const entity = entityByModelName[mName];
    const total = sanitized.length;
    if (!entity || sanitized.length === 0)
      return { imported: 0, skipped: 0, total };

    let rows = sanitized;
    rows = await this.filterRowsByExistingManyToOneRefs(em, mName, rows);
    if (rows.length === 0) return { imported: 0, skipped: total, total };

    if (mName === 'postCategory') {
      rows = await this.filterSanitizedPostCategories(em, rows);
      if (rows.length === 0) return { imported: 0, skipped: total, total };
    }

    if (mName === 'user') {
      rows = this.applyUserImportRowsDefaults(rows);
    }

    if (mName === 'userRole') {
      await em.flush();
      rows = await this.filterSanitizedUserRoles(em, rows);
      if (rows.length === 0) return { imported: 0, skipped: total, total };
    }

    if (mName === 'eventSpeaker') {
      rows = await this.filterSanitizedFkPivot(em, rows, {
        leftKey: 'eventId',
        leftRel: 'event',
        leftEntity: Event,
        rightKey: 'speakerId',
        rightRel: 'speaker',
        rightEntity: Speaker,
        label: 'eventSpeaker',
      });
      if (rows.length === 0) return { imported: 0, skipped: total, total };
    }

    if (mName === 'groupMember') {
      rows = await this.filterSanitizedFkPivot(em, rows, {
        leftKey: 'groupId',
        leftRel: 'group',
        leftEntity: Group,
        rightKey: 'userId',
        rightRel: 'user',
        rightEntity: User,
        label: 'groupMember',
      });
      if (rows.length === 0) return { imported: 0, skipped: total, total };
    }

    if (mName === 'messageRead') {
      rows = await this.filterSanitizedFkPivot(em, rows, {
        leftKey: 'messageId',
        leftRel: 'message',
        leftEntity: Message,
        rightKey: 'userId',
        rightRel: 'user',
        rightEntity: User,
        label: 'messageRead',
      });
      if (rows.length === 0) return { imported: 0, skipped: total, total };
    }

    if (mName === 'eventRegistration' || mName === 'eventCheckin') {
      const eventIds = [
        ...new Set(
          rows.map((r) => pivotFk(r, 'eventId', 'event')).filter(Boolean),
        ),
      ];
      const events = eventIds.length
        ? await em.find(Event, { id: { $in: eventIds } }, { fields: ['id'] })
        : [];
      const eventSet = new Set(events.map((e) => e.id));
      const filtered = rows.filter((row) => {
        const eid = pivotFk(row, 'eventId', 'event');
        return Boolean(eid && eventSet.has(eid));
      });
      if (filtered.length < rows.length) {
        this.logger.warn(
          `${mName}: bỏ qua ${rows.length - filtered.length} dòng (eventId không tồn tại).`,
        );
      }
      rows = filtered;
      if (rows.length === 0) return { imported: 0, skipped: total, total };
    }

    if (mName === 'role') {
      const beforeDedupe = rows.length;
      const seenIds = new Set<string>();
      rows = rows
        .filter((r) => {
          const id = String(r.id ?? '');
          if (!id || seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        })
        .map((r) => ({
          ...r,
          permissions: stripHeroSlidesPermissions(r.permissions),
        }));
      if (rows.length < beforeDedupe) {
        this.logger.warn(
          `${mName}: bỏ qua ${beforeDedupe - rows.length} dòng trùng id trong file import.`,
        );
      }
    }

    if (mName === 'pageContent') {
      const startTime = Date.now();
      await this.insertPageContentsWithPersist(em, rows);
      this.logger.debug(
        `Imported ${rows.length} pageContent (persist) in ${Date.now() - startTime}ms`,
      );
      return { imported: rows.length, skipped: total - rows.length, total };
    }

    const preFilterSkipped = total - rows.length;
    let imported = 0;
    let skipped = preFilterSkipped;
    const startTime = Date.now();
    try {
      await em.insertMany(entity, rows as object[]);
      imported = rows.length;
    } catch (e: unknown) {
      const message = getErrorMessage(e);
      this.logger.warn(
        `insertMany toàn bộ ${mName} thất bại (${message}), thử theo lô nhỏ hơn…`,
      );
      const batchSize = Math.max(
        1,
        parseInt(process.env.SYSTEM_IMPORT_DB_BATCH_SIZE || '500', 10) || 500,
      );
      for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        try {
          await em.insertMany(entity, chunk as object[]);
          imported += chunk.length;
        } catch (inner: unknown) {
          const innerMsg = getErrorMessage(inner);
          this.logger.debug(
            `Batch insert failed for ${mName}, fallback từng dòng: ${innerMsg}`,
          );
          for (const record of chunk) {
            const rowIndex = rows.indexOf(record);
            try {
              await em.insert(entity, record as object);
              imported++;
            } catch (rowErr: unknown) {
              skipped++;
              const errMsg = getErrorMessage(rowErr);
              onRowError?.(rowIndex, errMsg);
              if (!isSkippableImportRowError(errMsg)) {
                throw rowErr;
              }
            }
          }
        }
      }
    }
    this.logger.debug(
      `Imported ${imported}/${total} records into ${mName} in ${Date.now() - startTime}ms${skipped > 0 ? ` (${skipped} skipped)` : ''}`,
    );
    return { imported, skipped, total };
  }

  /**
   * Trước khi xóa toàn bộ users: bỏ liên kết nullable tới users (FK thường là NO ACTION).
   * Import `?model=user` không xóa contact_requests/messages/students trước — cần bước này.
   */
  private async detachNullableUserForeignKeys(
    em: EntityManager,
  ): Promise<void> {
    await em.nativeUpdate(
      ContactRequest,
      {},
      {
        submittedBy: null,
        assignedTo: null,
      },
    );
    await em.nativeUpdate(Message, {}, { receiver: null, sender: null });
    await em.nativeUpdate(Student, {}, { user: null });
  }

  /**
   * categories.parentId → categories.id: schema thực tế có thể ON DELETE NO ACTION.
   * nativeDelete toàn bảng sẽ lỗi khi còn hàng con trỏ tới cha — bỏ liên kết cây trước.
   */
  private async clearCategoryTableForImport(em: EntityManager): Promise<void> {
    const meta = em.getMetadata().get(Category.name);
    const table = meta.tableName;
    const parentCol = meta.properties.parent?.fieldNames[0] ?? 'parentId';
    await em
      .getConnection()
      .execute(`UPDATE \`${table}\` SET \`${parentCol}\` = NULL`);
    await em.nativeDelete(Category, {});
  }

  /** Xóa sạch bảng trước import — role cần xóa user_roles trước để tránh FK / dữ liệu còn sót. */
  private async clearModelTableForImport(
    em: EntityManager,
    mName: string,
    isMysqlFamily: boolean,
    isSqlite: boolean,
  ): Promise<void> {
    if (mName === 'user') {
      await this.detachNullableUserForeignKeys(em);
      await em.nativeDelete(User, {});
      em.clear();
      return;
    }
    if (mName === 'category') {
      await this.clearCategoryTableForImport(em);
      em.clear();
      return;
    }
    if (mName === 'role') {
      const conn = em.getConnection();
      if (isMysqlFamily || isSqlite) {
        await conn.execute('DELETE FROM user_roles');
        await conn.execute('DELETE FROM roles');
      } else {
        await em.nativeDelete(UserRole, {});
        await em.nativeDelete(Role, {});
      }
      em.clear();
      return;
    }

    const entity = entityByModelName[mName];
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
  ): Promise<Array<{ model: string; index: number; message: string }>> {
    const rowErrors: Array<{ model: string; index: number; message: string }> =
      [];

    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      const driverName = em.getDriver().constructor.name;
      const isMysqlFamily = /mysql|mariadb/i.test(driverName);
      const isSqlite = /sqlite/i.test(driverName);

      if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
      if (isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

      try {
        const clearOrder = this.modelOrder.filter((m) =>
          modelNames.includes(m),
        );

        if (!skipClear) {
          for (const mName of clearOrder) {
            await this.clearModelTableForImport(
              em,
              mName,
              isMysqlFamily,
              isSqlite,
            );
          }
        }

        const importOrder = [...clearOrder].reverse();
        for (const mName of importOrder) {
          const records = data[mName];
          if (!records?.length) continue;
          const entity = entityByModelName[mName];
          if (!entity) continue;

          let sanitized = records.map((r) =>
            this.pickImportPayload(em, entity, r as Record<string, unknown>),
          );
          if (mName === 'category') {
            sanitized = orderCategoryRowsForImport(sanitized);
          }
          await this.insertSanitizedModel(
            em,
            mName,
            sanitized,
            (rowIndex, errMsg) => {
              rowErrors.push({
                model: mName,
                index: rowIndex,
                message: errMsg,
              });
            },
          );
        }

        if (!skipClear && modelNames.includes('role')) {
          await ensureSeedUserRoleLinks(em);
        }
      } finally {
        if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        if (isSqlite) await conn.execute('PRAGMA foreign_keys = ON');
      }
    });

    return rowErrors;
  }

  private async importUsersWithRolesInTransaction(
    userRows: any[],
    userRoleRows: any[],
    skipClear: boolean,
    onRowError?: (model: string, index: number, message: string) => void,
  ): Promise<void> {
    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      const driverName = em.getDriver().constructor.name;
      const isMysqlFamily = /mysql|mariadb/i.test(driverName);
      const isSqlite = /sqlite/i.test(driverName);

      if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
      if (isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

      try {
        if (!skipClear) {
          const startTime = Date.now();
          await this.detachNullableUserForeignKeys(em);
          await em.nativeDelete(User, {});
          em.clear();
          this.logger.debug(
            `Cleared data from user (and cascaded user_roles) in ${Date.now() - startTime}ms`,
          );
        }
        if (userRows.length > 0) {
          const sanitized = userRows.map((r) =>
            this.pickImportPayload(em, User, r as Record<string, unknown>),
          );
          await this.insertSanitizedModel(em, 'user', sanitized, (idx, msg) =>
            onRowError?.('user', idx, msg),
          );
          await em.flush();
        }
        if (userRoleRows.length > 0) {
          const sanitized = userRoleRows.map((r) =>
            this.pickImportPayload(em, UserRole, r as Record<string, unknown>),
          );
          await this.insertSanitizedModel(
            em,
            'userRole',
            sanitized,
            (idx, msg) => onRowError?.('userRole', idx, msg),
          );
        }
        // Chỉ bổ sung seed khi file không có userRole — tránh chèn link seed (id cũ) sau khi đã xóa users.
        if (userRows.length > 0 && userRoleRows.length === 0) {
          await ensureSeedUserRoleLinks(em);
        }
      } finally {
        if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        if (isSqlite) await conn.execute('PRAGMA foreign_keys = ON');
      }
    });
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
      let val = normalizeImportScalar(prop, raw);
      if (isManyToOneImportProperty(prop)) {
        val = coerceManyToOneScalar(val);
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
    return out;
  }

  getModels() {
    return this.modelOrder.map((modelName) => {
      const entity = entityByModelName[modelName];
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
      parseInt(process.env.SYSTEM_IMPORT_DB_BATCH_SIZE || '500', 10) || 500,
    );
    return {
      modelOrder: [...this.modelOrder],
      bundles: { ...IMPORT_MODEL_BUNDLES },
      rowChunkSize,
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
      const entity = entityByModelName[modelName];
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
        columns: entry.columns,
      });
    }

    // Extract relationships from entity metadata
    for (const modelName of this.modelOrder) {
      const entity = entityByModelName[modelName];
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

    return { tables, relations, totalRows, totalActiveRows };
  }

  /** Giống `pnpm run seed:superadmin` — idempotent, dùng từ API bảo trì. */
  async runSuperadminBootstrapSeed(): Promise<SuperadminBootstrapResult> {
    return runSuperadminBootstrap(this.em.fork());
  }

  /**
   * Pivot chỉ có PK = ManyToOne: `serialize()` không ổn định / không khớp `postId`+`categoryId`
   * như bundle import cũ — xuất thủ công từ khóa chính quan hệ.
   */
  private async exportPostCategoryRows(): Promise<
    Array<{ postId: string; categoryId: string }>
  > {
    const rows = await this.em.find(PostCategory, {});
    return rows.map((pc) => ({
      postId: String(wrap(pc.post, true).getPrimaryKey()),
      categoryId: String(wrap(pc.category, true).getPrimaryKey()),
    }));
  }

  private async exportPostTagRows(): Promise<
    Array<{ postId: string; tagId: string }>
  > {
    const rows = await this.em.find(PostTag, {});
    return rows.map((pt) => ({
      postId: String(wrap(pt.post, true).getPrimaryKey()),
      tagId: String(wrap(pt.tag, true).getPrimaryKey()),
    }));
  }

  /** User: đảm bảo export cả password hash (serialize() có thể bỏ qua hidden fields). */
  private async exportUserRows(): Promise<Record<string, unknown>[]> {
    const rows = await this.em.find(User, {});
    return rows.map((u) => {
      const obj = this.flattenEntityRowForExport(User.name, u);
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
        const entity = entityByModelName[mName];
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
      return this.importDataByModels(data, skipClear, onProgress);
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
      const bundleRowErrors = await this.importOrderedModelsInTransaction(
        data,
        ordered,
        skipClear,
      );
      return {
        success: bundleRowErrors.length === 0,
        message:
          bundleRowErrors.length > 0
            ? `Imported bundle with ${bundleRowErrors.length} row error(s)`
            : 'Data imported successfully',
        rowErrors: bundleRowErrors.length > 0 ? bundleRowErrors : undefined,
      };
    }

    // Import single model hoặc khi chỉ có 1 model
    let rowErrors: Array<{ model: string; index: number; message: string }> =
      [];

    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      const driverName = em.getDriver().constructor.name;
      const isMysqlFamily = /mysql|mariadb/i.test(driverName);
      const isSqlite = /sqlite/i.test(driverName);

      if (isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
      if (isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

      try {
        const clearOrder = resolvedTargetModel
          ? [resolvedTargetModel]
          : this.modelOrder;

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
              );
              this.logger.debug(
                `Cleared data from ${mName} in ${Date.now() - startTime}ms`,
              );
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
              const entity = entityByModelName[mName];
              if (entity) {
                let sanitized = records.map((r) =>
                  this.pickImportPayload(
                    em,
                    entity,
                    r as Record<string, unknown>,
                  ),
                );
                if (mName === 'category') {
                  sanitized = orderCategoryRowsForImport(sanitized);
                }
                const stats = await this.insertSanitizedModel(
                  em,
                  mName,
                  sanitized,
                  (rowIndex, errMsg) => {
                    rowErrors.push({
                      model: mName,
                      index: rowIndex,
                      message: errMsg,
                    });
                  },
                );
                if (stats.skipped > 0) {
                  this.logger.warn(
                    `${mName}: imported ${stats.imported}/${stats.total} (${stats.skipped} skipped)`,
                  );
                }
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
          await ensureSeedUserRoleLinks(em);
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
        entityByModelName[m] && Array.isArray(data[m]) && data[m].length > 0,
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
          const result = await this.importData(payload, modelName, skipClear);
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
