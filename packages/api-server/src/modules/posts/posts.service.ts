/**
 * Posts Service.
 *
 * Module quản lý bài viết (post). Bám sát pattern của
 * `apps/main/api/src/posts/posts.service.ts` nhưng generic - dùng
 * `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * @example
 * ```typescript
 * // Trong app:
 * class PostsService extends BaseCrudService<PostRowDto, PostCreateData, PostUpdateData> {
 *   protected getEntity() { return Post; }
 *   protected getEntityName() { return 'Post'; }
 *   protected getSearchFields() { return ['title', 'slug', 'excerpt']; }
 *   protected getFilterableFields() { return ['published', 'isActive']; }
 * }
 * ```
 */
import { Injectable, Logger } from '@nestjs/common';
import type { EntityManager } from '@mikro-orm/core';
import { BaseCrudService } from '../../bases';
import type {
  CrudCreateData,
  CrudUpdateData,
  ListCrudParams,
  PaginatedResult,
  CrudRowDto,
} from '../../types';

/**
 * Post row DTO trả về cho client.
 */
export interface PostRowDto extends CrudRowDto {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  content: unknown;
  published: boolean;
  publishedAt: string | null;
  authorId: number | string;
  categoryIds: Array<number | string>;
  tagIds: Array<number | string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Post create DTO.
 */
export interface PostCreateData extends CrudCreateData {
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  content?: unknown;
  published?: boolean;
  authorId: number | string;
  categoryIds?: Array<number | string>;
  tagIds?: Array<number | string>;
  isActive?: boolean;
}

/**
 * Post update DTO.
 */
export interface PostUpdateData extends CrudUpdateData {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  image?: string | null;
  content?: unknown;
  published?: boolean;
  publishedAt?: string | null;
  authorId?: number | string;
  categoryIds?: Array<number | string>;
  tagIds?: Array<number | string>;
  isActive?: boolean;
}

/**
 * Abstract Posts Service.
 *
 * Subclass override các abstract methods để integrate với app-specific
 * entity class. Tất cả CRUD operations (list, getById, create, update,
 * softDelete, restore, hardDelete, bulk) đã có sẵn.
 */
@Injectable()
export abstract class BasePostsService extends BaseCrudService<
  PostRowDto,
  PostCreateData,
  PostUpdateData
> {
  protected readonly logger = new Logger(BasePostsService.name);

  /** Trả về `Post` entity class. */
  protected abstract getEntity(): new () => Record<string, unknown>;
  /** Tên entity. */
  protected getEntityName(): string {
    return 'Post';
  }
  /** Field cho phép search LIKE. */
  protected getSearchFields(): string[] {
    return ['title', 'slug', 'excerpt'];
  }
  /** Field cho phép exact filter. */
  protected getFilterableFields(): string[] {
    return ['published', 'isActive', 'authorId'];
  }
  /** Soft delete field. */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  /**
   * Hook trước khi persist create. Set `publishedAt` nếu `published = true`.
   */
  protected async beforeCreate(
    data: PostCreateData,
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = { ...data };
    if (data.published && !('publishedAt' in result)) {
      result.publishedAt = new Date();
    }
    return result;
  }
}

/**
 * Re-export generic CRUD service cho Post.
 */
export type IPostsService = BasePostsService;

/**
 * Public API type cho PostsService.
 */
export interface PostsServiceContract {
  list(params: ListCrudParams): Promise<PaginatedResult<PostRowDto>>;
  getById(id: string): Promise<PostRowDto | null>;
  create(data: PostCreateData): Promise<PostRowDto>;
  update(id: string, data: PostUpdateData): Promise<PostRowDto | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  bulk(
    action: 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive',
    ids: string[],
  ): Promise<import('../../types').BulkOperationResult>;
  em: EntityManager;
}
