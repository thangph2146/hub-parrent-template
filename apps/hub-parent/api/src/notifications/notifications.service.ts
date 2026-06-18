/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { mapNotificationToPayload } from '../socket/notification-mapper';
import { BaseNotificationsService } from '../common/module-bases/notifications/notifications.service';

export type {
  NotificationsListQuery,
  NotificationItemDto,
  NotificationsListResult,
  UnreadCountsResult,
  AdminTableRowDto,
  AdminTableQuery,
  AdminTableResult,
} from '../common/module-bases/notifications/notifications.service';

@Injectable()
export class NotificationsService extends BaseNotificationsService {
  constructor(
    private readonly em: EntityManager,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getNotificationEntity() {
    return Notification as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity() {
    return UserRole as unknown as new () => Record<string, unknown>;
  }
  protected getMessageEntity() {
    return Notification as unknown as new () => Record<string, unknown>;
  }

  async getUnreadCounts(userId: string | number) {
    const NotificationEntity = this.getNotificationEntity();
    const ContactRequestEntity = this.getContactRequestEntity();
    const uid = typeof userId === 'number' ? userId : Number.parseInt(userId, 10);
    const [unreadNotifications, contactRequests] = await Promise.all([
      this.getEm().count(NotificationEntity, { user: uid, isRead: false }),
      this.getEm().count(ContactRequestEntity, { isRead: false, deletedAt: null }),
    ]);
    return { unreadNotifications, unreadMessages: 0, contactRequests };
  }

  protected getContactRequestEntity() {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }

  protected emitNotificationToUser(
    recipientUserId: number,
    notification: Record<string, unknown>,
  ): void {
    const payload = mapNotificationToPayload(notification as never);
    this.socketGateway.emitNotificationToUser(recipientUserId, payload);
  }
}
