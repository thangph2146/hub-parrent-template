/**
 * Categories Service — domain logic (materialize → apps/main/api module-bases).
 */
import { Injectable, Logger } from '@nestjs/common';
import { Reference, type EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  normalizePageLimit,
  paginationMeta,
  safeIsoString,
  safeIsoStringNow,
  toEntityId,
  toEntityIdList,
} from '../../common';

export interface CategoryRowDto {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName?: string | null;
  parentIcon?: string | null;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: { children: number };
  postCount?: number;
  children?: ChildCategoryDto[];
  posts?: RelatedPostDto[];
}

export interface ChildCategoryDto {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  _count: { children: number };
  postCount: number;
}

export interface RelatedPostDto {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface ListCategoriesParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  type?: 'post' | 'event';
  filters?: Record<string, string>;
}

export interface ListCategoriesResult {
  data: CategoryRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryCreateData {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  parentId?: string | null;
  type?: 'post' | 'event';
}

export interface CategoryUpdateData {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  parentId?: string | null;
  type?: 'post' | 'event';
}

export interface CategoryUsageRow {
  slug: string;
  productCount: number;
}

type CategoryRecord = Record<string, unknown> & {
  parent?: CategoryRecord | Reference<CategoryRecord> | null;
  children?: CategoryRecord[];
  childrenCount?: number;
};

function resolveCategoryParentId(r: CategoryRecord): number | null {
  const parent = r.parent;
  if (parent == null || parent === undefined) return null;
  if (Reference.isReference(parent)) {
    const pk = Reference.unwrapReference(parent)?.id ?? (parent as { id?: unknown }).id;
    return typeof pk === 'number' && pk > 0 ? pk : null;
  }
  const parentRec = parent as CategoryRecord;
  return typeof parentRec.id === 'number' ? parentRec.id : null;
}

function mapRow(r: CategoryRecord): CategoryRowDto {
  const parent = Reference.isReference(r.parent)
    ? null
    : (r.parent as CategoryRecord | null | undefined);
  return {
    id: r.id as number,
    name: String(r.name ?? ''),
    slug: String(r.slug ?? ''),
    parentId: resolveCategoryParentId(r),
    parentName: parent?.name != null ? String(parent.name) : null,
    parentIcon: parent?.icon != null ? String(parent.icon) : null,
    description: (r.description as string | null | undefined) ?? null,
    icon: (r.icon as string | null | undefined) ?? null,
    sortOrder: Number(r.sortOrder ?? 0),
    type: String(r.type ?? 'post'),
    createdAt: safeIsoStringNow(r.createdAt as Date | string | null | undefined),
    updatedAt: safeIsoStringNow(r.updatedAt as Date | string | null | undefined),
    deletedAt: safeIsoString(r.deletedAt as Date | string | null | undefined),
    _count: { children: Number(r.childrenCount ?? 0) },
    postCount: 0,
  };
}

function buildWhere(params: ListCategoriesParams): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  const status = params.status ?? 'active';

  if (status === 'deleted') {
    where.deletedAt = { $ne: null };
  } else if (status === 'active') {
    where.deletedAt = null;
  }

  if (params.type) {
    where.type = params.type;
  }

  if (params.search?.trim()) {
    const q = `%${params.search.trim()}%`;
    where.$or = [
      { name: { $like: q } },
      { slug: { $like: q } },
      { description: { $like: q } },
    ];
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (!value?.trim()) continue;
      const trimmed = value.trim();

      if (key === 'name') {
        where.name = { $like: `%${trimmed}%` };
      } else if (key === 'slug') {
        where.slug = { $like: `%${trimmed}%` };
      } else if (key === 'description') {
        where.description = { $like: `%${trimmed}%` };
      } else if (
        key === 'type' &&
        (trimmed === 'post' || trimmed === 'event')
      ) {
        where.type = trimmed;
      } else if (
        key === 'updatedAt' ||
        key === 'deletedAt' ||
        key === 'createdAt'
      ) {
        const dates = trimmed.split(',').filter(Boolean);
        if (dates.length === 1) {
          where[key] = { $gte: new Date(dates[0]) };
        } else if (dates.length >= 2) {
          where[key] = {
            $gte: new Date(dates[0]),
            $lte: new Date(dates[1]),
          };
        }
      } else if (key === 'parentId') {
        const ids = trimmed.includes(',')
          ? trimmed
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : [trimmed];
        where.parent =
          ids.length > 1 ? { id: { $in: toEntityIdList(ids) } } : ids[0];
      }
    }
  }

  return where;
}

@Injectable()
export abstract class BaseCategoriesService {
  protected readonly logger = new Logger(BaseCategoriesService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected abstract getPostCategoryEntity(): new () => Record<string, unknown>;

  private async collectCategoryDescendantIds(
    rootId: string | number,
  ): Promise<number[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const start = toEntityId(rootId);
    const visited = new Set<number>([start]);
    let frontier = [start];
    let safety = 0;

    while (frontier.length > 0 && safety < 50 && visited.size < 10000) {
      safety += 1;

      const children = await em.find(
        Entity,
        {
          parent: { id: { $in: frontier } },
          deletedAt: null,
        },
        { fields: ['id'] },
      );

      const next: number[] = [];
      for (const child of children) {
        const id = (child as CategoryRecord).id as number;
        if (!visited.has(id)) {
          visited.add(id);
          next.push(id);
        }
      }
      frontier = next;
    }

    return Array.from(visited);
  }

  private async countPostsByCategoryTree(
    categoryId: string | number,
  ): Promise<number> {
    const em = this.getEm();
    const PostCategory = this.getPostCategoryEntity();
    const root = toEntityId(categoryId);
    const ids = await this.collectCategoryDescendantIds(root);
    const categoryIds = ids.length > 0 ? ids : [root];

    return em.count(PostCategory, {
      category: { id: { $in: categoryIds } },
      post: { deletedAt: null },
    });
  }

  private async batchCountPostsByCategoryTree(
    categoryIds: Array<string | number>,
  ): Promise<Map<number, number>> {
    const em = this.getEm();
    const Entity = this.getEntity();

    if (categoryIds.length === 0) return new Map();

    const allRootIds = [...new Set(categoryIds.map((id) => toEntityId(id)))];
    if (allRootIds.length === 0) return new Map();

    const rootSet = new Set(allRootIds);
    const rootToDescendants = new Map<number, Set<number>>();
    for (const rootId of allRootIds) {
      rootToDescendants.set(rootId, new Set([rootId]));
    }

    let frontier = allRootIds;
    const visited = new Set<number>(allRootIds);
    let safety = 0;

    while (frontier.length > 0 && safety < 50 && visited.size < 10000) {
      safety += 1;

      const children = await em.find(
        Entity,
        {
          parent: { id: { $in: frontier } },
          deletedAt: null,
        },
        { fields: ['id', 'parent'] },
      );

      const next: number[] = [];
      for (const child of children) {
        const row = child as CategoryRecord;
        const id = row.id as number;
        if (visited.has(id)) continue;
        visited.add(id);
        next.push(id);

        const p = Reference.isReference(row.parent)
          ? null
          : (row.parent as CategoryRecord | null | undefined);
        const parentId = p?.id as number | undefined;
        if (!parentId) continue;
        if (rootSet.has(parentId)) {
          rootToDescendants.get(parentId)!.add(id);
        } else {
          for (const [, descSet] of rootToDescendants) {
            if (descSet.has(parentId)) {
              descSet.add(id);
            }
          }
        }
      }
      frontier = next;
    }

    const allDescendantIds = [...visited];
    if (allDescendantIds.length === 0) return new Map();
    const conn = em.getConnection();
    const placeholders = allDescendantIds.map(() => '?').join(',');
    const countRows = (await conn.execute(
      `SELECT pc.categoryId AS id, COUNT(*) AS cnt
       FROM post_categories pc
       JOIN posts p ON p.id = pc.postId AND p.deletedAt IS NULL
       WHERE pc.categoryId IN (${placeholders})
       GROUP BY pc.categoryId`,
      allDescendantIds,
    )) as Array<{ id: number; cnt: number }>;
    const postCounts = new Map<number, number>(
      countRows.map((r) => [r.id, Number(r.cnt)]),
    );

    const result = new Map<number, number>();
    for (const rootId of allRootIds) {
      let total = 0;
      const descSet = rootToDescendants.get(rootId);
      if (!descSet) continue;
      for (const descId of descSet) {
        total += postCounts.get(descId) ?? 0;
      }
      result.set(rootId, total);
    }

    return result;
  }

  async list(params: ListCategoriesParams): Promise<ListCategoriesResult> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      1000,
    );
    const where = buildWhere(params) as FilterQuery<Record<string, unknown>>;
    const status = params.status ?? 'active';
    const shouldResolveTreePostCount = status === 'active';

    const [rows, total] = await Promise.all([
      em.find(Entity, where, {
        populate: shouldResolveTreePostCount
          ? (['parent', 'children'] as never)
          : (['parent'] as never),
        orderBy: { sortOrder: 'ASC', name: 'ASC' },
        offset: skip,
        limit,
      }),
      em.count(Entity, where),
    ]);

    const counts = shouldResolveTreePostCount
      ? await this.batchCountPostsByCategoryTree(
          rows.map((row) => (row as CategoryRecord).id as number),
        )
      : new Map<number, number>();

    const data = rows.map((row) => {
      const dto = mapRow(row as CategoryRecord);
      dto.postCount = counts.get((row as CategoryRecord).id as number) ?? 0;
      return dto;
    });

    return {
      data,
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const where: Record<string, unknown> = { deletedAt: null };
    if (search?.trim()) {
      const q = search.trim();
      if (column === 'name') where.name = { $like: `%${q}%` };
      else if (column === 'slug') where.slug = { $like: `%${q}%` };
      else if (column === 'parentId') where.parent = toEntityId(q);
      else where.name = { $like: `%${q}%` };
    }
    const rows = await em.find(Entity, where as FilterQuery<Record<string, unknown>>, {
      fields: [column] as never,
      orderBy: { [column]: 'ASC' } as never,
      limit,
    });
    const seen = new Set<string>();
    return rows
      .map((r) => {
        const val = (r as Record<string, unknown>)[column];
        return typeof val === 'string' || typeof val === 'number'
          ? String(val)
          : null;
      })
      .filter(
        (v): v is string => v !== null && !seen.has(v) && (seen.add(v), true),
      )
      .map((value) => ({ label: value, value }));
  }

  async getById(id: string): Promise<CategoryRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const PostCategory = this.getPostCategoryEntity();
    const row = await em.findOne(
      Entity,
      { id: toEntityId(id) },
      { populate: ['parent'] as never },
    );

    if (!row) return null;

    const categoryRow = row as CategoryRecord;
    const categoryId = categoryRow.id as number;

    const [childrenCount, postCount, childrenRows, postPivotRows] =
      await Promise.all([
        em.count(Entity, { parent: categoryId, deletedAt: null }),
        this.countPostsByCategoryTree(categoryId),
        em.find(
          Entity,
          { parent: categoryId, deletedAt: null },
          { populate: ['children'] as never },
        ),
        em.find(
          PostCategory,
          { category: categoryId },
          {
            populate: ['post'] as never,
            limit: 10,
            orderBy: { post: { createdAt: 'DESC' } } as never,
          },
        ),
      ]);

    const childPostCounts = await this.batchCountPostsByCategoryTree(
      childrenRows.map((c) => (c as CategoryRecord).id as number),
    );

    const children = childrenRows.map((child) => {
      const c = child as CategoryRecord;
      const childChildren = (c.children ?? []) as CategoryRecord[];
      return {
        id: c.id as number,
        name: String(c.name ?? ''),
        slug: String(c.slug ?? ''),
        icon: (c.icon as string | null | undefined) ?? null,
        sortOrder: Number(c.sortOrder ?? 0),
        _count: { children: childChildren.length },
        postCount: childPostCounts.get(c.id as number) ?? 0,
      };
    });

    const posts = postPivotRows.map((pc) => {
      const pivot = pc as Record<string, unknown>;
      const p = pivot.post as Record<string, unknown>;
      return {
        id: p.id as number,
        title: String(p.title ?? ''),
        slug: String(p.slug ?? ''),
        published: Boolean(p.published),
        publishedAt: safeIsoString(p.publishedAt as Date | string | null | undefined),
        createdAt: safeIsoStringNow(p.createdAt as Date | string | null | undefined),
      };
    });

    const dto = mapRow(categoryRow);
    dto._count = { children: childrenCount };
    dto.postCount = postCount;
    dto.children = children;
    dto.posts = posts;
    return dto;
  }

  async create(data: CategoryCreateData): Promise<CategoryRowDto> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const entity = new Entity() as CategoryRecord;
    entity.name = data.name;
    entity.slug = data.slug;
    entity.description = data.description ?? null;
    entity.icon = data.icon ?? null;
    entity.sortOrder = Number.isFinite(data.sortOrder) ? data.sortOrder! : 0;
    entity.type = data.type ?? 'post';
    entity.parent = data.parentId
      ? em.getReference(Entity, toEntityId(data.parentId))
      : null;
    em.persist(entity);
    await em.flush();

    const refetched = await this.getById(String(entity.id));
    if (!refetched) {
      throw new Error(`Failed to refetch category ${String(entity.id)}`);
    }

    return refetched;
  }

  async update(
    id: string,
    data: CategoryUpdateData,
  ): Promise<CategoryRowDto | null> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const existing = await em.findOne(Entity, { id: toEntityId(id) });
    if (!existing) return null;

    const row = existing as CategoryRecord;
    if (data.name != null) row.name = data.name;
    if (data.slug != null) row.slug = data.slug;
    if (data.description !== undefined) row.description = data.description ?? null;
    if (data.icon !== undefined) row.icon = data.icon ?? null;
    if (data.sortOrder !== undefined) {
      row.sortOrder = Number.isFinite(data.sortOrder) ? data.sortOrder : 0;
    }
    if (data.type !== undefined) row.type = data.type;
    if (data.parentId !== undefined) {
      row.parent = data.parentId
        ? em.getReference(Entity, toEntityId(data.parentId))
        : null;
    }

    em.persist(existing);
    await em.flush();

    return this.getById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const row = await em.findOne(Entity, { id: toEntityId(id) });
    if (!row) return false;
    const record = row as CategoryRecord;
    if (record.deletedAt) return false;

    record.deletedAt = new Date();
    em.persist(row);
    await em.flush();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const row = await em.findOne(Entity, { id: toEntityId(id) });
    if (!row) return false;
    const record = row as CategoryRecord;
    if (!record.deletedAt) return false;

    record.deletedAt = null;
    em.persist(row);
    await em.flush();
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const row = await em.findOne(Entity, { id: toEntityId(id) });
    if (!row) return false;

    em.remove(row);
    await em.flush();
    return true;
  }

  async bulk(
    action: 'delete' | 'restore' | 'hard-delete' | 'set-parent',
    ids: string[],
    parentId?: string | null,
  ): Promise<{ affected: number; message: string }> {
    const em = this.getEm();
    const Entity = this.getEntity();
    if (!ids.length) return { affected: 0, message: 'Không có bản ghi nào' };

    if (action === 'delete') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null },
        { deletedAt: new Date() },
      );
      return {
        affected: result ?? 0,
        message: `Đã xóa ${result ?? 0} danh mục`,
      };
    }

    if (action === 'restore') {
      const result = await em.nativeUpdate(
        Entity,
        { id: { $in: toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} danh mục`,
      };
    }

    if (action === 'hard-delete') {
      const entities = await em.find(Entity, {
        id: { $in: toEntityIdList(ids) },
      });
      for (const e of entities) {
        em.remove(e);
      }
      await em.flush();
      return {
        affected: entities.length,
        message: `Đã xóa vĩnh viễn ${entities.length} danh mục`,
      };
    }

    const uniqueIds = [...new Set(toEntityIdList(ids))];

    if (!uniqueIds.length) {
      return {
        affected: 0,
        message: 'Không có danh mục hợp lệ để cập nhật',
      };
    }

    const normalizedParentId =
      parentId == null || String(parentId).trim() === ''
        ? null
        : toEntityId(parentId);

    if (normalizedParentId && uniqueIds.includes(normalizedParentId)) {
      return {
        affected: 0,
        message: 'Danh mục cha không được nằm trong danh sách đang chọn',
      };
    }

    if (normalizedParentId) {
      const parent = await em.findOne(
        Entity,
        { id: normalizedParentId, deletedAt: null },
        { fields: ['id'] },
      );

      if (!parent) {
        return {
          affected: 0,
          message: 'Danh mục cha không tồn tại hoặc đã bị xóa',
        };
      }

      for (const categoryId of uniqueIds) {
        const descendants = await this.collectCategoryDescendantIds(categoryId);
        if (descendants.includes(normalizedParentId)) {
          return {
            affected: 0,
            message:
              'Không thể đổi danh mục cha vì sẽ tạo vòng lặp cây danh mục',
          };
        }
      }
    }

    const result = await em.nativeUpdate(
      Entity,
      { id: { $in: uniqueIds }, deletedAt: null },
      {
        parent: normalizedParentId
          ? em.getReference(Entity, normalizedParentId)
          : null,
      },
    );

    return {
      affected: result ?? 0,
      message:
        normalizedParentId == null
          ? `Đã chuyển ${result ?? 0} danh mục về cấp gốc`
          : `Đã cập nhật danh mục cha cho ${result ?? 0} danh mục`,
    };
  }

  async getUsage(): Promise<CategoryUsageRow[]> {
    const em = this.getEm();
    const Entity = this.getEntity();
    const rows = await em.find(Entity, {
      deletedAt: null,
    } as FilterQuery<Record<string, unknown>>);

    return rows
      .map((row) => ({
        slug: String((row as Record<string, unknown>).slug ?? '').trim(),
        productCount: Number(
          (row as Record<string, unknown>).productCount ??
            ((row as Record<string, unknown>)._count as Record<string, unknown> | undefined)?.posts ??
            0,
        ),
      }))
      .filter((row) => row.slug.length > 0);
  }
}
