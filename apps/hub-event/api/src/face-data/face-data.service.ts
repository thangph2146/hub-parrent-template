/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { ListCrudParams } from '@workspace/api-server/types/crud.types';
import {
  BaseFaceDatasService,
  type FaceDatasRowDto,
} from '@workspace/api-server/modules/face-data';
import { toIso } from '@workspace/api-server/common';
import { FaceData } from '../entities/face-data.entity';

export type FaceDataRowDto = FaceDatasRowDto;

@Injectable()
export class FaceDataService extends BaseFaceDatasService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return FaceData as unknown as new () => Record<string, unknown>;
  }

  protected getListPopulate(): string[] {
    return ['user'];
  }

  protected buildWhere(params: ListCrudParams) {
    const filters = { ...(params.filters ?? {}) };
    const userId = filters.userId;
    if (userId) {
      delete filters.userId;
    }
    const where = super.buildWhere({ ...params, filters }) as Record<
      string,
      unknown
    >;
    if (userId) {
      where.user = userId;
    }
    return where;
  }
  protected mapRow(entity: Record<string, unknown>): FaceDatasRowDto {
    const row = entity as unknown as FaceData;
    return {
      id: row.id,
      userId: row.user?.id ?? null,
      imagePath: row.imagePath,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
