/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Notifications Module — NestJS wiring cho admin notifications.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseNotificationsController } from './notifications.controller';

@Module({})
export class BaseNotificationsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseNotificationsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseNotificationsController } from './notifications.controller';
export {
  BaseNotificationsService,
  type NotificationsListQuery,
  type NotificationItemDto,
  type NotificationsListResult,
  type UnreadCountsResult,
  type AdminTableRowDto,
  type AdminTableQuery,
  type AdminTableResult,
} from './notifications.service';
