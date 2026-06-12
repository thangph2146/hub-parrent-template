/**
 * TrainingSystems Service.
 *
 * Bám sát pattern của `apps/main/api/src/training-systems/training-systems.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface TrainingSystemsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TrainingSystemsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface TrainingSystemsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseTrainingSystemsService extends BaseCrudService<
  TrainingSystemsRowDto,
  TrainingSystemsCreateData,
  TrainingSystemsUpdateData
> {
  protected readonly logger = new Logger(BaseTrainingSystemsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'TrainingSystems';
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
