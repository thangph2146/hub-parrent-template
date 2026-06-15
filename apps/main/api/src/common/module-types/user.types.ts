/**
 * User Types and DTOs
 * Shared types for user management across API servers
 */

/**
 * User row data returned from list/getById operations
 */
export interface UserRowDto {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  emailVerified: string | null;
  phone: string | null;
  address: string | null;
  citizenId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: UserRoleDto[];
}

/**
 * User role information
 */
export interface UserRoleDto {
  id: number;
  name: string;
  displayName: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated list result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * List users query parameters
 */
export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  filters?: Record<string, string>;
}

/**
 * Create user data
 */
export interface CreateUserData {
  email: string;
  name?: string | null;
  password: string;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  isActive?: boolean;
  roleIds?: string[];
}

/**
 * Update user data
 */
export interface UpdateUserData {
  email?: string;
  name?: string | null;
  password?: string;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  citizenId?: string | null;
  isActive?: boolean;
  roleIds?: string[];
}

/**
 * Bulk action types for user management
 */
export type BulkAction =
  | 'delete'
  | 'restore'
  | 'hard-delete'
  | 'active'
  | 'unactive';

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  affected: number;
  message: string;
  affectedUserIds?: string[];
}

/**
 * User options for dropdown/selection
 */
export interface UserOption {
  label: string;
  value: string;
}

/**
 * Development login option
 */
export interface DevLoginRole {
  id: number;
  name: string;
  displayName: string;
}

export interface DevLoginOption {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  roleNames: string[];
  roleLabels: string[];
  roles: DevLoginRole[];
  description: string;
}

/**
 * Development login options query
 */
export interface DevLoginOptionsQuery {
  role?: string;
  search?: string;
  roles?: string;
  excludeRoles?: string;
  emailSuffix?: string;
  activeOnly?: boolean;
}
