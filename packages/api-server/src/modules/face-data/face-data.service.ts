/**
 * FaceDatas Service.
 *
 * Bám sát pattern của `apps/main/api/src/face-data/face-data.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface FaceDatasRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FaceDatasCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface FaceDatasUpdateData extends CrudUpdateData {
  isActive?: boolean;
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
    return 'FaceDatas';
  }
  protected getSearchFields(): string[] {
    return [];
  }
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }
}
