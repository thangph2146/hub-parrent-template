/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseSeoMetasService,
  type SeoMetasRowDto,
} from '@workspace/api-server/modules/seo-metas';
import {
  toIso,
  type AdminColumnFiltersConfig,
} from '@workspace/api-server/common';
import { SeoMeta } from '../entities/seo-meta.entity';
import { SEO_META_COLUMN_FILTERS } from '../common/admin-filter-configs';

export type SeoMetaRowDto = SeoMetasRowDto;

@Injectable()
export class SeoMetasService extends BaseSeoMetasService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return SeoMeta as unknown as new () => Record<string, unknown>;
  }

  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return SEO_META_COLUMN_FILTERS;
  }

  protected mapRow(entity: Record<string, unknown>): SeoMetasRowDto {
    const row = entity as unknown as SeoMeta;
    return {
      id: row.id,
      page: row.page,
      title: row.title ?? null,
      description: row.description ?? null,
      keywords: row.keywords ?? null,
      ogTitle: row.ogTitle ?? null,
      ogDescription: row.ogDescription ?? null,
      ogImage: row.ogImage ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
