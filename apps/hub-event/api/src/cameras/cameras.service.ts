/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.services */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseCamerasService,
  type CamerasRowDto,
} from '@workspace/api-server/modules/cameras';
import { toIso, type AdminColumnFiltersConfig } from '@workspace/api-server/common';
import { Camera } from '../entities/camera.entity';
import { CAMERA_COLUMN_FILTERS } from '../common/admin-filter-configs';

export type CameraRowDto = CamerasRowDto;

@Injectable()
export class CamerasService extends BaseCamerasService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Camera as unknown as new () => Record<string, unknown>;
  }


  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return CAMERA_COLUMN_FILTERS;
  }

  protected getListPopulate(): string[] {
    return ["linkedEvent"];
  }

  protected mapRow(entity: Record<string, unknown>): CamerasRowDto {
    const row = entity as unknown as Camera;
    return {
      id: row.id,
      name: row.name,
      code: row.code ?? null,
      linkedEventId: row.linkedEvent?.id ?? null,
      linkedEventTitle: row.linkedEvent?.title ?? null,
      linkedEventSlug: row.linkedEvent?.slug ?? null,
      ipAddress: row.ipAddress ?? null,
      port: row.port ?? null,
      username: row.username ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
