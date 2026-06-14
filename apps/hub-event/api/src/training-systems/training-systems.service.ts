/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { TRAINING_SYSTEM_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TrainingSystem } from '../entities/training-system.entity';
import { BaseTrainingSystemsService } from '../common/module-bases/training-systems/training-system.service';
export type {
  TrainingSystemsRowDto,
  TrainingSystemsCreateData,
  TrainingSystemsUpdateData,
} from '../common/module-bases/training-systems/training-system.service';

@Injectable()
export class TrainingSystemsService extends BaseTrainingSystemsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return TrainingSystem as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getColumnFiltersConfig() {
    return TRAINING_SYSTEM_COLUMN_FILTERS;
  }
}
