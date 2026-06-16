/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Cameras Module.
 *
 * Bám sát pattern của `apps/main/api/src/cameras/cameras.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCamerasController } from './camera.controller';

@Module({})
export class BaseCamerasModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseCamerasController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseCamerasController } from './camera.controller';
export {
  BaseCamerasService,
  type CamerasRowDto,
  type CamerasCreateData,
  type CamerasUpdateData,
} from './camera.service';
