/**
 * Cameras Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseCamerasController } from './camera.controller';

@Module({})
export class BaseCamerasModule {
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
