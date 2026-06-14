/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { TRAINING_LEVEL_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TrainingLevel } from '../entities/training-level.entity';
import { BaseTrainingLevelsService } from '../common/module-bases/training-levels/training-level.service';
export type {
  TrainingLevelsRowDto,
  TrainingLevelsCreateData,
  TrainingLevelsUpdateData,
} from '../common/module-bases/training-levels/training-level.service';

@Injectable()
export class TrainingLevelsService extends BaseTrainingLevelsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return TrainingLevel as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getColumnFiltersConfig() {
    return TRAINING_LEVEL_COLUMN_FILTERS;
  }
}
