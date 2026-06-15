import 'reflect-metadata';
import { toEntityId } from './common';
import { config } from 'dotenv';
import {
  MikroORM,
  EntityCaseNamingStrategy,
  type EntityManager,
} from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { MySqlDriver } from '@mikro-orm/mysql';
import * as fs from 'fs';
import { ormEntities } from './mikro-orm/orm-entities';
import { Account } from './entities/account.entity';
import { AdmissionResult } from './entities/admission-result.entity';
import { Category } from './entities/category.entity';
import { Comment } from './entities/comment.entity';
import { ContactRequest } from './entities/contact-request.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message-read.entity';
import { Notification, NotificationKind } from './entities/notification.entity';
import { PageContent } from './entities/page-content.entity';
import { Post } from './entities/post.entity';
import { PostCategory } from './entities/post-category.entity';
import { PostTag } from './entities/post-tag.entity';
import { Role } from './entities/role.entity';
import { Session } from './entities/session.entity';
import { Setting } from './entities/setting.entity';
import { Student } from './entities/student.entity';
import { Tag } from './entities/tag.entity';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { resolveSeedExportPath } from './common/data-paths';
import {
  orderCategoryRowsForImport,
  sanitizePivotRowsInExportJson,
  stripHeroSlidesPermissions,
  stripLegacyHeroSlideFromBundle,
} from './common/module-bases/system/import-helpers';

config();

type ExportRow = Record<string, unknown>;
type ExportBundle = Record<string, ExportRow[] | undefined>;

const ISO_DATE_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'emailVerified',
  'publishedAt',
  'eventStartAt',
  'eventEndAt',
  'expiresAt',
  'lastActivity',
  'readAt',
  'joinedAt',
  'leftAt',
  'expires',
]);

/** Map id trong file export (UUID / số cũ) → id autoincrement mới trong DB. */
type ExportIdMaps = {
  role: Map<string, number>;
  user: Map<string, number>;
  category: Map<string, number>;
  tag: Map<string, number>;
  setting: Map<string, number>;
  admissionResult: Map<string, number>;
  post: Map<string, number>;
  comment: Map<string, number>;
  contactRequest: Map<string, number>;
  group: Map<string, number>;
  groupMember: Map<string, number>;
  message: Map<string, number>;
  messageRead: Map<string, number>;
  notification: Map<string, number>;
  pageContent: Map<string, number>;
  userRole: Map<string, number>;
  account: Map<string, number>;
  session: Map<string, number>;
  student: Map<string, number>;
};

function createIdMaps(): ExportIdMaps {
  return {
    role: new Map(),
    user: new Map(),
    category: new Map(),
    tag: new Map(),
    setting: new Map(),
    admissionResult: new Map(),
    post: new Map(),
    comment: new Map(),
    contactRequest: new Map(),
    group: new Map(),
    groupMember: new Map(),
    message: new Map(),
    messageRead: new Map(),
    notification: new Map(),
    pageContent: new Map(),
    userRole: new Map(),
    account: new Map(),
    session: new Map(),
    student: new Map(),
  };
}

function exportKey(raw: unknown): string {
  return String(raw ?? '').trim();
}

function requireMapped(
  maps: Map<string, number>,
  exportId: string,
  label: string,
): number {
  const id = maps.get(exportId);
  if (id == null) {
    throw new Error(
      `[seed-full-export] Thiếu map ${label} cho export id=${exportId}`,
    );
  }
  return id;
}

function optionalMapped(
  maps: Map<string, number>,
  exportId: string | null | undefined,
): number | null {
  if (!exportId) return null;
  const key = exportKey(exportId);
  if (!key) return null;
  return requireMapped(maps, key, 'FK');
}

function getDriver() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.startsWith('postgres')) return PostgreSqlDriver;
  if (dbUrl.startsWith('sqlite')) return SqliteDriver;
  return MySqlDriver;
}

function sqlDialect(): 'postgres' | 'sqlite' | 'mysql' {
  const u = process.env.DATABASE_URL || '';
  if (u.startsWith('postgres')) return 'postgres';
  if (u.startsWith('sqlite')) return 'sqlite';
  return 'mysql';
}

/**
 * Bảng pivot PostCategory / PostTag: persist entity dễ lỗi (validate bắt buộc relation,
 * hoặc INSERT trùng cột). Chèn trực tiếp qua connection.
 */
async function insertPostCategoryPivot(
  tx: EntityManager,
  postId: number,
  categoryId: number,
): Promise<void> {
  const d = sqlDialect();
  if (d === 'postgres') {
    await tx.getConnection().execute(
      `insert into "post_categories" ("postId", "categoryId") values (?, ?)
       on conflict ("postId", "categoryId") do nothing`,
      [postId, categoryId],
    );
  } else if (d === 'sqlite') {
    await tx
      .getConnection()
      .execute(
        'insert or ignore into `post_categories` (`postId`, `categoryId`) values (?, ?)',
        [postId, categoryId],
      );
  } else {
    await tx
      .getConnection()
      .execute(
        'insert ignore into `post_categories` (`postId`, `categoryId`) values (?, ?)',
        [postId, categoryId],
      );
  }
}

async function insertPostTagPivot(
  tx: EntityManager,
  postId: number,
  tagId: number,
): Promise<void> {
  const d = sqlDialect();
  if (d === 'postgres') {
    await tx.getConnection().execute(
      `insert into "post_tags" ("postId", "tagId") values (?, ?)
       on conflict ("postId", "tagId") do nothing`,
      [postId, tagId],
    );
  } else if (d === 'sqlite') {
    await tx
      .getConnection()
      .execute(
        'insert or ignore into `post_tags` (`postId`, `tagId`) values (?, ?)',
        [postId, tagId],
      );
  } else {
    await tx
      .getConnection()
      .execute(
        'insert ignore into `post_tags` (`postId`, `tagId`) values (?, ?)',
        [postId, tagId],
      );
  }
}

function resolveExportPath(): string {
  const fromEnv = process.env.SEED_EXPORT_PATH?.trim();
  const fromArg = process.argv[2]?.trim();
  return resolveSeedExportPath({
    explicitPath: fromEnv || fromArg || null,
    legacyDir: __dirname,
  });
}

function loadExport(filePath: string): ExportBundle {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ExportBundle;
  const { droppedPostCategory, droppedPostTag } = sanitizePivotRowsInExportJson(
    raw as Record<string, unknown>,
  );
  if (droppedPostCategory > 0 || droppedPostTag > 0) {
    console.warn(
      `[seed-full-export] File lệch pivot: bỏ ${droppedPostCategory} postCategory, ${droppedPostTag} postTag (post|category|tag không có trong file).`,
    );
  }
  const droppedHero = stripLegacyHeroSlideFromBundle(
    raw as Record<string, unknown>,
  );
  if (droppedHero > 0) {
    console.log(
      `[seed-full-export] Đã bỏ key heroSlide (${droppedHero} bản ghi — không còn bảng).`,
    );
  }
  return raw;
}

function coerceRowDates(row: ExportRow): void {
  for (const k of Object.keys(row)) {
    if (!ISO_DATE_FIELDS.has(k)) continue;
    const v = row[k];
    if (typeof v === 'string') row[k] = new Date(v);
  }
}

/** Thứ tự phụ thuộc FK — giống logic import bulk trong hệ thống. */
const SEED_MODEL_ORDER = [
  'role',
  'user',
  'category',
  'tag',
  'setting',
  'admissionResult',
  'post',
  'postCategory',
  'postTag',
  'comment',
  'contactRequest',
  'group',
  'groupMember',
  'message',
  'messageRead',
  'notification',
  'pageContent',
  'userRole',
  'account',
  'session',
  'student',
  'verificationToken',
] as const;

function orderMessages(rows: ExportRow[]): ExportRow[] {
  const pool = new Map<string, ExportRow>(
    rows.map((r) => [exportKey(r.id), { ...r }]),
  );
  const result: ExportRow[] = [];
  const inserted = new Set<string>();
  let guard = 0;
  while (pool.size && guard++ < rows.length + 10) {
    let added = 0;
    for (const [id, row] of [...pool.entries()]) {
      const p = row.parentId as string | null | undefined;
      if (!p || inserted.has(exportKey(p))) {
        result.push(row);
        inserted.add(id);
        pool.delete(id);
        added++;
      }
    }
    if (added === 0) break;
  }
  for (const row of pool.values()) {
    row.parentId = null;
    result.push(row);
  }
  return result;
}

async function seedFromExport(orm: MikroORM, data: ExportBundle) {
  const em = orm.em.fork();
  const idMaps = createIdMaps();

  console.log(
    '[seed-full-export] Một transaction duy nhất: lỗi ở bước sau sẽ rollback toàn bộ (role/user/… chưa commit ra DB nếu seed chưa chạy xong).',
  );
  console.log(
    '[seed-full-export] Không gán id cũ từ export — map FK theo id export → id autoincrement mới.',
  );

  await em.transactional(async (tx) => {
    for (const key of SEED_MODEL_ORDER) {
      const rows = data[key];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      console.log(`[seed-full-export] ${key}: ${rows.length} bản ghi…`);

      switch (key) {
        case 'role': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.role.has(oldId)) continue;
            const existing = await tx.findOne(Role, {
              name: raw.name as string,
            });
            if (existing) {
              idMaps.role.set(oldId, existing.id);
              continue;
            }
            const e = new Role();
            e.name = raw.name as string;
            e.displayName = raw.displayName as string;
            e.description = (raw.description as string | null) ?? null;
            e.permissions = stripHeroSlidesPermissions(raw.permissions);
            e.isActive = Boolean(raw.isActive ?? true);
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            tx.persist(e);
            await tx.flush();
            idMaps.role.set(oldId, e.id);
          }
          break;
        }
        case 'user': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.user.has(oldId)) continue;
            const email = (raw.email as string | null) ?? null;
            const existing = email ? await tx.findOne(User, { email }) : null;
            if (existing) {
              idMaps.user.set(oldId, existing.id);
              continue;
            }
            const e = new User();
            e.email = email;
            e.name = (raw.name as string | null) ?? null;
            e.password = raw.password as string;
            e.bio = (raw.bio as string | null) ?? null;
            e.avatar = (raw.avatar as string | null) ?? null;
            e.emailVerified = (raw.emailVerified as Date | null) ?? null;
            e.phone = (raw.phone as string | null) ?? null;
            e.address = (raw.address as string | null) ?? null;
            e.isActive = Boolean(raw.isActive ?? true);
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            tx.persist(e);
            await tx.flush();
            idMaps.user.set(oldId, e.id);
          }
          break;
        }
        case 'category': {
          for (const raw of orderCategoryRowsForImport(rows)) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.category.has(oldId)) continue;
            const existing = await tx.findOne(Category, {
              slug: raw.slug as string,
            });
            if (existing) {
              idMaps.category.set(oldId, existing.id);
              continue;
            }
            const e = new Category();
            e.name = raw.name as string;
            e.slug = raw.slug as string;
            e.description = (raw.description as string | null) ?? null;
            const pid = optionalMapped(
              idMaps.category,
              raw.parentId as string | null | undefined,
            );
            e.parent =
              pid != null ? tx.getReference(Category, toEntityId(pid)) : null;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            tx.persist(e);
            await tx.flush();
            idMaps.category.set(oldId, e.id);
          }
          break;
        }
        case 'tag': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.tag.has(oldId)) continue;
            const existing = await tx.findOne(Tag, {
              slug: raw.slug as string,
            });
            if (existing) {
              idMaps.tag.set(oldId, existing.id);
              continue;
            }
            const e = new Tag();
            e.name = raw.name as string;
            e.slug = raw.slug as string;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            tx.persist(e);
            await tx.flush();
            idMaps.tag.set(oldId, e.id);
          }
          break;
        }
        case 'setting': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.setting.has(oldId)) continue;
            const existing = await tx.findOne(Setting, {
              key: raw.key as string,
            });
            if (existing) {
              idMaps.setting.set(oldId, existing.id);
              continue;
            }
            const e = new Setting();
            e.key = raw.key as string;
            e.value = raw.value;
            e.group = (raw.group as string) ?? 'general';
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            tx.persist(e);
            await tx.flush();
            idMaps.setting.set(oldId, e.id);
          }
          break;
        }
        case 'admissionResult': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.admissionResult.has(oldId)) continue;
            const e = new AdmissionResult();
            e.cccd = (raw.cccd as string | null) ?? null;
            e.soBaoDanh = (raw.soBaoDanh as string | null) ?? null;
            e.hoTen = raw.hoTen as string;
            e.nganhDangKy = raw.nganhDangKy as string;
            e.diemMon1 = (raw.diemMon1 as string | null) ?? null;
            e.diemMon2 = (raw.diemMon2 as string | null) ?? null;
            e.diemMon3 = (raw.diemMon3 as string | null) ?? null;
            e.diemTong = (raw.diemTong as string | null) ?? null;
            e.diemUuTienKhuVuc =
              (raw.diemUuTienKhuVuc as string | null) ?? null;
            e.diemUuTienDoiTuong =
              (raw.diemUuTienDoiTuong as string | null) ?? null;
            e.ghiChu = (raw.ghiChu as string | null) ?? null;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            tx.persist(e);
            await tx.flush();
            idMaps.admissionResult.set(oldId, e.id);
          }
          break;
        }
        case 'post': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.post.has(oldId)) continue;
            const existing = await tx.findOne(Post, {
              slug: raw.slug as string,
            });
            if (existing) {
              idMaps.post.set(oldId, existing.id);
              continue;
            }
            const e = new Post();
            e.title = raw.title as string;
            e.content = raw.content;
            e.excerpt = (raw.excerpt as string | null) ?? null;
            e.slug = raw.slug as string;
            e.image = (raw.image as string | null) ?? null;
            e.published = Boolean(raw.published);
            e.publishedAt = (raw.publishedAt as Date | null) ?? null;
            e.eventStartAt = (raw.eventStartAt as Date | null) ?? null;
            e.eventEndAt = (raw.eventEndAt as Date | null) ?? null;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            e.author = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.authorId), 'user'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.post.set(oldId, e.id);
          }
          break;
        }
        case 'postCategory': {
          for (const raw of rows) {
            const postId = requireMapped(
              idMaps.post,
              exportKey(raw.postId),
              'post',
            );
            const categoryId = requireMapped(
              idMaps.category,
              exportKey(raw.categoryId),
              'category',
            );
            const exists = await tx.findOne(PostCategory, {
              post: postId,
              category: categoryId,
            });
            if (exists) continue;
            await insertPostCategoryPivot(tx, postId, categoryId);
          }
          break;
        }
        case 'postTag': {
          for (const raw of rows) {
            const postId = requireMapped(
              idMaps.post,
              exportKey(raw.postId),
              'post',
            );
            const tagId = requireMapped(
              idMaps.tag,
              exportKey(raw.tagId),
              'tag',
            );
            const exists = await tx.findOne(PostTag, {
              post: postId,
              tag: tagId,
            });
            if (exists) continue;
            await insertPostTagPivot(tx, postId, tagId);
          }
          break;
        }
        case 'comment': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.comment.has(oldId)) continue;
            const e = new Comment();
            e.content = raw.content as string;
            e.approved = Boolean(raw.approved);
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            e.author = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.authorId), 'user'),
            );
            e.post = tx.getReference(
              Post,
              requireMapped(idMaps.post, exportKey(raw.postId), 'post'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.comment.set(oldId, e.id);
          }
          break;
        }
        case 'contactRequest': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.contactRequest.has(oldId)) continue;
            const e = new ContactRequest();
            e.name = raw.name as string;
            e.email = raw.email as string;
            e.phone = (raw.phone as string | null) ?? null;
            e.subject = raw.subject as string;
            e.content = raw.content as string;
            e.status = raw.status as ContactRequest['status'];
            e.priority = raw.priority as ContactRequest['priority'];
            e.isRead = Boolean(raw.isRead);
            const uid = optionalMapped(
              idMaps.user,
              raw.userId as string | null | undefined,
            );
            e.submittedBy =
              uid != null ? tx.getReference(User, toEntityId(uid)) : null;
            const aid = optionalMapped(
              idMaps.user,
              raw.assignedToId as string | null | undefined,
            );
            e.assignedTo =
              aid != null ? tx.getReference(User, toEntityId(aid)) : null;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            tx.persist(e);
            await tx.flush();
            idMaps.contactRequest.set(oldId, e.id);
          }
          break;
        }
        case 'group': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.group.has(oldId)) continue;
            const e = new Group();
            e.name = raw.name as string;
            e.description = (raw.description as string | null) ?? null;
            e.avatar = (raw.avatar as string | null) ?? null;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            e.creator = tx.getReference(
              User,
              requireMapped(
                idMaps.user,
                exportKey(raw.createdById ?? raw.creatorId),
                'user',
              ),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.group.set(oldId, e.id);
          }
          break;
        }
        case 'groupMember': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.groupMember.has(oldId)) continue;
            const e = new GroupMember();
            e.role = raw.role as GroupMember['role'];
            e.joinedAt = raw.joinedAt as Date;
            e.leftAt = (raw.leftAt as Date | null) ?? null;
            e.group = tx.getReference(
              Group,
              requireMapped(idMaps.group, exportKey(raw.groupId), 'group'),
            );
            e.user = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.userId), 'user'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.groupMember.set(oldId, e.id);
          }
          break;
        }
        case 'message': {
          for (const raw of orderMessages(rows)) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.message.has(oldId)) continue;
            const e = new Message();
            e.subject = raw.subject as string;
            e.content = raw.content as string;
            e.isRead = Boolean(raw.isRead);
            e.type = raw.type as Message['type'];
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            const pid = optionalMapped(
              idMaps.message,
              raw.parentId as string | null | undefined,
            );
            e.parent =
              pid != null ? tx.getReference(Message, toEntityId(pid)) : null;
            const rid = optionalMapped(
              idMaps.user,
              raw.receiverId as string | null | undefined,
            );
            e.receiver =
              rid != null ? tx.getReference(User, toEntityId(rid)) : null;
            const sid = optionalMapped(
              idMaps.user,
              raw.senderId as string | null | undefined,
            );
            e.sender =
              sid != null ? tx.getReference(User, toEntityId(sid)) : null;
            const gid = optionalMapped(
              idMaps.group,
              raw.groupId as string | null | undefined,
            );
            e.group =
              gid != null ? tx.getReference(Group, toEntityId(gid)) : null;
            tx.persist(e);
            await tx.flush();
            idMaps.message.set(oldId, e.id);
          }
          break;
        }
        case 'messageRead': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.messageRead.has(oldId)) continue;
            const e = new MessageRead();
            e.readAt = raw.readAt as Date;
            e.message = tx.getReference(
              Message,
              requireMapped(
                idMaps.message,
                exportKey(raw.messageId),
                'message',
              ),
            );
            e.user = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.userId), 'user'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.messageRead.set(oldId, e.id);
          }
          break;
        }
        case 'notification': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.notification.has(oldId)) continue;
            const e = new Notification();
            e.kind = (raw.kind as NotificationKind) ?? NotificationKind.MESSAGE;
            e.title = raw.title as string;
            e.description = (raw.description as string | null) ?? null;
            e.isRead = Boolean(raw.isRead);
            e.actionUrl = (raw.actionUrl as string | null) ?? null;
            e.metadata =
              (raw.metadata as Record<string, unknown> | null) ?? null;
            e.expiresAt = (raw.expiresAt as Date | null) ?? null;
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.readAt = (raw.readAt as Date | null) ?? null;
            e.user = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.userId), 'user'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.notification.set(oldId, e.id);
          }
          break;
        }
        case 'pageContent': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.pageContent.has(oldId)) continue;
            const existing = await tx.findOne(PageContent, {
              pageKey: raw.pageKey as string,
              sectionKey: raw.sectionKey as string,
            });
            if (existing) {
              idMaps.pageContent.set(oldId, existing.id);
              continue;
            }
            const e = new PageContent();
            e.pageKey = raw.pageKey as string;
            e.sectionKey = raw.sectionKey as string;
            e.content =
              (raw.content as Record<string, unknown>) &&
              typeof raw.content === 'object'
                ? (raw.content as Record<string, unknown>)
                : {};
            e.isVisible = Boolean(raw.isVisible ?? true);
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            tx.persist(e);
            await tx.flush();
            idMaps.pageContent.set(oldId, e.id);
          }
          break;
        }
        case 'userRole': {
          for (const raw of rows) {
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.userRole.has(oldId)) continue;
            const userId = requireMapped(
              idMaps.user,
              exportKey(raw.userId),
              'user',
            );
            const roleId = requireMapped(
              idMaps.role,
              exportKey(raw.roleId),
              'role',
            );
            const existing = await tx.findOne(UserRole, {
              user: userId,
              role: roleId,
            });
            if (existing) {
              idMaps.userRole.set(oldId, existing.id);
              continue;
            }
            const e = new UserRole();
            e.user = tx.getReference(User, userId);
            e.role = tx.getReference(Role, roleId);
            tx.persist(e);
            await tx.flush();
            idMaps.userRole.set(oldId, e.id);
          }
          break;
        }
        case 'account': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.account.has(oldId)) continue;
            const e = new Account();
            e.type = raw.type as string;
            e.provider = raw.provider as string;
            e.providerAccountId = raw.providerAccountId as string;
            e.refresh_token = (raw.refresh_token as string | null) ?? undefined;
            e.access_token = (raw.access_token as string | null) ?? undefined;
            e.expires_at =
              raw.expires_at == null ? undefined : Number(raw.expires_at);
            e.token_type = (raw.token_type as string | null) ?? undefined;
            e.scope = (raw.scope as string | null) ?? undefined;
            e.id_token = (raw.id_token as string | null) ?? undefined;
            e.session_state = (raw.session_state as string | null) ?? undefined;
            e.user = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.userId), 'user'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.account.set(oldId, e.id);
          }
          break;
        }
        case 'session': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.session.has(oldId)) continue;
            const e = new Session();
            e.accessToken = raw.accessToken as string;
            e.refreshToken = raw.refreshToken as string;
            e.userAgent = (raw.userAgent as string | null) ?? null;
            e.ipAddress = (raw.ipAddress as string | null) ?? null;
            e.isActive = Boolean(raw.isActive ?? true);
            e.expiresAt = raw.expiresAt as Date;
            e.lastActivity = raw.lastActivity as Date;
            e.createdAt = raw.createdAt as Date;
            e.user = tx.getReference(
              User,
              requireMapped(idMaps.user, exportKey(raw.userId), 'user'),
            );
            tx.persist(e);
            await tx.flush();
            idMaps.session.set(oldId, e.id);
          }
          break;
        }
        case 'student': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const oldId = exportKey(raw.id);
            if (!oldId || idMaps.student.has(oldId)) continue;
            const existing = await tx.findOne(Student, {
              studentCode: raw.studentCode as string,
            });
            if (existing) {
              idMaps.student.set(oldId, existing.id);
              continue;
            }
            const e = new Student();
            e.name = (raw.name as string | null) ?? null;
            e.email = (raw.email as string | null) ?? null;
            e.studentCode = raw.studentCode as string;
            e.isActive = Boolean(raw.isActive ?? true);
            e.createdAt = raw.createdAt as Date;
            e.updatedAt = raw.updatedAt as Date;
            e.deletedAt = (raw.deletedAt as Date | null) ?? null;
            const uid = optionalMapped(
              idMaps.user,
              raw.userId as string | null | undefined,
            );
            e.user =
              uid != null ? tx.getReference(User, toEntityId(uid)) : null;
            tx.persist(e);
            await tx.flush();
            idMaps.student.set(oldId, e.id);
          }
          break;
        }
        case 'verificationToken': {
          for (const raw of rows) {
            coerceRowDates(raw);
            const identifier = String(raw.identifier);
            const token = String(raw.token);
            const exists = await tx.findOne(VerificationToken, {
              identifier,
              token,
            });
            if (exists) continue;
            const e = new VerificationToken();
            e.identifier = identifier;
            e.token = token;
            e.expires = raw.expires as Date;
            tx.persist(e);
          }
          break;
        }
        default:
          break;
      }

      await tx.flush();
    }
  });

  console.log('[seed-full-export] Hoàn tất.');
}

async function main() {
  const exportPath = resolveExportPath();
  console.log(`[seed-full-export] Đọc: ${exportPath}`);
  const data = loadExport(exportPath);

  const orm = await MikroORM.init({
    driver: getDriver() as never,
    clientUrl: process.env.DATABASE_URL,
    entities: [...ormEntities],
    namingStrategy: EntityCaseNamingStrategy,
    debug: false,
  });

  try {
    await seedFromExport(orm, data);
  } finally {
    await orm.close();
  }
}

main().catch((err) => {
  console.error('[seed-full-export] Lỗi:', err);
  process.exit(1);
});
