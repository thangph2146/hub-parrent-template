/**
 * Types barrel export.
 *
 * Su dung explicit re-exports de tranh xung dot ten type trung nhau
 * giua user.types.ts va crud.types.ts (ca hai co BulkOperationResult,
 * CrudFieldDescriptor).
 */
export type {
  UserRowDto,
  UserRoleDto,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  PaginatedResult,
  PaginationMeta,
  UserOption,
  DevLoginOption,
  DevLoginRole,
  DevLoginOptionsQuery,
} from './user.types';

export type {
  ApiResponse,
  ApiError,
  ListQueryParams,
  FilterOperator,
  FilterCondition,
  Timestamps,
  SoftDeletable,
  Activable,
  BaseEntity,
  PaginationInput,
} from './common.types';

export type {
  CrudRowDto,
  ListCrudParams,
  CrudCreateData,
  CrudUpdateData,
  CrudFieldDescriptor,
} from './crud.types';

// Re-export BulkOperationResult explicitly (chi 1 source)
export type { BulkOperationResult } from './crud.types';
