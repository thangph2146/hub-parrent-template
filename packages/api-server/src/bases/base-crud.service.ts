/**
 * Base CRUD Service.
 *
 * Abstract service cung cấp CRUD operations generic cho MỌI entity trong
 * dự án. Các module con (users, posts, comments, categories, settings, ...)
 * chỉ cần extend class này, override các `getXxxEntity()` factory methods,
 * và có ngay đầy đủ: list (pagination + search + filter), getById, create,
 * update, softDelete, restore, hardDelete, bulk actions.
 *
 * Thiết kế này bám sát pattern của `apps/main/api/src/<entity>/<entity>.service.ts`
 * nhưng ở dạng generic, có thể áp dụng cho bất kỳ entity nào mà không cần
 * viết lại logic CRUD. Tất cả helper (pagination, bulk, column filter, ...)
 * đều dùng common utilities từ `../common/*` để đảm bảo nhất quán với pattern
 * chuẩn của `apps/main/api/src/`.
 *
 * @example
 * ```typescript
 * // Trong app:
 * class PostsService extends BaseCrudService<Post> {
 *   protected getEntity(): new () => Post { return Post; }
 *   protected getEntityName(): string { return 'Post'; }
 *   protected getSearchFields(): string[] { return ['title', 'slug', 'excerpt']; }
 * }
 * ```
 */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  PaginatedResult,
  ListCrudParams,
  BulkOperationResult,
  CrudRowDto,
  CrudFieldDescriptor,
} from '../types';
import {
  normalizePageLimit,
  paginationMeta,
  toEntityId,
  toEntityIdList,
  toIso,
  toIsoNow,
  applyBulkAction,
  buildStandardAdminWhere,
  isBulkAction,
  type AdminColumnFiltersConfig,
  type BulkAction,
} from '../common';

/**
 * Default page/limit constants (override được trong subclass nếu cần).
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 1000;

/**
 * Status filter cho soft-delete entities.
 */
export type CrudStatus = 'active' | 'deleted' | 'all';

/**
 * WHERE clause builder type (MikroORM FilterQuery).
 */
type WhereClause = Record<string, unknown>;

/**
 * Abstract CRUD service - extend cho mỗi entity.
 *
 * @typeParam TRow - Row DTO trả về cho client.
 * @typeParam TCreate - DTO dùng cho create.
 * @typeParam TUpdate - DTO dùng cho update.
 */
@Injectable()
export abstract class BaseCrudService<
  TRow extends CrudRowDto = CrudRowDto,
  TCreate extends Record<string, unknown> = Record<string, unknown>,
  TUpdate extends Record<string, unknown> = Record<string, unknown>,
> {
  protected readonly logger: Logger;

  constructor(loggerContext?: string) {
    this.logger = new Logger(loggerContext ?? this.constructor.name);
  }

  // ────────────────────────────────────────────────────────────
  // Abstract factory methods - subclass BẮT BUỘC override
  // ────────────────────────────────────────────────────────────

  /**
   * Trả về EntityManager. Override trong subclass (vd inject `EntityManager` từ Nest).
   */
  protected abstract getEm(): EntityManager;

  /**
   * Trả về class constructor của entity (vd `User`, `Post`, ...).
   */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /**
   * Tên entity (PascalCase) dùng cho logging.
   */
  protected abstract getEntityName(): string;

  /**
   * Tên trường primary key (mặc định: `id`).
   */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /**
   * Tên trường soft-delete (mặc định: `deletedAt`).
   * Trả về `null` nếu entity không hỗ trợ soft-delete.
   */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  /**
   * Danh sách field cho phép search LIKE %term% (mặc định: []).
   */
  protected getSearchFields(): string[] {
    return [];
  }

  /**
   * Danh sách field cho phép exact-match filter (vd `isActive`, `published`).
   * Override nếu cần whitelist.
   */
  protected getFilterableFields(): string[] {
    return [];
  }

  /**
   * Admin column-filter config dùng cho `buildStandardAdminWhere()`.
   * Mặc định: empty (chỉ soft-delete filter).
   */
  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return {};
  }

  /**
   * Singular label tiếng Việt cho bulk actions, vd. "người dùng", "bài viết".
   */
  protected getBulkLabel(): string {
    return this.getEntityName().toLowerCase();
  }

  /**
   * Map một entity row sang DTO trả về cho client.
   * Mặc định: trải phẳng entity (cast sang DTO).
   */
  protected mapRow(entity: Record<string, unknown>): TRow {
    return { ...entity } as unknown as TRow;
  }

  /**
   * Validate input trước khi create. Throw `BadRequestException` nếu invalid.
   */
  protected validateCreate(_data: TCreate): void {
    // no-op by default
  }

  /**
   * Validate input trước khi update. Throw `BadRequestException` nếu invalid.
   */
  protected validateUpdate(_id: string | number, _data: TUpdate): void {
    // no-op by default
  }

  /**
   * Hook trước khi persist record mới. Dùng để set default values, hash password, ...
   * Trả về object sẽ được merge với data.
   */
  protected async beforeCreate(
    data: TCreate,
  ): Promise<Record<string, unknown>> {
    return data as Record<string, unknown>;
  }

  /**
   * Hook trước khi persist update.
   */
  protected async beforeUpdate(
    _id: string | number,
    data: TUpdate,
  ): Promise<Record<string, unknown>> {
    return data as Record<string, unknown>;
  }

  // ────────────────────────────────────────────────────────────
  // Public CRUD operations
  // ────────────────────────────────────────────────────────────

  /**
   * List entities với pagination, search, filter.
   */
  async list(params: ListCrudParams): Promise<PaginatedResult<TRow>> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const { page, limit, skip } = this.normalizePageLimit(params.page, params.limit);
    const where = this.buildWhere(params) as FilterQuery<Record<string, unknown>>;

    const [rows, total] = await Promise.all([
      em.find(Entity, where, {
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      em.count(Entity, where),
    ]);

    return {
      data: rows.map((row) => this.mapRow(row as Record<string, unknown>)),
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Lấy 1 record theo id.
   */
  async getById(id: string | number): Promise<TRow | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const found = await em.findOne(Entity, { [pk]: entityId } as WhereClause);
    if (!found) return null;
    return this.mapRow(found as Record<string, unknown>);
  }

  /**
   * Tạo mới record.
   */
  async create(data: TCreate): Promise<TRow> {
    this.validateCreate(data);
    const em = this.getEm();
    const Entity = this.getEntity();
    const before = await this.beforeCreate(data);
    const entity = new Entity() as Record<string, unknown>;
    Object.assign(entity, before);
    em.persist(entity);
    await em.flush();
    return this.mapRow(entity);
  }

  /**
   * Cập nhật record theo id.
   */
  async update(id: string | number, data: TUpdate): Promise<TRow | null> {
    this.validateUpdate(id, data);
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const found = await em.findOne(Entity, { [pk]: entityId } as WhereClause);
    if (!found) return null;
    const before = await this.beforeUpdate(id, data);
    Object.assign(found as Record<string, unknown>, before);
    await em.flush();
    return this.mapRow(found as Record<string, unknown>);
  }

  /**
   * Soft-delete record (set deletedAt = now()).
   * Trả về `false` nếu entity không có soft-delete field.
   */
  async softDelete(id: string | number): Promise<boolean> {
    const softField = this.getSoftDeleteField();
    if (!softField) return false;
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const affected = await em.nativeUpdate(
      Entity,
      { [pk]: entityId } as WhereClause,
      { [softField]: new Date() } as Record<string, unknown>,
    );
    return affected > 0;
  }

  /**
   * Restore soft-deleted record (set deletedAt = null).
   */
  async restore(id: string | number): Promise<boolean> {
    const softField = this.getSoftDeleteField();
    if (!softField) return false;
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const affected = await em.nativeUpdate(
      Entity,
      { [pk]: entityId } as WhereClause,
      { [softField]: null } as Record<string, unknown>,
    );
    return affected > 0;
  }

  /**
   * Xóa cứng record khỏi database.
   */
  async hardDelete(id: string | number): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const pk = this.getPrimaryKeyField();
    const entityId = this.toEntityId(id);
    const found = await em.findOne(Entity, { [pk]: entityId } as WhereClause);
    if (!found) return false;
    em.remove(found);
    await em.flush();
    return true;
  }

  /**
   * Bulk action trên nhiều records — dùng `applyBulkAction()` từ common.
   *
   * @param action - Loại action: `'delete'` (soft), `'restore'`, `'hard-delete'`, `'active'`, `'unactive'`.
   * @param ids - Danh sách id.
   */
  async bulk(
    action: BulkAction,
    ids: Array<string | number>,
  ): Promise<BulkOperationResult> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    if (!isBulkAction(action)) {
      throw new BadRequestException(`Invalid bulk action: ${action}`);
    }
    const result = await applyBulkAction(
      this.getEm(),
      this.getEntity() as never,
      action,
      ids,
      {
        label: this.getBulkLabel(),
        deletedAtField: this.getSoftDeleteField() ?? undefined,
      },
    );
    return {
      success: result.affected,
      failed: ids.length - result.affected,
      total: ids.length,
      errors: [],
      message: result.message,
    };
  }

  // ────────────────────────────────────────────────────────────
  // Protected helpers — dùng common utilities làm backend
  // ────────────────────────────────────────────────────────────

  /**
   * Build WHERE clause từ list params.
   *
   * Chiến lược 2 lớp:
   *   1. Column filters — `buildStandardAdminWhere()` từ common.
   *   2. Free-text search — OR LIKE các search fields (nếu có).
   *   3. Subclass có thể thêm logic riêng (override hook này).
   */
  protected buildWhere(params: ListCrudParams): WhereClause {
    const status: CrudStatus = params.status ?? 'active';
    // Normalize filter values: support both string | string[] → string
    const flatFilters: Record<string, string> = {};
    if (params.filters) {
      for (const [k, v] of Object.entries(params.filters)) {
        if (v == null) continue;
        if (Array.isArray(v)) {
          if (v.length > 0 && v[0] != null) flatFilters[k] = String(v[0]);
        } else {
          flatFilters[k] = String(v);
        }
      }
    }
    const where = buildStandardAdminWhere(
      flatFilters,
      this.getColumnFiltersConfig(),
      status,
      { softDeleteField: this.getSoftDeleteField() ?? 'deletedAt' },
    ) as WhereClause;

    const searchFields = this.getSearchFields();
    if (params.search && params.search.trim() && searchFields.length > 0) {
      const term = `%${params.search.trim()}%`;
      // Merge với $or (giữ soft-delete + filters)
      const existing = (where as Record<string, unknown>).$and;
      const orClause = searchFields.map((field) => ({ [field]: { $like: term } }));
      if (existing) {
        (where as Record<string, unknown>).$and = [...(existing as unknown[]), { $or: orClause }];
      } else {
        (where as Record<string, unknown>).$or = orClause;
      }
    }

    return where;
  }

  /**
   * Normalize page/limit input — dùng `normalizePageLimit()` từ common.
   */
  protected normalizePageLimit(
    page: number | string | undefined,
    limit: number | string | undefined,
    maxLimit: number = MAX_LIMIT,
  ): { page: number; limit: number; skip: number } {
    return normalizePageLimit(page ?? DEFAULT_PAGE, limit ?? DEFAULT_LIMIT, maxLimit, DEFAULT_LIMIT);
  }

  /**
   * Build pagination metadata — dùng `paginationMeta()` từ common.
   */
  protected buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): { page: number; limit: number; total: number; totalPages: number } {
    return paginationMeta(page, limit, total);
  }

  /**
   * Convert id — dùng `toEntityId()` từ common (luôn trả về number).
   */
  protected toEntityId(id: string | number | null | undefined): number {
    return toEntityId(id as string | number);
  }

  /**
   * Convert list of ids — dùng `toEntityIdList()` từ common.
   */
  protected toEntityIdList(ids: Array<string | number>): number[] {
    return toEntityIdList(ids);
  }

  /**
   * Convert Date/string → ISO string (null-safe) — dùng `toIso()` từ common.
   */
  protected safeIsoString(date: Date | string | null | undefined): string | null {
    return toIso(date);
  }

  /**
   * Convert Date/string → ISO string (fallback now() nếu null) — dùng `toIsoNow()` từ common.
   */
  protected safeIsoStringNow(date: Date | string | null | undefined): string {
    return toIsoNow(date);
  }
}

/**
 * Re-export CrudFieldDescriptor for downstream use.
 */
export type { CrudFieldDescriptor };
