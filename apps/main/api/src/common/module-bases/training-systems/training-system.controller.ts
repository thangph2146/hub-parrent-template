/**
 * TrainingSystems Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  TrainingSystemsRowDto,
  TrainingSystemsCreateData,
  TrainingSystemsUpdateData,
} from './training-system.service';

export type ITrainingSystemsControllerService = ICrudControllerService<
  TrainingSystemsRowDto,
  TrainingSystemsCreateData,
  TrainingSystemsUpdateData
>;

@ApiTags('TrainingSystems')
export class BaseTrainingSystemsController extends BaseCrudController<
  TrainingSystemsRowDto,
  TrainingSystemsCreateData,
  TrainingSystemsUpdateData
> {
  constructor(service: ITrainingSystemsControllerService) {
    super(service, 'training-systems');
  }
}
