/**
 * Screens Service.
 *
 * Bám sát pattern của `apps/main/api/src/screens/screens.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import { toEntityId, toIso } from '../../common';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Screen row DTO trả về cho client.
 */
export interface ScreensRowDto extends CrudRowDto {
  name?: string;
  code?: unknown;
  cameraId?: number | null;
  cameraName?: string | null;
  status: number;
}

export interface ScreensCreateData extends CrudCreateData {
  name?: string;
  code?: unknown;
  cameraId?: number | string | null;
  status?: number;
}

export interface ScreensUpdateData extends CrudUpdateData {
  name?: string;
  code?: unknown;
  cameraId?: number | string | null;
  status?: number;
}

type ScreenRow = {
  id: number;
  name: string;
  code?: string | null;
  camera?: { id?: number; name?: string } | null;
  status: number;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
};

function mapScreenRow(r: ScreenRow): ScreensRowDto {
  return {
    id: r.id,
    name: r.name,
    code: r.code ?? null,
    cameraId: r.camera?.id ?? null,
    cameraName: r.camera?.name ?? null,
    status: r.status,
    isActive: r.status !== 0,
    createdAt: toIso(r.createdAt) ?? '',
    updatedAt: toIso(r.updatedAt) ?? '',
    deletedAt: toIso(r.deletedAt),
  };
}

@Injectable()
export abstract class BaseScreensService extends BaseCrudService<
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData
> {
  protected readonly logger = new Logger(BaseScreensService.name);

  protected abstract getEntity(): new () => Record<string, unknown>;

  protected abstract getCameraEntity(): new () => Record<string, unknown>;

  protected getEntityName(): string {
    return 'Screen';
  }

  protected getPrimaryKeyField(): string {
    return 'id';
  }

  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getFilterableFields(): string[] {
    return ['status'];
  }

  protected getBulkLabel(): string {
    return 'màn hình';
  }

  protected getListPopulate(): string[] {
    return ['camera'];
  }

  protected mapRow(entity: Record<string, unknown>): ScreensRowDto {
    return mapScreenRow(entity as ScreenRow);
  }

  protected async beforeCreate(
    data: ScreensCreateData,
  ): Promise<Record<string, unknown>> {
    return this.prepareScreenData(data as Record<string, unknown>);
  }

  protected async beforeUpdate(
    _id: string | number,
    data: ScreensUpdateData,
  ): Promise<Record<string, unknown>> {
    return this.prepareScreenData(data as Record<string, unknown>);
  }

  private prepareScreenData(data: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (data.name !== undefined) out.name = data.name;
    if (data.code !== undefined) out.code = data.code;
    if (data.status !== undefined) out.status = data.status;

    if (data.cameraId !== undefined) {
      const raw = data.cameraId;
      const id =
        raw == null || raw === ''
          ? null
          : toEntityId(raw as string | number);
      const Camera = this.getCameraEntity();
      out.camera = id ? this.getEm().getReference(Camera, id) : null;
    }

    return out;
  }
}
