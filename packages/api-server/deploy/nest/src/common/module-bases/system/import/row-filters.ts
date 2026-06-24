import { relationEntityId, toEntityId, toEntityIdList } from '../../../entity-id';
import type { EntityManager, EntityName } from '@mikro-orm/core';
import { pivotFk } from './helpers';
import { isManyToOneImportProperty } from './row-schema';

export async function filterRowsByExistingEventRef(
  em: EntityManager,
  rows: Record<string, unknown>[],
  eventEntity: EntityName<any>,
  modelName: string,
  onWarn?: (message: string) => void,
): Promise<Record<string, unknown>[]> {
  const eventIds = [
    ...new Set(rows.map((r) => pivotFk(r, 'eventId', 'event')).filter(Boolean)),
  ];
  const events = eventIds.length
    ? await em.find(
        eventEntity,
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
    onWarn?.(
      `${modelName}: bỏ qua ${rows.length - filtered.length} dòng (eventId không tồn tại).`,
    );
  }
  return filtered;
}

function entityClassName(entity: EntityName<any>): string {
  return typeof entity === 'string'
    ? entity
    : typeof entity === 'function'
      ? entity.name
      : String(entity as unknown as string);
}

export async function filterSanitizedFkPivot(
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
  onWarn?: (message: string) => void,
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
      ? em.find(options.leftEntity, { id: { $in: leftIds } }, { fields: ['id'] })
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
    onWarn?.(
      `${options.label}: bỏ qua ${sanitized.length - out.length} dòng (FK không tồn tại trong DB).`,
    );
  }
  return out;
}

/**
 * Lọc FK theo metadata entity: fieldName DB hoặc property relation đều được hiểu.
 */
export async function filterRowsByExistingManyToOneRefs(
  em: EntityManager,
  modelName: string,
  rows: Record<string, unknown>[],
  entityByModelName: Record<string, EntityName<any>>,
  onWarn?: (message: string) => void,
): Promise<Record<string, unknown>[]> {
  const entity = entityByModelName[modelName];
  if (!entity || rows.length === 0) return rows;

  const meta = em.getMetadata().find(entityClassName(entity));
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
      onWarn?.(
        `${modelName}: bỏ qua ${before - filtered.length} dòng vì FK ${fieldName} -> ${targetClassName}.id không tồn tại.`,
      );
    }
    if (filtered.length === 0) break;
  }

  return filtered;
}
