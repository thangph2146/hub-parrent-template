/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * TrainingLevels Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseTrainingLevelsController } from './training-level.controller';

@Module({})
export class BaseTrainingLevelsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseTrainingLevelsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseTrainingLevelsController } from './training-level.controller';
export {
  BaseTrainingLevelsService,
  type TrainingLevelsRowDto,
  type TrainingLevelsCreateData,
  type TrainingLevelsUpdateData,
} from './training-level.service';
