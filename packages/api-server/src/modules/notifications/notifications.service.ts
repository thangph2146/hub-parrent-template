/**
 * Notifications admin service — domain logic (materialize → apps/main/api module-bases).
 */
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { relationEntityId, toEntityId, toEntityIdList } from '../../common/entity-id';

const NOTIFICATION_KIND_SYSTEM = 'SYSTEM';
const MESSAGE_TYPE_PERSONAL = 'PERSONAL';
const LOGIN_NOTIFICATION_TITLE = 'Tài khoản đăng nhập';
const WELCOME_BACK_TITLE = 'Chào mừng bạn trở lại';
const SUPER_ADMIN_ROLE_NAME = 'super_admin';

export interface NotificationsListQuery {
  userId: number;
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  mine?: boolean;
}

export interface NotificationItemDto {
  id: number;
  userId: number;
  kind: string;
  title: string;
  description: string | null;
  isRead: boolean;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
}

export interface NotificationsListResult {
  notifications: NotificationItemDto[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface UnreadCountsResult {
  unreadNotifications: number;
  unreadMessages: number;
  contactRequests: number;
}

export interface AdminTableRowDto extends NotificationItemDto {
  userEmail: string | null;
  userName: string | null;
}

export interface AdminTableQuery {
  userId: number;
  viewAll?: boolean;
  page: number;
  limit: number;
  search?: string;
  filters?: Record<string, string>;
}

export interface AdminTableResult {
  data: AdminTableRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type NotificationWithUser = {
  id: number;
  kind: string;
  title: string;
  description?: string | null;
  isRead: boolean;
  actionUrl?: string | null;
  metadata?: unknown;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date | null;
  user?: { id?: number; name?: string | null; email?: string } | null;
};

function mapRow(n: NotificationWithUser): NotificationItemDto {
  return {
    id: n.id,
    userId: relationEntityId(n.user) ?? 0,
    kind: n.kind,
    title: n.title,
    description: n.description ?? null,
    isRead: n.isRead,
    actionUrl: n.actionUrl ?? null,
    metadata: (n.metadata as Record<string, unknown> | null) ?? null,
    expiresAt: n.expiresAt ?? null,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    readAt: n.readAt ?? null,
  };
}

@Injectable()
export abstract class BaseNotificationsService {
  protected abstract getEm(): EntityManager;
  protected abstract getNotificationEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getUserRoleEntity(): new () => Record<string, unknown>;
  protected abstract getMessageEntity(): new () => Record<string, unknown>;
  protected abstract getContactRequestEntity(): new () => Record<string, unknown>;
  protected abstract emitNotificationToUser(
    recipientUserId: number,
    notification: Record<string, unknown>,
  ): void;

  async getSuperAdminUserIds(): Promise<number[]> {
    const UserRole = this.getUserRoleEntity();
    const rows = await this.getEm().find(
      UserRole,
      { role: { name: SUPER_ADMIN_ROLE_NAME } },
      { populate: ['role', 'user'], fields: ['user'] },
    );
    return [
      ...new Set(
        (rows as Array<{ user?: unknown }>)
          .map((r) => relationEntityId(r.user))
          .filter((id): id is number => id != null),
      ),
    ];
  }

  async hasRecentLoginNotification(
    recipientUserId: string | number,
    description: string,
    withinLastMs: number = 60_000,
  ): Promise<boolean> {
    const Notification = this.getNotificationEntity();
    const since = new Date(Date.now() - withinLastMs);
    const existing = await this.getEm().findOne(Notification, {
      user: toEntityId(recipientUserId),
      title: LOGIN_NOTIFICATION_TITLE,
      description,
      createdAt: { $gte: since },
    });
    return existing != null;
  }

  async hasRecentWelcomeBackNotification(
    userId: string | number,
    withinLastMs: number = 60_000,
  ): Promise<boolean> {
    const Notification = this.getNotificationEntity();
    const since = new Date(Date.now() - withinLastMs);
    const existing = await this.getEm().findOne(Notification, {
      user: toEntityId(userId),
      kind: NOTIFICATION_KIND_SYSTEM,
      title: WELCOME_BACK_TITLE,
      createdAt: { $gte: since },
    });
    return existing != null;
  }

  async create(data: {
    userId: number;
    kind: string;
    title: string;
    description?: string | null;
    actionUrl?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<NotificationItemDto> {
    const Notification = this.getNotificationEntity();
    const User = this.getUserEntity();
    const entity = new Notification() as NotificationWithUser & Record<string, unknown>;
    entity.user = this.getEm().getReference(User, toEntityId(data.userId));
    entity.kind = data.kind;
    entity.title = data.title;
    entity.description = data.description ?? null;
    entity.actionUrl = data.actionUrl ?? null;
    entity.metadata = data.metadata ?? null;
    this.getEm().persist(entity);
    await this.getEm().flush();
    const created = await this.getEm().findOne(
      Notification,
      { id: entity.id },
      { populate: ['user'] },
    );
    if (created) {
      this.emitNotificationToUser(
        data.userId,
        created as Record<string, unknown>,
      );
    }
    return mapRow(entity);
  }

  async list(query: NotificationsListQuery): Promise<NotificationsListResult> {
    const Notification = this.getNotificationEntity();
    const { userId, limit = 20, offset = 0, unreadOnly = false } = query;

    const where: Record<string, unknown> = { user: toEntityId(userId) };
    if (unreadOnly) where.isRead = false;
    const whereQuery = where as FilterQuery<object>;

    const [notifications, total, unreadCount] = await Promise.all([
      this.getEm().find(Notification, whereQuery, {
        orderBy: { createdAt: 'DESC' },
        limit: Math.min(limit, 100),
        offset,
      }),
      this.getEm().count(Notification, whereQuery),
      this.getEm().count(Notification, { user: toEntityId(userId), isRead: false }),
    ]);

    return {
      notifications: (notifications as NotificationWithUser[]).map((n) => ({
        ...mapRow(n),
        metadata: (n.metadata as Record<string, unknown> | null) ?? null,
      })),
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    };
  }

  async getUnreadCounts(userId: string | number): Promise<UnreadCountsResult> {
    const Notification = this.getNotificationEntity();
    const Message = this.getMessageEntity();
    const ContactRequest = this.getContactRequestEntity();
    const uid = toEntityId(userId);
    const [unreadNotifications, personalUnread, groupUnread, contactRequests] =
      await Promise.all([
        this.getEm().count(Notification, { user: uid, isRead: false }),
        this.getEm().count(Message, {
          type: MESSAGE_TYPE_PERSONAL,
          receiver: uid,
          isRead: false,
          deletedAt: null,
        }),
        this.getEm().count(Message, {
          group: { $ne: null },
          deletedAt: null,
          sender: { $ne: uid },
        }),
        this.getEm().count(ContactRequest, { isRead: false, deletedAt: null }),
      ]);

    return {
      unreadNotifications,
      unreadMessages: personalUnread + groupUnread,
      contactRequests,
    };
  }

  async markRead(
    notificationId: string,
    userId: string,
    isRead: boolean,
  ): Promise<NotificationItemDto | null> {
    const Notification = this.getNotificationEntity();
    const nid = toEntityId(notificationId);
    const uid = toEntityId(userId);
    const n = await this.getEm().findOne(Notification, {
      id: nid,
      user: uid,
    });
    if (!n) return null;

    await this.getEm().nativeUpdate(
      Notification,
      { id: nid },
      { isRead, readAt: isRead ? new Date() : null },
    );

    const updated = await this.getEm().findOne(Notification, { id: nid });
    if (!updated) return null;

    return mapRow(updated as NotificationWithUser);
  }

  async markAllAsRead(userId: string | number): Promise<{ count: number }> {
    const Notification = this.getNotificationEntity();
    const result = await this.getEm().nativeUpdate(
      Notification,
      { user: toEntityId(userId), isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { count: result ?? 0 };
  }

  async bulkMarkReadUnread(
    userId: string | number,
    action: 'mark-read' | 'mark-unread',
    ids: string[],
  ): Promise<{ count: number; alreadyAffected?: number }> {
    const Notification = this.getNotificationEntity();
    if (ids.length === 0) {
      return { count: 0, alreadyAffected: 0 };
    }
    const isRead = action === 'mark-read';
    const updated = await this.getEm().nativeUpdate(
      Notification,
      {
        id: { $in: toEntityIdList(ids) },
        user: toEntityId(userId),
        isRead: !isRead,
      },
      { isRead, readAt: isRead ? new Date() : null },
    );
    return {
      count: updated ?? 0,
      alreadyAffected: ids.length - (updated ?? 0),
    };
  }

  async bulkDelete(
    userId: string | number,
    ids: string[],
  ): Promise<{ count: number }> {
    const Notification = this.getNotificationEntity();
    if (ids.length === 0) {
      return { count: 0 };
    }
    const result = await this.getEm().nativeDelete(Notification, {
      id: { $in: toEntityIdList(ids) },
      user: toEntityId(userId),
    });
    return { count: result ?? 0 };
  }

  async deleteOne(notificationId: string, userId: string): Promise<boolean> {
    const Notification = this.getNotificationEntity();
    const n = await this.getEm().findOne(Notification, {
      id: toEntityId(notificationId),
      user: toEntityId(userId),
    });
    if (!n) return false;
    await this.getEm().nativeDelete(Notification, {
      id: toEntityId(notificationId),
    });
    return true;
  }

  async listForAdminTable(query: AdminTableQuery): Promise<AdminTableResult> {
    const Notification = this.getNotificationEntity();
    const { userId, viewAll = false, page, limit, search, filters } = query;
    const skip = (page - 1) * limit;
    const take = Math.min(Math.max(1, limit), 100);

    const where: Record<string, unknown> = {};
    if (!viewAll) {
      where.user = userId;
    }
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      where.$or = [
        { title: { $like: term } },
        { description: { $like: term } },
        { user: { email: { $like: term } } },
        { user: { name: { $like: term } } },
      ];
    }
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        const v = value?.trim();
        if (!v) continue;
        if (key === 'userEmail') {
          where.user = { ...(where.user as object), email: v };
        } else if (key === 'userName') {
          where.user = { ...(where.user as object), name: v };
        } else if (key === 'kind') {
          where.kind = v;
        } else if (key === 'isRead') {
          where.isRead = v === 'true';
        }
      }
    }
    const whereQuery = where as FilterQuery<object>;

    const [rows, total] = await Promise.all([
      this.getEm().find(Notification, whereQuery, {
        populate: ['user'],
        orderBy: { createdAt: 'DESC' },
        offset: skip,
        limit: take,
      }),
      this.getEm().count(Notification, whereQuery),
    ]);

    const data: AdminTableRowDto[] = (rows as NotificationWithUser[]).map((n) => ({
      ...mapRow(n),
      userEmail:
        n.user &&
        typeof n.user === 'object' &&
        'email' in n.user &&
        typeof n.user.email === 'string'
          ? n.user.email
          : null,
      userName:
        n.user &&
        typeof n.user === 'object' &&
        'name' in n.user &&
        (typeof n.user.name === 'string' || n.user.name == null)
          ? (n.user.name ?? null)
          : null,
    }));

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async getColumnOptions(
    column: 'userEmail' | 'userName',
    search?: string,
    limit: number = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    const User = this.getUserEntity();
    const dbColumn = column === 'userEmail' ? 'email' : 'name';
    const where: Record<string, unknown> = { notifications: { $ne: null } };
    if (search?.trim()) {
      where[dbColumn] = { $like: `%${search.trim()}%` };
    }
    const users = await this.getEm().find(User, where as FilterQuery<object>, {
      fields: [dbColumn],
      limit: Math.min(limit, 100),
    });
    const seen = new Set<string>();
    return (users as Array<Record<string, unknown>>)
      .map((u) => u[dbColumn])
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
      .filter((v) => {
        if (seen.has(v)) return false;
        seen.add(v);
        return true;
      })
      .map((value) => ({ label: value, value }));
  }
}
