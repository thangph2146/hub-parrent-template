/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Category } from '../entities/category.entity';

export interface PublicEventCategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  parentId: string | null;
  parentName: string | null;
  _count: { children: number };
}

@Injectable()
export class PublicEventCategoriesService {
  constructor(private readonly em: EntityManager) {}

  async getCategories(slug?: string): Promise<PublicEventCategoryItem[]> {
    const where: Record<string, unknown> = {
      deletedAt: null,
      type: 'event',
    };
    if (slug) {
      where.slug = slug;
    }
    const rows = await this.em.find(Category, where as FilterQuery<Category>, {
      populate: ['parent'],
      orderBy: { parent: 'ASC', name: 'ASC' },
    });

    const ids = rows.map((r) => r.id);
    if (ids.length === 0) return [];

    const conn = this.em.getConnection();
    const placeholders = ids.map(() => '?').join(',');
    const childrenRows = (await conn.execute(
      `SELECT parentId AS id, COUNT(*) AS cnt FROM categories WHERE parentId IN (${placeholders}) AND deletedAt IS NULL AND type = ? GROUP BY parentId`,
      [...ids, 'event'],
    )) as Array<{ id: number; cnt: number }>;
    const childrenCounts = new Map<number, number>(
      childrenRows.map((r) => [r.id, Number(r.cnt)]),
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
    }));
  }
}
