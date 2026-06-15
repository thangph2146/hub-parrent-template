/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Base Users Module
 *
 * NestJS module for user management.
 * Import this module in your app and extend/replace components as needed.
 *
 * @example
 * ```typescript
 * // In your app's users.module.ts
 * import { Module } from '@nestjs/common';
 * import { BaseUsersModule } from '@workspace/api-server/modules/users';
 * import { UsersService } from './users.service';
 * import { UsersController } from './users.controller';
 * import { NotificationsModule } from '../notifications/notifications.module';
 *
 * @Module({
 *   imports: [BaseUsersModule, NotificationsModule],
 *   controllers: [UsersController],
 *   providers: [UsersService],
 *   exports: [UsersService],
 * })
 * export class UsersModule {}
 * ```
 */
import { Module, type ModuleMetadata } from '@nestjs/common';

/**
 * Base Users Module
 * Provides basic user management structure
 */
@Module({})
export class BaseUsersModule {
  /**
   * Configure the module with custom metadata
   */
  static forRoot(metadata: ModuleMetadata): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: metadata.controllers ?? [],
      providers: [...(metadata.providers ?? [])],
      exports: metadata.exports ?? [],
    };
  }
}

/**
 * Re-export commonly used classes
 */
export { BaseUsersController } from './users.controller';
export {
  BaseUsersService,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from './users.service';
export type {
  CreateUserDto,
  UpdateUserDto,
  BulkActionDto,
} from './users.controller';
