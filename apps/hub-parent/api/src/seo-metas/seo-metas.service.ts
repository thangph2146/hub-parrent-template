/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { SEO_META_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { SeoMeta } from '../entities/seo-meta.entity';
import { BaseSeoMetasService } from '../common/module-bases/seo-metas/seo-meta.service';
export type {
  SeoMetasRowDto,
  SeoMetasCreateData,
  SeoMetasUpdateData,
} from '../common/module-bases/seo-metas/seo-meta.service';

@Injectable()
export class SeoMetasService extends BaseSeoMetasService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return SeoMeta as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['page', 'title', 'description'];
  }

  protected getColumnFiltersConfig() {
    return SEO_META_COLUMN_FILTERS;
  }
}
