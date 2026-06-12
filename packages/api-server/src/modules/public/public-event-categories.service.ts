import { Injectable } from '@nestjs/common';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';

export interface PublicEventCategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  parentId: string | number | null;
  parentName: string | null;
  _count: { children: number };
}

@Injectable()
export abstract class BasePublicEventCategoriesService {
  protected abstract getEm(): EntityManager;
  protected abstract getCategoryEntity(): new () => Record<string, unknown>;

  async getCategories(slug?: string): Promise<PublicEventCategoryItem[]> {
    const em = this.getEm();
    const Category = this.getCategoryEntity();
    const where: Record<string, unknown> = {
      deletedAt: null,
      type: 'event',
    };
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
    const placeholders = ids.map(() => '?').join(',');
    const childrenRows = (await conn.execute(
      `SELECT parentId AS id, COUNT(*) AS cnt FROM categories WHERE parentId IN (${placeholders}) AND deletedAt IS NULL AND type = ? GROUP BY parentId`,
      [...ids, 'event'],
    )) as Array<{ id: number; cnt: number }>;
    const childrenCounts = new Map<number, number>(
      childrenRows.map((r) => [r.id, Number(r.cnt)]),
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
      };
    });
  }
}
