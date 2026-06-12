/**
 * Notifications Module.
 *
 * Bám sát pattern của `apps/main/api/src/notifications/notifications.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseNotificationsController } from './notification.controller';

@Module({})
export class BaseNotificationsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseNotificationsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseNotificationsController } from './notification.controller';
export {
  BaseNotificationsService,
  type NotificationsRowDto,
  type NotificationsCreateData,
  type NotificationsUpdateData,
} from './notification.service';
