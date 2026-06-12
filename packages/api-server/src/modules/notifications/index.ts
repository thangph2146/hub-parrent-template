/**
 * Notifications Module barrel export.
 */
export {
  BaseNotificationsService,
  BaseNotificationsController,
  BaseNotificationsModule,
} from './notifications.module';

export type { INotificationsControllerService } from './notification.controller';

export type {
  NotificationsRowDto,
  NotificationsCreateData,
  NotificationsUpdateData,
} from './notification.service';

export { BaseNotificationsAdminService } from './notifications-admin.service';
export type {
  NotificationsListQuery,
  NotificationItemDto,
  NotificationsListResult,
  UnreadCountsResult,
  AdminTableRowDto,
  AdminTableQuery,
  AdminTableResult,
} from './notifications-admin.service';
