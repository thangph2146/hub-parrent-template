/**
 * TrainingLevels Service.
 *
 * Bám sát pattern của `apps/main/api/src/training-levels/training-levels.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

export interface TrainingLevelsRowDto extends CrudRowDto {
  id: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TrainingLevelsCreateData extends CrudCreateData {
  isActive?: boolean;
}

export interface TrainingLevelsUpdateData extends CrudUpdateData {
  isActive?: boolean;
}

@Injectable()
export abstract class BaseTrainingLevelsService extends BaseCrudService<
  TrainingLevelsRowDto,
  TrainingLevelsCreateData,
  TrainingLevelsUpdateData
> {
  protected readonly logger = new Logger(BaseTrainingLevelsService.name);
  protected abstract getEntity(): new () => Record<string, unknown>;
  protected getEntityName(): string {
    return 'TrainingLevels';
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
