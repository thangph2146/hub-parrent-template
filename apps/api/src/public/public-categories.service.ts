import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';

export interface PublicCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
    const childrenRows = (await conn.execute(
      'SELECT parent_id AS id, COUNT(*) AS cnt FROM categories WHERE parent_id IN (?) AND deleted_at IS NULL GROUP BY parent_id',
      [ids],
    )) as Array<{ id: string; cnt: number }>;
    const childrenCounts = new Map<string, number>(
      childrenRows.map((r) => [r.id, Number(r.cnt)]),
    );

    // Batch post count: single query GROUP BY category_id
    const postRows = (await conn.execute(
      'SELECT category_id AS id, COUNT(*) AS cnt FROM post_categories WHERE category_id IN (?) GROUP BY category_id',
      [ids],
    )) as Array<{ id: string; cnt: number }>;
    const postsCounts = new Map<string, number>(
      postRows.map((r) => [r.id, Number(r.cnt)]),
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? null,
      parentId: (r.parent as any)?.id ?? null,
      parentName: r.parent?.name ?? null,
      _count: { children: childrenCounts.get(r.id) ?? 0 },
      postCount: postsCounts.get(r.id) ?? 0,
    }));
  }
}
