import { toEntityId, toEntityIdList } from '../common/entity-id';
/**
 * Categories Admin API Service.
 * List, options, getById, create, update, softDelete, restore, hardDelete, bulk.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager, Reference, type FilterQuery } from '@mikro-orm/core';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { Category } from '../entities/category.entity';
import { PostCategory } from '../entities/post-category.entity';

type CategoryWithParent = Category & {
  parent?: Category | null;
  childrenCount?: number;
};

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

function toIsoString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
}

function resolveCategoryParentId(r: Category): number | null {
  const parent = r.parent;
  if (parent == null || parent === undefined) return null;
  if (Reference.isReference(parent)) {
    const pk = parent.id;
    return typeof pk === 'number' && pk > 0 ? pk : null;
  }
  return parent.id ?? null;
}

function mapRow(r: CategoryWithParent): CategoryRowDto {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: resolveCategoryParentId(r),
    parentName: r.parent?.name ?? null,
    parentIcon: r.parent?.icon ?? null,
    description: r.description ?? null,
    icon: r.icon ?? null,
    sortOrder: r.sortOrder ?? 0,
    type: r.type,
    createdAt: toIsoString(r.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIsoString(r.updatedAt) ?? new Date(0).toISOString(),
    deletedAt: toIsoString(r.deletedAt),
    _count: { children: r.childrenCount ?? 0 },
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
        where.parent = ids.length > 1 ? { id: { $in: toEntityIdList(ids) } } : ids[0];
      }
    }
  }

  return where;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly em: EntityManager) {}

  private async collectCategoryDescendantIds(
    rootId: string | number,
  ): Promise<number[]> {
    const start = toEntityId(rootId);
    const visited = new Set<number>([start]);
    let frontier = [start];
    let safety = 0;

    while (frontier.length > 0 && safety < 50 && visited.size < 10000) {
      safety += 1;

      const children = await this.em.find(
        Category,
        {
          parent: { id: { $in: frontier } },
          deletedAt: null,
        },
        { fields: ['id'] },
      );

      const next: number[] = [];
      for (const child of children) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          next.push(child.id);
        }
      }
      frontier = next;
    }

    return Array.from(visited);
  }

  private async countPostsByCategoryTree(
    categoryId: string | number,
  ): Promise<number> {
    const root = toEntityId(categoryId);
    const ids = await this.collectCategoryDescendantIds(root);
    const categoryIds = ids.length > 0 ? ids : [root];

    return this.em.count(PostCategory, {
      category: { id: { $in: categoryIds } },
      post: { deletedAt: null },
    });
  }

  private async batchCountPostsByCategoryTree(
    categoryIds: Array<string | number>,
  ): Promise<Map<number, number>> {
    if (categoryIds.length === 0) return new Map();

    const allRootIds = [
      ...new Set(categoryIds.map((id) => toEntityId(id))),
    ];
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

      const children = await this.em.find(
        Category,
        {
          parent: { id: { $in: frontier } },
          deletedAt: null,
        },
        { fields: ['id', 'parent'] },
      );

      const next: number[] = [];
      for (const child of children) {
        if (visited.has(child.id)) continue;
        visited.add(child.id);
        next.push(child.id);

        const p = child.parent as Category | null;
        const parentId = p?.id;
        if (!parentId) continue;
        if (rootSet.has(parentId)) {
          rootToDescendants.get(parentId)!.add(child.id);
        } else {
          for (const [, descSet] of rootToDescendants) {
            if (descSet.has(parentId)) {
              descSet.add(child.id);
            }
          }
        }
      }
      frontier = next;
    }

    const allDescendantIds = [...visited];
    if (allDescendantIds.length === 0) return new Map();
    const conn = this.em.getConnection();
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
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      1000,
    );
    const where = buildWhere(params) as FilterQuery<Category>;
    const status = params.status ?? 'active';
    const shouldResolveTreePostCount = status === 'active';

    const [rows, total] = await Promise.all([
      this.em.find(Category, where, {
        populate: shouldResolveTreePostCount
          ? ['parent', 'children']
          : ['parent'],
        orderBy: { sortOrder: 'ASC', name: 'ASC' },
        offset: skip,
        limit,
      }),
      this.em.count(Category, where),
    ]);

    const counts = shouldResolveTreePostCount
      ? await this.batchCountPostsByCategoryTree(rows.map((row) => row.id))
      : new Map<number, number>();

    const data = rows.map((row) => {
      const dto = mapRow(row as CategoryWithParent);
      dto.postCount = counts.get(row.id) ?? 0;
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
    const where: Record<string, unknown> = { deletedAt: null };
    if (search?.trim()) {
      const q = search.trim();
      if (column === 'name') where.name = { $like: `%${q}%` };
      else if (column === 'slug') where.slug = { $like: `%${q}%` };
      else if (column === 'parentId') where.parent = toEntityId(q);
      else where.name = { $like: `%${q}%` };
    }
    const rows = await this.em.find(Category, where as FilterQuery<Category>, {
      fields: [column as any],
      orderBy: { [column]: 'ASC' },
      limit,
    });
    const seen = new Set<string>();
    return rows
      .map((r) => {
        const val = r[column as keyof Category];
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
    const row = await this.em.findOne(
      Category,
      { id: toEntityId(id) },
      { populate: ['parent'] },
    );

    if (!row) return null;

    const [childrenCount, postCount, childrenRows, postPivotRows] =
      await Promise.all([
        this.em.count(Category, { parent: row.id, deletedAt: null }),
        this.countPostsByCategoryTree(row.id),
        this.em.find(
          Category,
          { parent: row.id, deletedAt: null },
          { populate: ['children'] },
        ),
        this.em.find(
          PostCategory,
          { category: row.id },
          {
            populate: ['post'],
            limit: 10,
            orderBy: { post: { createdAt: 'DESC' } },
          },
        ),
      ]);

    const childPostCounts = await this.batchCountPostsByCategoryTree(
      childrenRows.map((c) => c.id),
    );

    const children = childrenRows.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      icon: child.icon ?? null,
      sortOrder: child.sortOrder ?? 0,
      _count: { children: child.children.length },
      postCount: childPostCounts.get(child.id) ?? 0,
    }));

    const posts = postPivotRows.map((pc) => {
      const p = pc.post;
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        published: p.published,
        publishedAt: toIsoString(p.publishedAt),
        createdAt: toIsoString(p.createdAt) ?? '',
      };
    });

    const dto = mapRow(row as CategoryWithParent);
    dto._count = { children: childrenCount };
    dto.postCount = postCount;
    dto.children = children;
    dto.posts = posts;
    return dto;
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    sortOrder?: number;
    parentId?: string | null;
    type?: 'post' | 'event';
  }): Promise<CategoryRowDto> {
    const entity = new Category();
    entity.name = data.name;
    entity.slug = data.slug;
    entity.description = data.description ?? null;
    entity.icon = data.icon ?? null;
    entity.sortOrder = Number.isFinite(data.sortOrder) ? data.sortOrder! : 0;
    entity.type = data.type ?? 'post';
    entity.parent = data.parentId
      ? this.em.getReference(Category, toEntityId(data.parentId))
      : null;
    this.em.persist(entity);
    await this.em.flush();

    const refetched = await this.getById(String(entity.id));
    if (!refetched) {
      throw new Error(`Failed to refetch category ${entity.id}`);
    }

    return refetched;
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      icon?: string | null;
      sortOrder?: number;
      parentId?: string | null;
      type?: 'post' | 'event';
    },
  ): Promise<CategoryRowDto | null> {
    const existing = await this.em.findOne(Category, { id: toEntityId(id) });
    if (!existing) return null;

    if (data.name != null) existing.name = data.name;
    if (data.slug != null) existing.slug = data.slug;
    if (data.description !== undefined)
      existing.description = data.description ?? null;
    if (data.icon !== undefined) existing.icon = data.icon ?? null;
    if (data.sortOrder !== undefined)
      existing.sortOrder = Number.isFinite(data.sortOrder) ? data.sortOrder : 0;
    if (data.type !== undefined) existing.type = data.type;
    if (data.parentId !== undefined) {
      existing.parent = data.parentId
        ? this.em.getReference(Category, toEntityId(data.parentId))
        : null;
    }

    this.em.persist(existing);
    await this.em.flush();

    return this.getById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const row = await this.em.findOne(Category, { id: toEntityId(id) });
    if (!row || row.deletedAt) return false;

    row.deletedAt = new Date();
    this.em.persist(row);
    await this.em.flush();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const row = await this.em.findOne(Category, { id: toEntityId(id) });
    if (!row || !row.deletedAt) return false;

    row.deletedAt = null;
    this.em.persist(row);
    await this.em.flush();
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const row = await this.em.findOne(Category, { id: toEntityId(id) });
    if (!row) return false;

    this.em.remove(row);
    await this.em.flush();
    return true;
  }

  async bulk(
    action: 'delete' | 'restore' | 'hard-delete' | 'set-parent',
    ids: string[],
    parentId?: string | null,
  ): Promise<{ affected: number; message: string }> {
    if (!ids.length) return { affected: 0, message: 'Không có bản ghi nào' };

    if (action === 'delete') {
      const result = await this.em.nativeUpdate(
        Category,
        { id: { $in: toEntityIdList(ids) }, deletedAt: null },
        { deletedAt: new Date() },
      );
      return {
        affected: result ?? 0,
        message: `Đã xóa ${result ?? 0} danh mục`,
      };
    }

    if (action === 'restore') {
      const result = await this.em.nativeUpdate(
        Category,
        { id: { $in: toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} danh mục`,
      };
    }

    if (action === 'hard-delete') {
      const entities = await this.em.find(Category, { id: { $in: toEntityIdList(ids) } });
      for (const e of entities) {
        this.em.remove(e);
      }
      await this.em.flush();
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
      const parent = await this.em.findOne(
        Category,
        { id: toEntityId(normalizedParentId), deletedAt: null },
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

    const result = await this.em.nativeUpdate(
      Category,
      { id: { $in: uniqueIds }, deletedAt: null },
      {
        parent: normalizedParentId
          ? this.em.getReference(Category, toEntityId(normalizedParentId))
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
}
