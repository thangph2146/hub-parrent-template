/**
 * Cameras Module barrel export.
 */
export {
  BaseCamerasService,
  BaseCamerasController,
  BaseCamerasModule,
} from './cameras.module';

export type { ICamerasControllerService } from './camera.controller';

export type {
  CamerasRowDto,
  CamerasCreateData,
  CamerasUpdateData,
} from './camera.service';
