import { Injectable } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { toEntityId } from '../../common';
import { normalizePageLimit, paginationMeta } from '../../common/pagination';

export interface PublicPostsQuery {
  page: number;
  limit: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}

@Injectable()
export abstract class BasePublicPostsService {
  protected abstract getEm(): EntityManager;
  protected abstract getPostEntity(): new () => Record<string, unknown>;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;
  protected abstract getTagEntity(): new () => Record<string, unknown>;
  protected abstract getSettingEntity(): new () => Record<string, unknown>;

  private buildViewCountKey(postId: string | number): string {
    return `post_view_count:${postId}`;
  }

  private parseViewCount(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
      const n = Number.parseInt(value, 10);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  private async getViewCountsMap(
    postIds: Array<string | number>,
  ): Promise<Record<string, number>> {
    const em = this.getEm();
    const Setting = this.getSettingEntity();
    const ids = [...new Set(postIds.filter((id) => id != null && id !== ''))].map(String);
    if (ids.length === 0) return {};
    const keys = ids.map((id) => this.buildViewCountKey(id));
    const rows = await em.find(Setting, { key: { $in: keys } } as never);
    const out: Record<string, number> = {};
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const postId = String(r.key).replace(/^post_view_count:/, '');
      out[postId] = this.parseViewCount(r.value);
    }
    return out;
  }

  private async increaseViewCount(postId: string | number): Promise<number> {
    const em = this.getEm();
    const Setting = this.getSettingEntity();
    const key = this.buildViewCountKey(postId);
    const existing = await em.findOne(Setting, { key } as never);
    const next = this.parseViewCount(
      (existing as Record<string, unknown> | null)?.value,
    ) + 1;
    if (existing) {
      const row = existing as Record<string, unknown>;
      row.value = next;
      row.group = 'analytics';
      em.persist(existing);
      await em.flush();
      return next;
    }
    const entity = new Setting() as Record<string, unknown>;
    entity.key = key;
    entity.value = next;
    entity.group = 'analytics';
    em.persist(entity);
    await em.flush();
    return next;
  }

  async getPosts(params: PublicPostsQuery) {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const Category = this.getCategoryEntity();
    const Tag = this.getTagEntity();
    const { page, limit, skip } = normalizePageLimit(params.page, params.limit, 50);
    let categoryId: number | undefined;
    let tagId: number | undefined;

    if (params.categorySlug?.trim()) {
      const category = await em.findOne(Category, {
        slug: params.categorySlug.trim(),
        deletedAt: null,
      } as never);
      if (category) categoryId = (category as Record<string, unknown>).id as number;
    }

    if (params.tagSlug?.trim()) {
      const tag = await em.findOne(Tag, {
        slug: params.tagSlug.trim(),
      } as never);
      if (tag) tagId = (tag as Record<string, unknown>).id as number;
    }

    let categoryIds: number[] = [];
    if (categoryId) {
      const childCategories = await em.find(Category, {
        parent: categoryId,
        deletedAt: null,
      } as never);
      categoryIds = [
        categoryId,
        ...childCategories.map((c) => (c as Record<string, unknown>).id as number),
      ];
    }

    const where: Record<string, unknown> = {
      published: true,
      deletedAt: null,
      publishedAt: { $lte: new Date() },
    };
    if (params.search) {
      const q = `%${params.search.trim()}%`;
      where.$or = [{ title: { $like: q } }, { excerpt: { $like: q } }];
    }
    if (categoryIds.length) {
      where.categories = { category: { id: { $in: categoryIds } } };
    }
    if (tagId) {
      where.tags = { tag: { id: toEntityId(tagId) } };
    }
    const whereQuery = where as FilterQuery<Record<string, unknown>>;

    const [posts, total] = await Promise.all([
      em.find(Post, whereQuery, {
        populate: [
          'author',
          'categories',
          'categories.category',
          'tags',
          'tags.tag',
        ],
        orderBy: { publishedAt: 'DESC' },
        offset: skip,
        limit,
        fields: [
          'id',
          'title',
          'slug',
          'excerpt',
          'image',
          'publishedAt',
          'eventStartAt',
          'eventEndAt',
        ] as never,
      }),
      em.count(Post, whereQuery),
    ]);

    const viewCounts = await this.getViewCountsMap(
      posts.map((p) => (p as Record<string, unknown>).id as string | number),
    );
    return {
      data: posts.map((post) => {
        const p = post as Record<string, unknown> & {
          author?: { name?: string | null; avatar?: string | null };
          categories?: Array<{ category: { name: string; slug: string } }>;
          tags?: Array<{ tag: { name: string; slug: string } }>;
        };
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          image: p.image,
          publishedAt: p.publishedAt,
          eventStartAt: p.eventStartAt,
          eventEndAt: p.eventEndAt,
          author: {
            name: p.author?.name ?? null,
            avatar: p.author?.avatar,
          },
          categories: (p.categories || []).map((pc) => ({
            category: {
              name: pc.category.name,
              slug: pc.category.slug,
            },
          })),
          tags: (p.tags || []).map((pt) => ({
            tag: {
              name: pt.tag.name,
              slug: pt.tag.slug,
            },
          })),
          viewCount: viewCounts[String(p.id)] ?? 0,
        };
      }),
      meta: paginationMeta(page, limit, total),
    };
  }

  async getPostBySlug(slug: string, options?: { trackView?: boolean }) {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const post = await em.findOne(
      Post,
      {
        slug,
        published: true,
        deletedAt: null,
        publishedAt: { $lte: new Date() },
      } as never,
      {
        populate: [
          'author',
          'categories',
          'categories.category',
          'tags',
          'tags.tag',
        ],
      },
    );
    if (!post) return null;
    const p = post as Record<string, unknown> & {
      author?: { name?: string | null; avatar?: string | null };
      categories?: Array<{ category: { name: string; slug: string } }>;
      tags?: Array<{ tag: { name: string; slug: string } }>;
    };
    const trackView = options?.trackView !== false;
    const nextViewCount = trackView
      ? await this.increaseViewCount(p.id as string | number)
      : ((await this.getViewCountsMap([p.id as string | number]))[String(p.id)] ?? 0);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      image: p.image,
      publishedAt: p.publishedAt,
      author: {
        name: p.author?.name ?? null,
        avatar: p.author?.avatar,
      },
      categories: (p.categories || []).map((pc) => ({
        category: {
          name: pc.category.name,
          slug: pc.category.slug,
        },
      })),
      tags: (p.tags || []).map((pt) => ({
        tag: {
          name: pt.tag.name,
          slug: pt.tag.slug,
        },
      })),
      viewCount: nextViewCount,
    };
  }

  async incrementPostViewBySlug(
    slug: string,
  ): Promise<{ viewCount: number } | null> {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const post = await em.findOne(Post, {
      slug,
      published: true,
      deletedAt: null,
      publishedAt: { $lte: new Date() },
    } as never);
    if (!post) return null;
    const viewCount = await this.increaseViewCount(
      (post as Record<string, unknown>).id as string | number,
    );
    return { viewCount };
  }

  async getHomeAdmissionPosts(params?: {
    latestLimit?: number;
    admissionLimit?: number;
    admissionCategorySlug?: string;
  }) {
    const em = this.getEm();
    const Post = this.getPostEntity();
    const Category = this.getCategoryEntity();
    const latestLimit = Math.min(10, Math.max(1, params?.latestLimit ?? 3));
    const admissionLimit = Math.min(10, Math.max(1, params?.admissionLimit ?? 3));
    const admissionCategorySlug =
      params?.admissionCategorySlug?.trim() ?? 'tin-tuyen-sinh';

    let categoryId: number | undefined;
    const category = await em.findOne(Category, {
      slug: admissionCategorySlug,
      deletedAt: null,
    } as never);
    if (category) categoryId = (category as Record<string, unknown>).id as number;

    const baseWhere: Record<string, unknown> = {
      published: true,
      deletedAt: null,
      publishedAt: { $lte: new Date() },
    };

    const listFields = ['id', 'title', 'slug', 'publishedAt'] as const;
    const [latestNews, admissionNews] = await Promise.all([
      em.find(Post, baseWhere as FilterQuery<Record<string, unknown>>, {
        orderBy: { publishedAt: 'DESC' },
        limit: latestLimit,
        fields: [...listFields] as never,
      }),
      categoryId
        ? em.find(
            Post,
            {
              ...baseWhere,
              categories: { category: { id: categoryId } },
            } as FilterQuery<Record<string, unknown>>,
            {
              orderBy: { publishedAt: 'DESC' },
              limit: admissionLimit,
              fields: [...listFields] as never,
            },
          )
        : em.find(Post, baseWhere as FilterQuery<Record<string, unknown>>, {
            orderBy: { publishedAt: 'DESC' },
            limit: admissionLimit,
            fields: [...listFields] as never,
          }),
    ]);

    const viewCounts = await this.getViewCountsMap([
      ...latestNews.map((p) => (p as Record<string, unknown>).id as string | number),
      ...admissionNews.map((p) => (p as Record<string, unknown>).id as string | number),
    ]);
    const mapRow = (p: Record<string, unknown>) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      publishedAt: p.publishedAt,
      viewCount: viewCounts[String(p.id)] ?? 0,
    });
    return {
      latestNews: latestNews.map((p) => mapRow(p as Record<string, unknown>)),
      admissionNews: admissionNews.map((p) => mapRow(p as Record<string, unknown>)),
    };
  }
}
