/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseTrainingSystemsController } from '../common/module-bases/training-systems/training-system.controller';
import { TrainingSystemsService } from './training-systems.service';

@Permissions(PERMISSIONS.TRAINING_SYSTEMS_VIEW)
@Controller(ADMIN_ROUTES.TRAINING_SYSTEMS)
export class TrainingSystemsController extends BaseTrainingSystemsController {
  constructor(service: TrainingSystemsService) {
    super(service);
  }
}
