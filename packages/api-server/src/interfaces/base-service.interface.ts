/**
 * Base Service Interface
 * Contract for base CRUD operations
 */
import type { PaginatedResult, ListQueryParams } from '../types';

/**
 * Base service interface for CRUD operations
 */
export interface IBaseService<T, TCreate = unknown, TUpdate = unknown> {
  /**
   * List entities with pagination
   */
  list(params: ListQueryParams): Promise<PaginatedResult<T>>;

  /**
   * Get entity by ID
   */
  getById(id: string): Promise<T | null>;

  /**
   * Create new entity
   */
  create(data: TCreate): Promise<T>;

  /**
   * Update existing entity
   */
  update(id: string, data: TUpdate): Promise<T | null>;

  /**
   * Soft delete entity
   */
  softDelete(id: string): Promise<boolean>;

  /**
   * Restore soft-deleted entity
   */
  restore(id: string): Promise<boolean>;

  /**
   * Hard delete entity
   */
  hardDelete(id: string): Promise<boolean>;
}

/**
 * Bulk action types
 */
export type BulkActionType = 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive';

/**
 * Bulk operation result interface
 */
export interface IBulkOperationResult {
  affected: number;
  message: string;
  affectedIds?: string[];
}

/**
 * Base bulk service interface
 */
export interface IBaseBulkService {
  /**
   * Perform bulk action on entities
   */
  bulk(action: BulkActionType, ids: string[]): Promise<IBulkOperationResult>;
}
