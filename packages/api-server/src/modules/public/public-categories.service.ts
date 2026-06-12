import { Injectable } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';

export interface PublicCategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  parentId: string | number | null;
  parentName: string | null;
  _count: { children: number };
  postCount: number;
}

@Injectable()
export abstract class BasePublicCategoriesService {
  protected abstract getEm(): EntityManager;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;

  async getCategories(slug?: string): Promise<PublicCategoryItem[]> {
    const em = this.getEm();
    const Category = this.getCategoryEntity();
    const where: Record<string, unknown> = { deletedAt: null };
    if (slug) {
      where.slug = slug;
    }
    const rows = await em.find(Category, where as FilterQuery<Record<string, unknown>>, {
      populate: ['parent'],
      orderBy: { parent: 'ASC', name: 'ASC' },
    });

    const ids = rows.map((r) => (r as Record<string, unknown>).id as number);
    if (ids.length === 0) return [];

    const conn = em.getConnection();
    const parentPlaceholders = ids.map(() => '?').join(',');
    const childrenRows = (await conn.execute(
      `SELECT parentId AS id, COUNT(*) AS cnt FROM categories WHERE parentId IN (${parentPlaceholders}) AND deletedAt IS NULL GROUP BY parentId`,
      ids,
    )) as Array<{ id: number; cnt: number }>;
    const childrenCounts = new Map<number, number>(
      childrenRows.map((r) => [r.id, Number(r.cnt)]),
    );

    const postPlaceholders = ids.map(() => '?').join(',');
    const postRows = (await conn.execute(
      `SELECT categoryId AS id, COUNT(*) AS cnt FROM post_categories WHERE categoryId IN (${postPlaceholders}) GROUP BY categoryId`,
      ids,
    )) as Array<{ id: number; cnt: number }>;
    const postsCounts = new Map<number, number>(
      postRows.map((r) => [r.id, Number(r.cnt)]),
    );

    return rows.map((row) => {
      const r = row as Record<string, unknown> & {
        parent?: { id?: number; name?: string } | null;
      };
      const id = r.id as number;
      return {
        id,
        name: String(r.name ?? ''),
        slug: String(r.slug ?? ''),
        description: (r.description as string | null | undefined) ?? null,
        icon: (r.icon as string | null | undefined) ?? null,
        sortOrder: Number(r.sortOrder ?? 0) || 0,
        parentId: r.parent?.id ?? null,
        parentName: r.parent?.name ?? null,
        _count: { children: childrenCounts.get(id) ?? 0 },
        postCount: postsCounts.get(id) ?? 0,
      };
    });
  }
}
