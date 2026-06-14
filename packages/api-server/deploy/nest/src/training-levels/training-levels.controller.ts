/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseTrainingLevelsController } from '../common/module-bases/training-levels/training-level.controller';
import { TrainingLevelsService } from './training-levels.service';

@Permissions(PERMISSIONS.TRAINING_LEVELS_VIEW)
@Controller(ADMIN_ROUTES.TRAINING_LEVELS)
export class TrainingLevelsController extends BaseTrainingLevelsController {
  constructor(service: TrainingLevelsService) {
    super(service);
  }
}
