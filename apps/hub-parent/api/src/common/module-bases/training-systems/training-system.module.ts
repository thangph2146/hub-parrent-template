/**
 * TrainingSystems Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseTrainingSystemsController } from './training-system.controller';

@Module({})
export class BaseTrainingSystemsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseTrainingSystemsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseTrainingSystemsController } from './training-system.controller';
export {
  BaseTrainingSystemsService,
  type TrainingSystemsRowDto,
  type TrainingSystemsCreateData,
  type TrainingSystemsUpdateData,
} from './training-system.service';
