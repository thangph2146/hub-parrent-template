/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseScreensService,
  type ScreensRowDto,
} from '@workspace/api-server/modules/screens';
import {
  toIso,
  type AdminColumnFiltersConfig,
} from '@workspace/api-server/common';
import { Screen } from '../entities/screen.entity';
import { SCREEN_COLUMN_FILTERS } from '../common/admin-filter-configs';

export type ScreenRowDto = ScreensRowDto;

@Injectable()
export class ScreensService extends BaseScreensService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Screen as unknown as new () => Record<string, unknown>;
  }

  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return SCREEN_COLUMN_FILTERS;
  }

  protected getListPopulate(): string[] {
    return ['camera', 'template'];
  }

  protected mapRow(entity: Record<string, unknown>): ScreensRowDto {
    const row = entity as unknown as Screen;
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? null,
      cameraId: row.camera?.id ?? null,
      cameraName: row.camera?.name ?? null,
      templateId: row.template?.id ?? null,
      templateName: row.template?.name ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
