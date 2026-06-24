import type { EntityManager } from '@mikro-orm/core';
import { LegacyImportIdMap } from './legacy-id-map';

export type ImportDbDriverFlags = {
  isMysqlFamily: boolean;
  isSqlite: boolean;
};

export type ImportTransactionContext = {
  em: EntityManager;
  idMap: LegacyImportIdMap;
  flags: ImportDbDriverFlags;
};

/** Tắt FK checks trong transaction import — MySQL/MariaDB + SQLite. */
export async function withImportForeignKeysDisabled<T>(
  em: EntityManager,
  fn: (flags: ImportDbDriverFlags) => Promise<T>,
): Promise<T> {
  const conn = em.getConnection();
  const driverName = em.getDriver().constructor.name;
  const flags: ImportDbDriverFlags = {
    isMysqlFamily: /mysql|mariadb/i.test(driverName),
    isSqlite: /sqlite/i.test(driverName),
  };

  if (flags.isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  if (flags.isSqlite) await conn.execute('PRAGMA foreign_keys = OFF');

  try {
    return await fn(flags);
  } finally {
    if (flags.isMysqlFamily) await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    if (flags.isSqlite) await conn.execute('PRAGMA foreign_keys = ON');
  }
}

/** idMap + FK flags — gọi bên trong `em.transactional`. */
export async function insideImportTransaction<T>(
  em: EntityManager,
  settingEntityCtor: new () => Record<string, unknown>,
  fn: (ctx: ImportTransactionContext) => Promise<T>,
): Promise<T> {
  const idMap = new LegacyImportIdMap(settingEntityCtor);
  return withImportForeignKeysDisabled(em, (flags) =>
    fn({ em, idMap, flags }),
  );
}

/** `em.transactional` + `insideImportTransaction` — shell dùng chung mọi nhánh import. */
export async function runImportInTransaction<T>(
  em: EntityManager,
  settingEntityCtor: new () => Record<string, unknown>,
  fn: (ctx: ImportTransactionContext) => Promise<T>,
): Promise<T> {
  return em.transactional((txnEm) =>
    insideImportTransaction(txnEm, settingEntityCtor, fn),
  );
}