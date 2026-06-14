/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * TrainingLevels Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  TrainingLevelsRowDto,
  TrainingLevelsCreateData,
  TrainingLevelsUpdateData,
} from './training-level.service';

export type ITrainingLevelsControllerService = ICrudControllerService<
  TrainingLevelsRowDto,
  TrainingLevelsCreateData,
  TrainingLevelsUpdateData
>;

@ApiTags('TrainingLevels')
export class BaseTrainingLevelsController extends BaseCrudController<
  TrainingLevelsRowDto,
  TrainingLevelsCreateData,
  TrainingLevelsUpdateData
> {
  constructor(service: ITrainingLevelsControllerService) {
    super(service, 'training-levels');
  }
}
