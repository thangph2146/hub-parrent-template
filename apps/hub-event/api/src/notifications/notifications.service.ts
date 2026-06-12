/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseNotificationsAdminService } from '@workspace/api-server/modules/notifications';
import { SocketGateway } from '../socket/socket.gateway';
import {
  mapNotificationToPayload,
  type NotificationLike,
} from '../socket/notification-mapper';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Message } from '../entities/message.entity';
import { ContactRequest } from '../entities/contact-request.entity';

export type {
  NotificationsListQuery,
  NotificationItemDto,
  NotificationsListResult,
  UnreadCountsResult,
  AdminTableRowDto,
  AdminTableQuery,
  AdminTableResult,
} from '@workspace/api-server/modules/notifications';

@Injectable()
export class NotificationsService extends BaseNotificationsAdminService {
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

  protected getNotificationEntity(): new () => Record<string, unknown> {
    return Notification as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getUserRoleEntity(): new () => Record<string, unknown> {
    return UserRole as unknown as new () => Record<string, unknown>;
  }

  protected getMessageEntity(): new () => Record<string, unknown> {
    return Message as unknown as new () => Record<string, unknown>;
  }

  protected getContactRequestEntity(): new () => Record<string, unknown> {
    return ContactRequest as unknown as new () => Record<string, unknown>;
  }

  protected emitNotificationToUser(
    recipientUserId: number,
    notification: Record<string, unknown>,
  ): void {
    const payload = mapNotificationToPayload(
      notification as unknown as NotificationLike,
    );
    this.socketGateway.emitNotificationToUser(recipientUserId, payload);
  }
}
