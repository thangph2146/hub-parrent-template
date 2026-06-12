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
