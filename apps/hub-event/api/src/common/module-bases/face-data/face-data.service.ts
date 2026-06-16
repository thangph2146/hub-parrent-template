/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * FaceData Service.
 *
 * Bám sát pattern của `apps/main/api/src/face-data/face-data.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type {
  CrudRowDto,
  CrudCreateData,
  CrudUpdateData,
} from '../../module-types';

export interface FaceDatasRowDto extends CrudRowDto {
  userId?: number | null;
  imagePath?: string;
  status?: number;
}

export interface FaceDatasCreateData extends CrudCreateData {
  userId?: number | null;
  imagePath?: string;
  status?: number;
}

export interface FaceDatasUpdateData extends CrudUpdateData {
  userId?: number | null;
  imagePath?: string;
  status?: number;
}

@Injectable()
export abstract class BaseFaceDatasService extends BaseCrudService<
  FaceDatasRowDto,
  FaceDatasCreateData,
  FaceDatasUpdateData
> {
  protected readonly logger = new Logger(BaseFaceDatasService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;

  protected getEntityName(): string {
    return 'FaceData';
  }

  protected getSearchFields(): string[] {
    return ['imagePath'];
  }

  protected getFilterableFields(): string[] {
    return ['status'];
  }

  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  protected getBulkLabel(): string {
    return 'khuôn mặt';
  }
}
