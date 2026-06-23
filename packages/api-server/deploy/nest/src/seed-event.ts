import 'reflect-metadata';
import { config } from 'dotenv';
import { MikroORM, EntityCaseNamingStrategy } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { MySqlDriver } from '@mikro-orm/mysql';
import { ormEntities } from './mikro-orm/orm-entities';
import { runCheckinEventSeedFromPosts } from './seeds/checkin-demo.runner';

config();

function getDriver() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.startsWith('postgres')) return PostgreSqlDriver;
  if (dbUrl.startsWith('sqlite')) return SqliteDriver;
  return MySqlDriver;
}

async function main() {
  const orm = await MikroORM.init({
    driver: getDriver() as never,
    clientUrl: process.env.DATABASE_URL,
    entities: [...ormEntities],
    namingStrategy: EntityCaseNamingStrategy,
    debug: false,
  });

  try {
    const em = orm.em.fork();
    await runCheckinEventSeedFromPosts(em, { log: console.log });
    console.log('Check-in event seed (from posts) completed successfully.');
  } finally {
    await orm.close();
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm db:event');
  console.log('');
  console.log(
    'Tạo sự kiện demo + đăng ký mẫu từ bài viết published trong bảng posts.',
  );
  console.log('Chạy sau db:fresh / db:seed hoặc sau khi import posts.');
  console.log('');
  console.log('Env tùy chọn:');
  console.log('  CHECKIN_DEMO_EVENT_COUNT   — số sự kiện (mặc định 15)');
  console.log(
    '  CHECKIN_DEMO_SEED          — seed random (mặc định hub-checkin-demo)',
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('Check-in event seed failed:', error);
  process.exit(1);
});
