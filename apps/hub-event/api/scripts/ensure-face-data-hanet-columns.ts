/**
 * Idempotent — thêm cột HANET vào face_data khi DB tạo bằng schema:create
 * nhưng chưa chạy Migration20260612120000_add_face_data_hanet_fields.
 */
import 'reflect-metadata';
import { config } from 'dotenv';
import { MikroORM, EntityCaseNamingStrategy } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { ormEntities } from '../src/mikro-orm/orm-entities';

config();

async function columnExists(
  conn: { execute: (sql: string, params?: unknown[]) => Promise<unknown> },
  table: string,
  column: string,
): Promise<boolean> {
  const rows = (await conn.execute(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [table, column],
  )) as unknown[];
  return rows.length > 0;
}

async function main() {
  const orm = await MikroORM.init({
    driver: MySqlDriver,
    clientUrl: process.env.DATABASE_URL,
    entities: [...ormEntities],
    namingStrategy: EntityCaseNamingStrategy,
    debug: false,
  });

  const conn = orm.em.getConnection();

  try {
    const hasHanetPersonId = await columnExists(conn, 'face_data', 'hanetPersonId');
    if (!hasHanetPersonId) {
      await conn.execute(
        'alter table `face_data` add `hanetPersonId` varchar(64) null, add `hanetAliasId` varchar(255) null, add `displayName` varchar(255) null',
      );
      console.log('Added hanetPersonId, hanetAliasId, displayName to face_data');
    } else {
      console.log('face_data HANET columns already exist');
    }

    try {
      await conn.execute(
        'alter table `face_data` add unique `face_data_hanet_person_id_unique`(`hanetPersonId`)',
      );
      console.log('Added unique index face_data_hanet_person_id_unique');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('Duplicate key name') && !msg.includes('already exists')) {
        throw e;
      }
    }

    try {
      await conn.execute(
        'alter table `face_data` add index `face_data_hanet_person_id_index`(`hanetPersonId`)',
      );
      console.log('Added index face_data_hanet_person_id_index');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('Duplicate key name') && !msg.includes('already exists')) {
        throw e;
      }
    }
  } finally {
    await orm.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
