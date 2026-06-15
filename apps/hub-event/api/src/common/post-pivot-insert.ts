/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import type { EntityManager } from '@mikro-orm/core';

type SqlDialect = 'postgres' | 'sqlite' | 'mysql';

function sqlDialect(): SqlDialect {
  const u = (process.env.DATABASE_URL ?? '').toLowerCase();
  if (u.startsWith('postgres')) return 'postgres';
  if (u.startsWith('sqlite')) return 'sqlite';
  return 'mysql';
}

/** Pivot post_categories — tránh persist entity composite PK (MikroORM .kind undefined). */
export async function deletePostCategoryPivots(
  em: EntityManager,
  postId: number,
): Promise<void> {
  const d = sqlDialect();
  if (d === 'postgres') {
    await em
      .getConnection()
      .execute(`delete from "post_categories" where "postId" = ?`, [postId]);
    return;
  }
  await em
    .getConnection()
    .execute('delete from `post_categories` where `postId` = ?', [postId]);
}

/** Pivot post_tags — tránh nativeDelete entity composite PK. */
export async function deletePostTagPivots(
  em: EntityManager,
  postId: number,
): Promise<void> {
  const d = sqlDialect();
  if (d === 'postgres') {
    await em
      .getConnection()
      .execute(`delete from "post_tags" where "postId" = ?`, [postId]);
    return;
  }
  await em
    .getConnection()
    .execute('delete from `post_tags` where `postId` = ?', [postId]);
}

/** Pivot post_categories — tránh persist entity composite PK (MikroORM .kind undefined). */
export async function insertPostCategoryPivot(
  em: EntityManager,
  postId: number,
  categoryId: number,
): Promise<void> {
  const d = sqlDialect();
  if (d === 'postgres') {
    await em.getConnection().execute(
      `insert into "post_categories" ("postId", "categoryId") values (?, ?)
       on conflict ("postId", "categoryId") do nothing`,
      [postId, categoryId],
    );
    return;
  }
  if (d === 'sqlite') {
    await em
      .getConnection()
      .execute(
        'insert or ignore into `post_categories` (`postId`, `categoryId`) values (?, ?)',
        [postId, categoryId],
      );
    return;
  }
  await em
    .getConnection()
    .execute(
      'insert ignore into `post_categories` (`postId`, `categoryId`) values (?, ?)',
      [postId, categoryId],
    );
}

/** Pivot post_tags — tránh persist entity composite PK (MikroORM .kind undefined). */
export async function insertPostTagPivot(
  em: EntityManager,
  postId: number,
  tagId: number,
): Promise<void> {
  const d = sqlDialect();
  if (d === 'postgres') {
    await em.getConnection().execute(
      `insert into "post_tags" ("postId", "tagId") values (?, ?)
       on conflict ("postId", "tagId") do nothing`,
      [postId, tagId],
    );
    return;
  }
  if (d === 'sqlite') {
    await em
      .getConnection()
      .execute(
        'insert or ignore into `post_tags` (`postId`, `tagId`) values (?, ?)',
        [postId, tagId],
      );
    return;
  }
  await em
    .getConnection()
    .execute(
      'insert ignore into `post_tags` (`postId`, `tagId`) values (?, ?)',
      [postId, tagId],
    );
}
