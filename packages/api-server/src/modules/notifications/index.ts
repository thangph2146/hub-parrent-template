/**
 * Notifications module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseNotificationsService,
  BaseNotificationsService as BaseNotificationsAdminService,
} from './notifications.service';
export {
  BaseNotificationsController,
  BaseNotificationsController as BaseNotificationsAdminController,
} from './notifications.controller';
export type { INotificationsControllerService } from './notifications.controller';
/** @deprecated Dùng `INotificationsControllerService`. */
export type { INotificationsControllerService as INotificationsAdminControllerService } from './notifications.controller';
export type {
  NotificationsListQuery,
  NotificationItemDto,
  NotificationsListResult,
  UnreadCountsResult,
  AdminTableRowDto,
  AdminTableQuery,
  AdminTableResult,
} from './notifications.service';
export { BaseNotificationsModule } from './notifications.module';
