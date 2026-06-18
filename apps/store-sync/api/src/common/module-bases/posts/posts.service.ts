/**
 * Posts admin service — logic dùng chung; app binding entity và filter config.
 * App binding: extend BasePostsService + wire entity classes.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  resolveRelationFilters,
  type RelationFiltersConfig,
} from '../../resolve-relation-filters';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../pagination';
import { getOptionsFromModel, type GetOptionsConfig } from '../../get-options';
import { safeIsoString, safeIsoStringNow } from '../../date-utils';
import { toEntityId, toEntityIdList } from '../../entity-id';
import {
  deletePostCategoryPivots,
  deletePostTagPivots,
  insertPostCategoryPivot,
  insertPostTagPivot,
} from '../../post-pivot-insert';

export interface PostRowDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  published: boolean;
  publishedAt: string | null;
  eventStartAt: string | null;
  eventEndAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: { id: number; name: string | null; email: string };
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
}

export interface PostDetailDto extends PostRowDto {
  content: unknown;
}

export const POSTS_FILTER_CATEGORIES_NONE = '__post_filter_no_category__';

export interface ListPostsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  filters?: Record<string, string>;
  categoriesNone?: boolean;
}

export interface ListPostsResult {
  data: PostRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type PostCategoryItem = { category: { id: number; name: string } };
type PostTagItem = { tag: { id: number; name: string } };
type PostWithRelations = Record<string, unknown> & {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  published: boolean;
  publishedAt?: Date | string | null;
  eventStartAt?: Date | string | null;
  eventEndAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string | null;
  content?: unknown;
  author: { id: number; name: string | null; email: string };
  categories?: PostCategoryItem[];
  tags?: PostTagItem[];
};

const POST_POPULATE = [
  'author',
  'categories',
  'categories.category',
  'tags',
  'tags.tag',
] as const;

function mapRow(p: PostWithRelations): PostRowDto {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? null,
    image: p.image ?? null,
    published: p.published,
    publishedAt: safeIsoString(p.publishedAt),
    eventStartAt: safeIsoString(p.eventStartAt),
    eventEndAt: safeIsoString(p.eventEndAt),
    createdAt: safeIsoStringNow(p.createdAt),
    updatedAt: safeIsoStringNow(p.updatedAt),
    deletedAt: safeIsoString(p.deletedAt),
    author: p.author
      ? {
          id: p.author.id,
          name: p.author.name ?? null,
          email: p.author.email ?? '',
        }
      : { id: 0, name: null, email: '' },
    categories:
      p.categories
        ?.map((pc) => {
          const cat = pc?.category;
          return cat ? { id: cat.id, name: cat.name } : null;
        })
        .filter((c): c is { id: number; name: string } => c !== null) ?? [],
    tags:
      p.tags
        ?.map((pt) => {
          const tag = pt?.tag;
          return tag ? { id: tag.id, name: tag.name } : null;
        })
        .filter((t): t is { id: number; name: string } => t !== null) ?? [],
  };
}

function buildWhere(
  params: ListPostsParams & { categoriesNone?: boolean },
): Record<string, unknown> {
  const baseWhere: Record<string, unknown> = {};
  const status = params.status ?? 'active';
  if (status === 'deleted') baseWhere.deletedAt = { $ne: null };
  else if (status === 'active') baseWhere.deletedAt = null;

  if (params.categoriesNone) {
    // Handled separately via in-memory filtering
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (!value?.trim()) continue;
      const v = value.trim();
      if (key === 'title') baseWhere.title = { $like: `%${v}%` };
      else if (key === 'slug') baseWhere.slug = { $like: `%${v}%` };
      else if (key === 'authorId') baseWhere.author = v;
      else if (key === 'published') {
        const vals = v.includes(',')
          ? v
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : [v];
        if (vals.length === 1) {
          baseWhere.published = vals[0] === 'true';
        } else {
          baseWhere.published = { $in: vals.map((x) => x === 'true') };
        }
      } else if (key === 'categories' || key === 'categoryId') {
        const ids = v.includes(',')
          ? v
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : [v];
        baseWhere.categories = {
          category: { id: ids.length > 1 ? { $in: ids } : ids[0] },
        };
      } else if (key === 'tags' || key === 'tagId') {
        baseWhere.tags = { tag: { id: v } };
      } else if (key === 'updatedAt') {
        const parts = v.includes(',')
          ? v
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : [v];
        if (parts.length === 1) {
          const date = new Date(parts[0]);
          if (!Number.isNaN(date.getTime())) {
            const start = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              0,
              0,
              0,
            );
            const end = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              23,
              59,
              59,
              999,
            );
            baseWhere.updatedAt = {
              $gte: start.toISOString(),
              $lte: end.toISOString(),
            };
          }
        } else if (parts.length >= 2) {
          const from = new Date(parts[0]);
          const to = new Date(parts[1]);
          if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
            const start = new Date(
              from.getFullYear(),
              from.getMonth(),
              from.getDate(),
              0,
              0,
              0,
            );
            const end = new Date(
              to.getFullYear(),
              to.getMonth(),
              to.getDate(),
              23,
              59,
              59,
              999,
            );
            baseWhere.updatedAt = {
              $gte: start.toISOString(),
              $lte: end.toISOString(),
            };
          }
        }
      }
    }
  }

  if (params.search?.trim()) {
    const q = { $like: `%${params.search.trim()}%` };
    return {
      $or: [
        { ...baseWhere, title: q },
        { ...baseWhere, slug: q },
        { ...baseWhere, excerpt: q },
      ],
    };
  }

  return baseWhere;
}

const POST_RELATION_FILTERS: RelationFiltersConfig = {
  categories: { model: 'category', nameField: 'name', softDelete: true },
  categoryId: { model: 'category', nameField: 'name', softDelete: true },
  tags: { model: 'tag', nameField: 'name', softDelete: false },
  tagId: { model: 'tag', nameField: 'name', softDelete: false },
};

const POST_OPTIONS_CONFIG: GetOptionsConfig = {
  slug: { valueField: 'slug', searchField: 'slug' },
  title: { valueField: 'title', searchField: 'title' },
  '*': { valueField: 'title', searchField: 'title' },
};

const EXCERPT_MAX_LENGTH = 191;

function truncateExcerpt(value: string | null | undefined): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (s === '') return null;
  return s.length <= EXCERPT_MAX_LENGTH ? s : s.slice(0, EXCERPT_MAX_LENGTH);
}

function parseNullableDate(
  value: string | null | undefined,
  fieldName: string,
): Date | null {
  if (value == null || value === '') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`Giá trị ${fieldName} không hợp lệ`);
  }
  return parsed;
}

@Injectable()
export abstract class BasePostsService {
  protected abstract getEm(): EntityManager;
  protected abstract getPostEntity(): new () => Record<string, unknown>;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getTagEntity(): new () => Record<string, unknown>;
  protected abstract getPostCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getPostTagEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;

  protected resolveRelationEntity(
    model: string,
  ): (new () => object) | undefined {
    if (model === 'category') return this.getCategoryEntity();
    if (model === 'tag') return this.getTagEntity();
    if (model === 'user') return this.getUserEntity();
    if (model === 'post') return this.getPostEntity();
    return undefined;
  }

  private async collectCategoryDescendantIds(
    rootId: string | number,
  ): Promise<number[]> {
    const start = toEntityId(rootId);
    const visited = new Set<number>([start]);
    let frontier = [start];
    let safety = 0;
    while (frontier.length > 0 && safety < 50 && visited.size < 10000) {
      safety += 1;
      const children = await this.getEm().find(
        this.getCategoryEntity(),
        { parent: { id: { $in: frontier } }, deletedAt: null },
        { fields: ['id'] },
      );
      const next = children.map((c) => c.id).filter((id) => !visited.has(id));
      if (next.length === 0) break;
      next.forEach((id) => visited.add(id));
      frontier = next;
    }
    return Array.from(visited);
  }

  private async validateCategoryIds(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const numericIds = toEntityIdList(ids);
    const found = await this.getEm().find(
      this.getCategoryEntity(),
      { id: { $in: numericIds }, deletedAt: null },
      { fields: ['id'] },
    );
    const foundIds = new Set(found.map((f) => f.id));
    const missing = numericIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Category ID không tồn tại: ${missing.join(', ')}`,
      );
    }
  }

  private async validateTagIds(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const numericIds = toEntityIdList(ids);
    const found = await this.getEm().find(
      this.getTagEntity(),
      { id: { $in: numericIds }, deletedAt: null },
      { fields: ['id'] },
    );
    const foundIds = new Set(found.map((f) => f.id));
    const missing = numericIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Tag ID không tồn tại: ${missing.join(', ')}`,
      );
    }
  }

  async list(params: ListPostsParams): Promise<ListPostsResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const rawFilters = params.filters ? { ...params.filters } : undefined;
    let categoriesNone = false;
    if (
      rawFilters?.categories?.trim() === POSTS_FILTER_CATEGORIES_NONE ||
      rawFilters?.categoryId?.trim() === POSTS_FILTER_CATEGORIES_NONE
    ) {
      categoriesNone = true;
      delete rawFilters.categories;
      delete rawFilters.categoryId;
    }
    const filters = await resolveRelationFilters(
      this.getEm(),
      rawFilters,
      POST_RELATION_FILTERS,
      (model) => this.resolveRelationEntity(model),
    );
    if (
      !categoriesNone &&
      (filters?.categories?.trim() || filters?.categoryId?.trim())
    ) {
      const key = filters.categories?.trim() ? 'categories' : 'categoryId';
      const rawValue = filters[key];
      const rootIds = rawValue.includes(',')
        ? rawValue
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        : [rawValue];
      const allIds: number[] = [];
      for (const rootId of rootIds) {
        const ids = await this.collectCategoryDescendantIds(rootId);
        allIds.push(...ids);
      }
      if (allIds.length > 0) {
        filters[key] = allIds.map(String).join(',');
      }
    }
    const where = params.categoriesNone
      ? {}
      : buildWhere({ ...params, filters });

    // Two-step query to avoid "Out of sort memory" from MySQL when
    // paginated ordering is combined with multi-table JOIN populates.
    const [idsOnly, total] = await Promise.all([
      this.getEm().find(this.getPostEntity(), where as FilterQuery<object>, {
        fields: ['id'],
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(this.getPostEntity(), where as FilterQuery<object>),
    ]);

    const ids = idsOnly.map((p) => p.id);
    const rows =
      ids.length > 0
        ? await this.getEm().find(this.getPostEntity(), ids, {
            populate: POST_POPULATE,
          })
        : [];

    // Preserve the sort order from the paginated ID query
    const idOrder = new Map<number, number>();
    for (let i = 0; i < ids.length; i++) idOrder.set(ids[i], i);
    rows.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

    let finalRows = rows;
    if (params.categoriesNone) {
      finalRows = rows.filter(
        (r) => !r.categories || r.categories.length === 0,
      );
    }

    return {
      data: finalRows.map((row) => mapRow(row as PostWithRelations)),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    return getOptionsFromModel(
      this.getEm().getRepository(this.getPostEntity()),
      { deletedAt: null },
      column,
      POST_OPTIONS_CONFIG,
      search,
      limit,
    );
  }

  async getById(id: string): Promise<PostDetailDto | null> {
    const p = await this.getEm().findOne(
      this.getPostEntity(),
      { id: toEntityId(id) },
      {
        populate: POST_POPULATE,
      },
    );
    if (!p) return null;
    return { ...mapRow(p as PostWithRelations), content: p.content };
  }

  async getDatesWithPosts(): Promise<string[]> {
    const rows = await this.getEm().find(
      this.getPostEntity(),
      { deletedAt: null },
      { fields: ['publishedAt', 'createdAt'] },
    );
    const dates = new Set<string>();
    for (const r of rows) {
      const d = r.publishedAt ?? r.createdAt;
      const iso = safeIsoString(d);
      if (iso) {
        dates.add(iso.slice(0, 10));
      }
    }
    return Array.from(dates).sort();
  }

  async create(
    authorId: string,
    data: {
      title: string;
      slug: string;
      content: unknown;
      excerpt?: string | null;
      image?: string | null;
      published?: boolean;
      publishedAt?: string | null;
      eventStartAt?: string | null;
      eventEndAt?: string | null;
      categoryIds?: string[];
      tagIds?: string[];
    },
  ): Promise<PostRowDto> {
    const categoryIds = (data.categoryIds ?? []).filter(
      (id) => id != null && String(id).trim() !== '',
    );
    const tagIds = (data.tagIds ?? []).filter(
      (id) => id != null && String(id).trim() !== '',
    );
    await this.validateCategoryIds(categoryIds);
    await this.validateTagIds(tagIds);

    const postObj = new (this.getPostEntity())();
    postObj.title = data.title;
    postObj.slug = data.slug;
    postObj.content = data.content;
    postObj.excerpt = truncateExcerpt(data.excerpt);
    postObj.image = data.image ?? null;
    postObj.published = data.published ?? false;
    postObj.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
    postObj.eventStartAt = data.eventStartAt
      ? new Date(data.eventStartAt)
      : null;
    postObj.eventEndAt = data.eventEndAt ? new Date(data.eventEndAt) : null;
    postObj.author = this.getEm().getReference(
      this.getUserEntity(),
      toEntityId(authorId),
    );
    this.getEm().persist(postObj);
    await this.getEm().flush();

    const createdPostId = toEntityId(postObj.id as string | number);
    for (const categoryId of categoryIds) {
      await insertPostCategoryPivot(
        this.getEm(),
        createdPostId,
        toEntityId(categoryId),
      );
    }
    for (const tagId of tagIds) {
      await insertPostTagPivot(this.getEm(), createdPostId, toEntityId(tagId));
    }

    const created = await this.getEm().findOne(
      this.getPostEntity(),
      { id: createdPostId },
      {
        populate: POST_POPULATE,
      },
    );
    if (!created) {
      throw new BadRequestException('Không thể tải bài viết vừa tạo');
    }
    return mapRow(created as PostWithRelations);
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      content?: unknown;
      excerpt?: string | null;
      image?: string | null;
      published?: boolean;
      publishedAt?: string | null;
      eventStartAt?: string | null;
      eventEndAt?: string | null;
      categoryIds?: string[];
      tagIds?: string[];
      authorId?: string;
    },
  ): Promise<PostRowDto | null> {
    const existing = await this.getEm().findOne(this.getPostEntity(), {
      id: toEntityId(id),
    });
    if (!existing) return null;

    if (data.title != null) existing.title = data.title;
    if (data.slug != null) {
      const duplicate = await this.getEm().findOne(this.getPostEntity(), {
        slug: data.slug,
        id: { $ne: toEntityId(id) },
      });
      if (duplicate) {
        throw new BadRequestException(
          'Slug đã tồn tại, vui lòng chọn slug khác',
        );
      }
      existing.slug = data.slug;
    }
    if (data.content !== undefined) existing.content = data.content;
    if (data.excerpt !== undefined)
      existing.excerpt = truncateExcerpt(data.excerpt);
    if (data.image !== undefined) existing.image = data.image;
    if (data.published !== undefined) existing.published = data.published;
    if (data.authorId !== undefined) {
      const authorId = data.authorId.trim();
      if (!authorId) {
        throw new BadRequestException('authorId không hợp lệ');
      }
      const author = await this.getEm().findOne(this.getUserEntity(), {
        id: toEntityId(authorId),
      });
      if (!author) {
        throw new BadRequestException('Tác giả không tồn tại');
      }
      existing.author = author;
    }
    if (data.publishedAt !== undefined)
      existing.publishedAt = parseNullableDate(data.publishedAt, 'publishedAt');
    if (data.eventStartAt !== undefined)
      existing.eventStartAt = parseNullableDate(
        data.eventStartAt,
        'eventStartAt',
      );
    if (data.eventEndAt !== undefined)
      existing.eventEndAt = parseNullableDate(data.eventEndAt, 'eventEndAt');

    this.getEm().persist(existing);
    try {
      await this.getEm().flush();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Lỗi lưu bài viết: ${msg}`);
    }

    if (data.categoryIds !== undefined) {
      const categoryIds = data.categoryIds.filter(
        (id) => id != null && String(id).trim() !== '',
      );
      await this.validateCategoryIds(categoryIds);
      await deletePostCategoryPivots(this.getEm(), toEntityId(existing.id));
      for (const categoryId of categoryIds) {
        try {
          await insertPostCategoryPivot(
            this.getEm(),
            toEntityId(existing.id),
            toEntityId(categoryId),
          );
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          throw new BadRequestException(`Lỗi lưu danh mục: ${msg}`);
        }
      }
    }
    if (data.tagIds !== undefined) {
      const tagIds = data.tagIds.filter(
        (id) => id != null && String(id).trim() !== '',
      );
      await this.validateTagIds(tagIds);
      await deletePostTagPivots(this.getEm(), toEntityId(existing.id));
      for (const tagId of tagIds) {
        try {
          await insertPostTagPivot(
            this.getEm(),
            toEntityId(existing.id),
            toEntityId(tagId),
          );
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          throw new BadRequestException(`Lỗi lưu thẻ: ${msg}`);
        }
      }
    }

    const updated = await this.getEm().findOne(
      this.getPostEntity(),
      { id: existing.id },
      {
        populate: POST_POPULATE,
      },
    );
    if (!updated) return null;
    return mapRow(updated as PostWithRelations);
  }

  async softDelete(id: string): Promise<boolean> {
    const r = await this.getEm().findOne(this.getPostEntity(), {
      id: toEntityId(id),
    });
    if (!r || r.deletedAt) return false;
    r.deletedAt = new Date();
    this.getEm().persist(r);
    await this.getEm().flush();
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const r = await this.getEm().findOne(this.getPostEntity(), {
      id: toEntityId(id),
    });
    if (!r || !r.deletedAt) return false;
    r.deletedAt = null;
    this.getEm().persist(r);
    await this.getEm().flush();
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const r = await this.getEm().findOne(this.getPostEntity(), {
      id: toEntityId(id),
    });
    if (!r) return false;
    this.getEm().remove(r);
    await this.getEm().flush();
    return true;
  }

  async bulkSetCategories(
    ids: string[],
    categoryIds: string[],
    mode: 'replace' | 'add' = 'replace',
  ): Promise<{ affected: number; message: string }> {
    const uniquePostIds = [
      ...new Set(ids.map((id) => String(id).trim()).filter(Boolean)),
    ];
    if (!uniquePostIds.length) {
      return { affected: 0, message: 'Không có bài viết nào' };
    }
    const cats = [...new Set(toEntityIdList(categoryIds))];
    await this.validateCategoryIds(cats.map(String));

    let affected = 0;
    await this.getEm().transactional(async (tx) => {
      for (const postId of uniquePostIds) {
        const post = await tx.findOne(
          this.getPostEntity(),
          { id: toEntityId(postId), deletedAt: null },
          { fields: ['id'] },
        );
        if (!post) continue;
        affected += 1;

        if (mode === 'replace') {
          await deletePostCategoryPivots(tx, post.id);
          for (const categoryId of cats) {
            await insertPostCategoryPivot(tx, post.id, categoryId);
          }
        } else {
          const existing = await tx.find(
            this.getPostCategoryEntity(),
            { post: post.id },
            { fields: ['category'] },
          );
          const have = new Set(
            existing
              .map((e) =>
                typeof e.category === 'object' && e.category
                  ? e.category.id
                  : typeof e.category === 'number'
                    ? e.category
                    : null,
              )
              .filter((id): id is number => id != null),
          );
          const toAdd = cats.filter((c) => !have.has(c));
          for (const categoryId of toAdd) {
            await insertPostCategoryPivot(tx, post.id, categoryId);
          }
        }
      }
    });

    const label =
      mode === 'replace'
        ? `Đã cập nhật danh mục cho ${affected} bài viết`
        : `Đã thêm danh mục cho ${affected} bài viết`;
    return { affected, message: label };
  }

  async bulkClearImages(
    ids: string[],
  ): Promise<{ affected: number; message: string }> {
    const uniquePostIds = [
      ...new Set(ids.map((id) => String(id).trim()).filter(Boolean)),
    ];
    if (!uniquePostIds.length) {
      return { affected: 0, message: 'Không có bài viết nào' };
    }
    const result = await this.getEm().nativeUpdate(
      this.getPostEntity(),
      {
        id: { $in: toEntityIdList(uniquePostIds) },
        deletedAt: null,
        image: { $ne: null },
      },
      { image: null },
    );
    return {
      affected: result ?? 0,
      message: `Đã xóa hình ảnh của ${result ?? 0} bài viết`,
    };
  }

  async bulk(
    action: 'delete' | 'restore' | 'hard-delete',
    ids: string[],
  ): Promise<{ affected: number; message: string }> {
    if (!ids.length) return { affected: 0, message: 'Không có bản ghi nào' };
    if (action === 'delete') {
      const result = await this.getEm().nativeUpdate(
        this.getPostEntity(),
        { id: { $in: toEntityIdList(ids) }, deletedAt: null },
        { deletedAt: new Date() },
      );
      return {
        affected: result ?? 0,
        message: `Đã xóa ${result ?? 0} bài viết`,
      };
    }
    if (action === 'restore') {
      const result = await this.getEm().nativeUpdate(
        this.getPostEntity(),
        { id: { $in: toEntityIdList(ids) }, deletedAt: { $ne: null } },
        { deletedAt: null },
      );
      return {
        affected: result ?? 0,
        message: `Đã khôi phục ${result ?? 0} bài viết`,
      };
    }
    if (action === 'hard-delete') {
      const result = await this.getEm().nativeDelete(this.getPostEntity(), {
        id: { $in: toEntityIdList(ids) },
      });
      return {
        affected: result ?? 0,
        message: `Đã xóa vĩnh viễn ${result ?? 0} bài viết`,
      };
    }
    return { affected: 0, message: 'Action không hợp lệ' };
  }
}
