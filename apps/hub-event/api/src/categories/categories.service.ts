/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseCategoriesService,
  type CategoryRowDto,
} from '@workspace/api-server/modules/categories';
import { toIso, type AdminColumnFiltersConfig } from '@workspace/api-server/common';
import { getOptionsFromModel, type GetOptionsConfig } from '../common/get-options';
import { Category } from '../entities/category.entity';
import { CATEGORY_COLUMN_FILTERS } from '../common/admin-filter-configs';
const CATEGORY_OPTIONS_CONFIG: GetOptionsConfig = {
  id: { valueField: 'id', labelField: 'name', searchField: 'name' },
  slug: { valueField: 'slug', searchField: 'slug' },
  name: { valueField: 'name', searchField: 'name' },
  '*': { valueField: 'name', searchField: 'name' },
};

@Injectable()
export class CategoriesService extends BaseCategoriesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Category as unknown as new () => Record<string, unknown>;
  }


  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return CATEGORY_COLUMN_FILTERS;
  }

  protected getListPopulate(): string[] {
    return ["parent"];
  }

  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    return getOptionsFromModel(
      this.getEm().getRepository(Category),
      { deletedAt: null },
      column,
      CATEGORY_OPTIONS_CONFIG,
      search,
      limit,
    );
  }
  protected mapRow(entity: Record<string, unknown>): CategoryRowDto {
    const row = entity as unknown as Category;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      parentId: row.parent?.id ?? null,
      description: row.description ?? null,
      isActive: row.deletedAt == null,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
