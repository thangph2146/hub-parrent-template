import type { EntityManager, EntityName } from '@mikro-orm/core';
import { IMPORT_ID_MAP_GROUP } from './legacy-id-map';

export type ImportClearLog = {
  log: (message: string) => void;
  debug: (message: string) => void;
};

export type ImportClearEntities = {
  entityByModelName: Record<string, EntityName<any>>;
  getEntityName: (entity: EntityName<any>) => string;
};

/** MySQL + FOREIGN_KEY_CHECKS=0: xóa user rồi insert lại cùng transaction — FK tạm orphan. */
export function shouldFastClearUsersForImport(
  isMysqlFamily: boolean,
  skipClear: boolean,
): boolean {
  return isMysqlFamily && !skipClear;
}

async function detachNullableUserForeignKeys(
  em: EntityManager,
  entities: ImportClearEntities,
  preserveUserId?: number,
): Promise<void> {
  const nullifyNullableUserFk = async (
    modelKey: string,
    relations: string[],
  ): Promise<void> => {
    const entity = entities.entityByModelName[modelKey];
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

  await nullifyNullableUserFk('contactRequest', ['submittedBy', 'assignedTo']);
  await nullifyNullableUserFk('message', ['receiver', 'sender']);
  await nullifyNullableUserFk('student', ['user']);
}

async function detachUserForeignKeysBeforeImportClear(
  em: EntityManager,
  entities: ImportClearEntities,
  log: ImportClearLog,
  preserveUserId?: number,
): Promise<void> {
  await detachNullableUserForeignKeys(em, entities, preserveUserId);
  if (preserveUserId == null) return;

  const notPreserved = { $ne: preserveUserId };

  const reassignUserFk = async (
    modelKey: string,
    relation: string,
    label: string,
  ): Promise<void> => {
    const entity = entities.entityByModelName[modelKey];
    if (!entity) return;
    const count = await em.nativeUpdate(
      entity,
      { [relation]: notPreserved },
      { [relation]: preserveUserId },
    );
    if (count > 0) {
      log.log(
        `Import user: chuyển ${count} ${label} sang user #${preserveUserId}.`,
      );
    }
  };

  await reassignUserFk('post', 'author', 'bài viết');
  await reassignUserFk('comment', 'author', 'bình luận');
  await reassignUserFk('group', 'creator', 'nhóm');

  const sessionEntity = entities.entityByModelName.session;
  if (sessionEntity) {
    const deleted = await em.nativeDelete(sessionEntity, {
      user: notPreserved,
    });
    if (deleted > 0) {
      log.log(
        `Import user: xóa ${deleted} session của user sẽ thay thế (import lại sau).`,
      );
    }
  }

  const notificationEntity = entities.entityByModelName.notification;
  if (notificationEntity) {
    const deleted = await em.nativeDelete(notificationEntity, {
      user: notPreserved,
    });
    if (deleted > 0) {
      log.log(
        `Import user: xóa ${deleted} notification của user sẽ thay thế.`,
      );
    }
  }

  const storageFileEntity = entities.entityByModelName.storageFile;
  if (storageFileEntity) {
    await em.nativeUpdate(
      storageFileEntity,
      { uploadedBy: notPreserved },
      { uploadedBy: null },
    );
  }

  const eventEntity = entities.entityByModelName.event;
  if (eventEntity) {
    await em.nativeUpdate(
      eventEntity,
      { createdBy: notPreserved },
      { createdBy: null },
    );
  }
}

export async function clearUsersTableForImport(
  em: EntityManager,
  entities: ImportClearEntities,
  log: ImportClearLog,
  preserveUserId?: number,
  options?: { fastPath?: boolean },
): Promise<void> {
  const started = Date.now();
  if (!options?.fastPath) {
    await detachUserForeignKeysBeforeImportClear(
      em,
      entities,
      log,
      preserveUserId,
    );
    log.log(`Import user clear: detach FK ${Date.now() - started}ms`);
  } else {
    log.log(
      'Import user clear: fast path (MySQL FK_CHECKS=0, bỏ qua detach FK hàng loạt).',
    );
  }

  const deleteStarted = Date.now();
  const userEntity = entities.entityByModelName.user;
  if (!userEntity) return;

  if (preserveUserId != null) {
    const deleted = await em.nativeDelete(userEntity, {
      id: { $ne: preserveUserId },
    });
    log.log(
      `Import user: giữ user #${preserveUserId} cho phiên import; đã xóa ${deleted} user khác (${Date.now() - deleteStarted}ms).`,
    );
  } else {
    await em.nativeDelete(userEntity, {});
    log.debug(
      `Import user clear: nativeDelete all ${Date.now() - deleteStarted}ms`,
    );
  }
  em.clear();
}

export async function clearCategoryTableForImport(
  em: EntityManager,
  entities: ImportClearEntities,
  isMysqlFamily: boolean,
): Promise<void> {
  const categoryEntity = entities.entityByModelName.category;
  if (!categoryEntity) return;

  const meta = em
    .getMetadata()
    .get(entities.getEntityName(categoryEntity));
  const table = meta.tableName;
  if (isMysqlFamily) {
    await em.getConnection().execute(`TRUNCATE TABLE \`${table}\``);
    return;
  }
  const parentCol = meta.properties.parent?.fieldNames[0] ?? 'parentId';
  await em
    .getConnection()
    .execute(`UPDATE \`${table}\` SET \`${parentCol}\` = NULL`);
  await em.nativeDelete(categoryEntity, {});
}

/** Xóa sạch bảng trước import — role cần xóa user_roles trước để tránh FK / dữ liệu còn sót. */
export async function clearModelTableForImport(
  em: EntityManager,
  entities: ImportClearEntities,
  log: ImportClearLog,
  mName: string,
  isMysqlFamily: boolean,
  isSqlite: boolean,
  preserveUserId?: number,
  skipClear: boolean = false,
): Promise<void> {
  if (mName === 'user') {
    await clearUsersTableForImport(em, entities, log, preserveUserId, {
      fastPath: shouldFastClearUsersForImport(isMysqlFamily, skipClear),
    });
    return;
  }
  if (mName === 'category') {
    await clearCategoryTableForImport(em, entities, isMysqlFamily);
    em.clear();
    return;
  }
  if (mName === 'role') {
    await em.nativeDelete(entities.entityByModelName.userRole, {});
    await em.nativeDelete(entities.entityByModelName.role, {});
    em.clear();
    return;
  }
  if (mName === 'setting') {
    const deleted = await em.nativeDelete(entities.entityByModelName.setting, {
      group: { $ne: IMPORT_ID_MAP_GROUP },
    });
    log.log(
      `Import setting: giữ ${IMPORT_ID_MAP_GROUP}; đã xóa ${deleted} setting khác.`,
    );
    em.clear();
    return;
  }

  const entity = entities.entityByModelName[mName];
  if (entity) {
    await em.nativeDelete(entity, {});
    em.clear();
  }
}
