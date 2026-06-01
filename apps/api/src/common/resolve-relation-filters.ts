import { EntityManager } from '@mikro-orm/core';
import { AdmissionResult } from '../entities/admission-result.entity';
import { Category } from '../entities/category.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { Group } from '../entities/group.entity';
import { Message } from '../entities/message.entity';
import { Notification } from '../entities/notification.entity';
import { Post } from '../entities/post.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { Setting } from '../entities/setting.entity';
import { Student } from '../entities/student.entity';
import { Tag } from '../entities/tag.entity';
import { User } from '../entities/user.entity';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const entityByModelName = {
  admissionResult: AdmissionResult,
  category: Category,
  contactRequest: ContactRequest,
  group: Group,
  message: Message,
  notification: Notification,
  post: Post,
  role: Role,
  session: Session,
  setting: Setting,
  student: Student,
  tag: Tag,
  user: User,
} as const;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export interface RelationFilterConfig {
  model: string;
  nameField: string;
  softDelete?: boolean;
}

export type RelationFiltersConfig = Record<string, RelationFilterConfig>;

async function batchFindByEntity(
  em: EntityManager,
  rel: RelationFilterConfig,
  values: string[],
): Promise<Map<string, string>> {
  const entity = entityByModelName[rel.model as keyof typeof entityByModelName];
  if (!entity) return new Map();

  const result = new Map<string, string>();
  const cols: string[] = [];

  if (rel.softDelete) {
    cols.push('deletedAt IS NULL');
  }

  const uuidValues = values.filter((v) => isUuid(v));
  if (uuidValues.length > 0) {
    const idCols = cols.length ? cols.join(' AND ') : '1=1';
    const idRows = (await em
      .getConnection()
      .execute(
        `SELECT id FROM ${em.getMetadata(entity).tableName} WHERE id IN (?) AND ${idCols}`,
        [uuidValues],
      )) as Array<{ id: string }>;
    const idSet = new Set(idRows.map((r) => r.id));
    for (const val of uuidValues) {
      if (idSet.has(val)) {
        result.set(val, val);
      }
    }
  }

  const nameValues = values.filter((v) => !result.has(v));
  if (nameValues.length > 0 && rel.nameField) {
    const nameCols = cols.length ? cols.join(' AND ') : '1=1';
    const nameRows = (await em
      .getConnection()
      .execute(
        `SELECT id, \`${rel.nameField}\` FROM ${em.getMetadata(entity).tableName} WHERE \`${rel.nameField}\` IN (?) AND ${nameCols}`,
        [nameValues],
      )) as Array<{ id: string; [key: string]: unknown }>;

    for (const row of nameRows) {
      const inputVal = String(row[rel.nameField] ?? '');
      if (inputVal && !result.has(inputVal)) {
        result.set(inputVal, String(row.id));
      }
    }
  }

  return result;
}

export async function resolveRelationFilters(
  em: EntityManager,
  filters: Record<string, string> | undefined,
  config: RelationFiltersConfig,
): Promise<Record<string, string> | undefined> {
  if (!filters) return undefined;
  let output = { ...filters };

  for (const [key, rel] of Object.entries(config)) {
    const raw = output[key];
    if (!raw?.trim()) continue;

    const value = raw.trim();
    const parts = value.includes(',')
      ? value
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : [value];

    const resolvedMap = await batchFindByEntity(em, rel, parts);
    const resolved = parts
      .map((p) => resolvedMap.get(p))
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (resolved.length > 0) {
      output = { ...output, [key]: resolved.join(',') };
    } else {
      delete (output as Record<string, unknown>)[key];
    }
  }

  return output;
}
