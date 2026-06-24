import type { EntityManager, EntityName } from '@mikro-orm/core';
import {
  buildImportVerification,
  getImportReferenceFilePath,
  loadImportReferenceManifest,
  type ImportVerificationResult,
} from './import/reference';
import { IMPORT_ID_MAP_GROUP } from './import/legacy-id-map';
import { getErrorMessage } from './import/row-schema';

const DOMAIN_BY_ENTITY: Record<string, string> = {
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

const DESCRIPTION_BY_ENTITY: Record<string, string> = {
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

export type DatabaseSchemaContext = {
  em: EntityManager;
  modelOrder: readonly string[];
  entityByModelName: Record<string, EntityName<any>>;
  modelEntity: (modelKey: string) => EntityName<any>;
  onCountError?: (entityName: string, message: string) => void;
};

function entityNameOf(entity: EntityName<any>, modelName: string): string {
  return typeof entity === 'string'
    ? entity
    : typeof entity === 'function'
      ? entity.name
      : modelName;
}

export async function buildDatabaseSchema(ctx: DatabaseSchemaContext) {
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

  for (const modelName of ctx.modelOrder) {
    const entity = ctx.entityByModelName[modelName];
    if (!entity) continue;

    const entityName = entityNameOf(entity, modelName);
    const meta = ctx.em.getMetadata().find(entityName);
    if (!meta) continue;

    const tableName = meta.tableName || entityName;
    const domain = DOMAIN_BY_ENTITY[entityName] || 'System';
    const description = DESCRIPTION_BY_ENTITY[entityName] || '';
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
          const rowCount = await ctx.em.count(entry.entity, {});
          const importIdMapRowCount = await ctx.em.count(
            ctx.modelEntity('setting'),
            { group: IMPORT_ID_MAP_GROUP },
          );
          const businessRowCount = Math.max(0, rowCount - importIdMapRowCount);
          return {
            rowCount,
            activeRowCount: businessRowCount,
            trashedRowCount: 0,
            auxiliaryRowCount: importIdMapRowCount,
          };
        }
        const rowCount = await ctx.em.count(entry.entity, {});
        if (!entry.hasSoftDelete) {
          return { rowCount, activeRowCount: rowCount, trashedRowCount: 0 };
        }
        const activeRowCount = await ctx.em.count(entry.entity, {
          deletedAt: null,
        });
        return {
          rowCount,
          activeRowCount,
          trashedRowCount: Math.max(0, rowCount - activeRowCount),
        };
      } catch (error) {
        ctx.onCountError?.(
          entry.entityName,
          getErrorMessage(error),
        );
        return { rowCount: -1, activeRowCount: -1, trashedRowCount: 0 };
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

  for (const modelName of ctx.modelOrder) {
    const entity = ctx.entityByModelName[modelName];
    if (!entity) continue;

    const entityName = entityNameOf(entity, modelName);
    const meta = ctx.em.getMetadata().find(entityName);
    if (!meta) continue;

    const fromTable = meta.tableName || entityName;

    for (const [, prop] of Object.entries(meta.properties)) {
      const propKind = String((prop as { kind?: string }).kind || '');
      const isRelation =
        propKind.includes('1:1') ||
        propKind.includes('m:1') ||
        propKind.includes('1:m') ||
        propKind.includes('m:n');
      if (!isRelation) continue;

      const targetMeta = (prop as { targetMeta?: { className?: string } })
        .targetMeta;
      if (!targetMeta?.className) continue;

      const refMeta = ctx.em
        .getMetadata()
        .find(targetMeta.className as EntityName<any>);
      if (!refMeta) continue;

      const toTable = refMeta.tableName || targetMeta.className;
      const fromColumn = prop.fieldNames?.[0] || prop.name;
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
