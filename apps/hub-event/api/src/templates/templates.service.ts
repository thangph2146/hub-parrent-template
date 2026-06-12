/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseTemplatesService,
  type TemplatesRowDto,
} from '@workspace/api-server/modules/templates';
import { toIso, type AdminColumnFiltersConfig } from '@workspace/api-server/common';
import { Template } from '../entities/template.entity';
import { TEMPLATE_COLUMN_FILTERS } from '../common/admin-filter-configs';

export type TemplateRowDto = TemplatesRowDto;

@Injectable()
export class TemplatesService extends BaseTemplatesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Template as unknown as new () => Record<string, unknown>;
  }


  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return TEMPLATE_COLUMN_FILTERS;
  }

  protected mapRow(entity: Record<string, unknown>): TemplatesRowDto {
    const row = entity as unknown as Template;
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? null,
      content: row.content ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
