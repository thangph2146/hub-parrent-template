/**
 * Users Module Types
 * Type definitions for users module
 */
import type {
  UserRowDto,
  UserRoleDto,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  BulkOperationResult,
  PaginatedResult,
  UserOption,
  DevLoginOption,
  DevLoginOptionsQuery,
} from '../../types';

/**
 * Users module interface for shared functionality
 */
export interface IUsersModule {
  /**
   * Get user service instance
   */
  getService(): unknown;

  /**
   * Get controller instance
   */
  getController(): unknown;
}

/**
 * Users module configuration
 */
export interface UsersModuleConfig {
  /**
   * Enable soft delete by default
   */
  softDelete?: boolean;

  /**
   * Default page size
   */
  defaultLimit?: number;

  /**
   * Maximum page size
   */
  maxLimit?: number;

  /**
   * Enable search on these fields
   */
  searchFields?: string[];

  /**
   * Enable filtering on these fields
   */
  filterFields?: string[];
}

/**
 * User activity log entry
 */
export interface UserActivityLog {
  userId: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'bulk';
  targetUserId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * User bulk action result with details
 */
export interface UserBulkActionResult extends BulkOperationResult {
  action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive';
  totalRequested: number;
  skippedCount: number;
  skippedReasons?: Record<string, string>;
}

// Re-export all user types
export {
  UserRowDto,
  UserRoleDto,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  BulkOperationResult,
  PaginatedResult,
  UserOption,
  DevLoginOption,
  DevLoginOptionsQuery,
};
