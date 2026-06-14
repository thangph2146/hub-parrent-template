/**
 * Users Module barrel export
 *
 * Re-exports all user-related classes, types, and utilities
 * from the api-server package.
 */

// Types
export type {
  UserRowDto,
  UserRoleDto,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  BulkOperationResult,
  PaginatedResult,
  DevLoginOption,
  DevLoginRole,
  DevLoginOptionsQuery,
} from '../../types';

// Service
export {
  BaseUsersService,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from './users.service';
export type { UserOption } from './users.service';

// Controller
export {
  BaseUsersController,
  CreateUserDto,
  UpdateUserDto,
  BulkActionDto,
} from './users.controller';

// Module
export { BaseUsersModule } from './users.module';

// Mapper (re-export from parent)
export {
  mapUserToRowDto,
  mapUserRoles,
  mapUserToDevLoginOption,
  filterDevLoginOptions,
  buildSearchPattern,
  buildSearchConditions,
} from './users.mapper';
