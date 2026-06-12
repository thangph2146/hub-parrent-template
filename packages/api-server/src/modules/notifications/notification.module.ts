/**
 * Notifications Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseNotificationsController } from './notification.controller';

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

export { BaseNotificationsController } from './notification.controller';
export {
  BaseNotificationsService,
  type NotificationsRowDto,
  type NotificationsCreateData,
  type NotificationsUpdateData,
} from './notification.service';
