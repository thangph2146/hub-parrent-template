/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseTagsService,
  type TagsRowDto,
} from '@workspace/api-server/modules/tags';
import { toIso } from '@workspace/api-server/common';

import {
  getOptionsFromModel,
  type GetOptionsConfig,
} from '../common/get-options';
import { Tag } from '../entities/tag.entity';
const TAG_OPTIONS_CONFIG: GetOptionsConfig = {
  id: { valueField: 'id', labelField: 'name', searchField: 'name' },
  slug: { valueField: 'slug', searchField: 'slug' },
  name: { valueField: 'name', searchField: 'name' },
  '*': { valueField: 'name', searchField: 'name' },
};

export type TagRowDto = TagsRowDto;

@Injectable()
export class TagsService extends BaseTagsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Tag as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'slug'];
  }
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }
  async getOptions(
    column: string,
    search?: string,
    limit = 50,
  ): Promise<Array<{ label: string; value: string }>> {
    return getOptionsFromModel(
      this.getEm().getRepository(Tag),
      { deletedAt: null },
      column,
      TAG_OPTIONS_CONFIG,
      search,
      limit,
    );
  }
  protected mapRow(entity: Record<string, unknown>): TagsRowDto {
    const row = entity as unknown as Tag;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon ?? null,
      isActive: row.deletedAt == null,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
