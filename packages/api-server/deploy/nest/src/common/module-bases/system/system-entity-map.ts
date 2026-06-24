import type { EntityName } from '@mikro-orm/core';

/** Khớp tên model export (`postCategory`) với tên class entity (`PostCategory`). */
export function entityClassToExportModelName(entity: EntityName<any>): string {
  const name =
    typeof entity === 'function'
      ? (entity as { name: string }).name
      : typeof entity === 'string'
        ? entity
        : String(entity as unknown as string);
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** Tự động xây dựng entityByModelName từ ormEntities — không cần maintain thủ công. */
export function buildEntityByModelName(
  ormEntities: readonly EntityName<any>[],
): Record<string, EntityName<any>> {
  const map: Record<string, EntityName<any>> = {};
  for (const E of ormEntities) {
    map[entityClassToExportModelName(E)] = E;
  }
  return map;
}
