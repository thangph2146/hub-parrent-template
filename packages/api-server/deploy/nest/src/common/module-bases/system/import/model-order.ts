import type { EntityManager, EntityName } from '@mikro-orm/core';
import { isManyToOneImportProperty } from './row-schema';

/** Thứ tự xóa/import an toàn FK — bổ sung khi thêm entity mới có quan hệ rõ ràng. */
export const PREFERRED_MIDDLE_MODEL_ORDER: readonly string[] = [
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

export type ModelOrderContext = {
  em: EntityManager;
  entityByModelName: Record<string, EntityName<any>>;
  resolveModelName: (name?: string | null) => string | undefined;
  getEntityName: (entity: EntityName<any>) => string;
};

/** Clear/delete: con trước cha. Import full dùng reverse. */
export function buildModelOrder(ctx: ModelOrderContext): string[] {
  const all = Object.keys(ctx.entityByModelName);
  const dependencies = new Map<string, Set<string>>();

  for (const modelName of all) {
    dependencies.set(modelName, new Set());
  }

  for (const [modelName, entity] of Object.entries(ctx.entityByModelName)) {
    const meta = ctx.em.getMetadata().find(ctx.getEntityName(entity));
    if (!meta) continue;

    for (const prop of Object.values(meta.properties)) {
      if (!isManyToOneImportProperty(prop)) continue;
      const targetClassName = (
        prop as { targetMeta?: { className?: string } }
      ).targetMeta?.className;
      if (!targetClassName) continue;

      const targetModel = ctx.resolveModelName(targetClassName);
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
    if (ctx.entityByModelName[modelName]) visit(modelName);
  }

  return parentFirst.reverse();
}
