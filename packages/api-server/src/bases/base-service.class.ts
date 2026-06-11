/**
 * Base Service Abstract Class
 * Provides common functionality for services
 */
import { Logger } from '@nestjs/common';
import type {
  PaginatedResult,
  ListQueryParams,
} from '../types';

/**
 * Abstract base service with common CRUD operations
 * Extend this class to create a new service
 */
export abstract class BaseService<
  TEntity,
  TListParams extends ListQueryParams = ListQueryParams,
> {
  protected readonly logger: Logger;

  constructor(entityName: string) {
    this.logger = new Logger(entityName);
  }

  /**
   * Build WHERE clause from list parameters
   * Override in subclass for custom filtering
   */
  protected abstract buildWhere(params: TListParams): Record<string, unknown>;

  /**
   * Map entity to DTO
   * Override in subclass for custom mapping
   */
  protected abstract mapToDto(entity: TEntity): unknown;

  /**
   * Get entity repository or EntityManager
   * Must be implemented by subclass
   */
  protected abstract getEntityManager(): unknown;

  /**
   * List entities with pagination
   */
  async list(
    params: TListParams,
    options?: {
      maxLimit?: number;
      defaultLimit?: number;
      orderBy?: Record<string, 'ASC' | 'DESC'>;
      populate?: string[];
    },
  ): Promise<PaginatedResult<unknown>> {
    const {
      page,
      limit,
      skip,
    } = this.normalizePageLimit(
      params.page ?? 1,
      params.limit ?? options?.defaultLimit ?? 10,
      options?.maxLimit ?? 100,
    );

    const where = this.buildWhere(params);
    const orderBy = options?.orderBy ?? { createdAt: 'DESC' as const };

    // Subclass should override or provide getEntityManager implementation
    const em = this.getEntityManager() as {
      find: Function;
      count: Function;
    };

    const [entities, total] = await Promise.all([
      em.find(this.getEntityName(), where, {
        orderBy,
        offset: skip,
        limit,
        populate: options?.populate ?? [],
      }),
      em.count(this.getEntityName(), where),
    ]);

    return {
      data: entities.map((entity: TEntity) => this.mapToDto(entity)),
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get entity name - must be overridden
   */
  protected abstract getEntityName(): string;

  /**
   * Normalize pagination parameters
   */
  protected normalizePageLimit(
    page: number,
    limit: number,
    maxLimit = 100,
  ): { page: number; limit: number; skip: number } {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.min(maxLimit, Math.max(1, Number(limit) || 10));
    const skip = (normalizedPage - 1) * normalizedLimit;
    return { page: normalizedPage, limit: normalizedLimit, skip };
  }

  /**
   * Build pagination metadata
   */
  protected buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): { page: number; limit: number; total: number; totalPages: number } {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Build search filter from params
   */
  protected buildSearchFilter(
    search: string | undefined,
    fields: string[],
  ): Record<string, unknown> | undefined {
    if (!search?.trim()) return undefined;

    const searchValue = `%${search.trim()}%`;
    const orConditions = fields.map((field) => ({
      [field]: { $like: searchValue },
    }));

    return { $or: orConditions };
  }

  /**
   * Build status filter (active/deleted)
   */
  protected buildStatusFilter(
    status: 'active' | 'deleted' | 'all' | undefined,
  ): Record<string, unknown> {
    if (status === 'deleted') {
      return { deletedAt: { $ne: null } };
    }
    if (status === 'active' || status === undefined) {
      return { deletedAt: null };
    }
    return {};
  }
}
