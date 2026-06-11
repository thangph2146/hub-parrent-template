/**
 * User Service Interface
 * Contract for user management services
 */
import type {
  UserRowDto,
  PaginatedResult,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  BulkOperationResult,
  UserOption,
  DevLoginOption,
  DevLoginOptionsQuery,
} from '../types';

/**
 * User Service abstraction
 * Defines the contract for user management operations
 */
export interface IUsersService {
  /**
   * List users with pagination and filters
   */
  list(params: ListUsersParams): Promise<PaginatedResult<UserRowDto>>;

  /**
   * Get user by ID
   */
  getById(id: string): Promise<UserRowDto | null>;

  /**
   * Create a new user
   */
  create(data: CreateUserData): Promise<UserRowDto>;

  /**
   * Update existing user
   */
  update(
    id: string,
    data: UpdateUserData,
    actorEmail?: string | null,
  ): Promise<UserRowDto | null>;

  /**
   * Soft delete user
   */
  softDelete(id: string): Promise<boolean>;

  /**
   * Restore soft-deleted user
   */
  restore(id: string): Promise<boolean>;

  /**
   * Hard delete user
   */
  hardDelete(id: string): Promise<boolean>;

  /**
   * Bulk operation on users
   */
  bulk(
    action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive',
    ids: string[],
  ): Promise<BulkOperationResult>;

  /**
   * Get user options for dropdowns
   */
  getOptions(
    column: string,
    search?: string,
    limit?: number,
  ): Promise<UserOption[]>;

  /**
   * List development login options
   */
  listDevelopmentLoginOptions(
    query?: DevLoginOptionsQuery,
  ): Promise<DevLoginOption[]>;

  /**
   * Resolve user ID to email
   */
  resolveActorEmail(userId: string): Promise<string | null>;
}

/**
 * User Service factory type
 */
export type UsersServiceFactory = () => IUsersService;
