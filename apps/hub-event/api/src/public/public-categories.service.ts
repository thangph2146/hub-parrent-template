import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';

export interface PublicCategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  parentId: string | null;
  parentName: string | null;
  _count: { children: number };
  postCount: number;
}

@Injectable()
export class PublicCategoriesService {
  constructor(private readonly em: EntityManager) {}

  async getCategories(slug?: string): Promise<PublicCategoryItem[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (slug) {
      where.slug = slug;
    }
    const rows = await this.em.find(Category, where as FilterQuery<Category>, {
      populate: ['parent'],
      orderBy: { parent: 'ASC', name: 'ASC' },
    });

    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return [];

    // Batch children count: single query GROUP BY parent
    const conn = this.em.getConnection();
    const parentPlaceholders = ids.map(() => '?').join(',');
    const childrenRows = (await conn.execute(
      `SELECT parentId AS id, COUNT(*) AS cnt FROM categories WHERE parentId IN (${parentPlaceholders}) AND deletedAt IS NULL GROUP BY parentId`,
      ids,
    )) as Array<{ id: number; cnt: number }>;
    const childrenCounts = new Map<number, number>(
      childrenRows.map((r) => [r.id, Number(r.cnt)]),
    );

    // Batch post count: single query GROUP BY categoryId
    const postPlaceholders = ids.map(() => '?').join(',');
    const postRows = (await conn.execute(
      `SELECT categoryId AS id, COUNT(*) AS cnt FROM post_categories WHERE categoryId IN (${postPlaceholders}) GROUP BY categoryId`,
      ids,
    )) as Array<{ id: number; cnt: number }>;
    const postsCounts = new Map<number, number>(
      postRows.map((r) => [r.id, Number(r.cnt)]),
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? null,
      icon: r.icon ?? null,
      sortOrder: r.sortOrder ?? 0,
      parentId: (r.parent as any)?.id ?? null,
      parentName: r.parent?.name ?? null,
      _count: { children: childrenCounts.get(r.id) ?? 0 },
      postCount: postsCounts.get(r.id) ?? 0,
    }));
  }
}
