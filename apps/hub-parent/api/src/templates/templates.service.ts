/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { TEMPLATE_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Template } from '../entities/template.entity';
import { BaseTemplatesService } from '../common/module-bases/templates/template.service';
export type {
  TemplatesRowDto,
  TemplatesCreateData,
  TemplatesUpdateData,
} from '../common/module-bases/templates/template.service';

@Injectable()
export class TemplatesService extends BaseTemplatesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Template as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getColumnFiltersConfig() {
    return TEMPLATE_COLUMN_FILTERS;
  }
}
