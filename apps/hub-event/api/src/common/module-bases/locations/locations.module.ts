/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Locations Module.
 *
 * Bám sát pattern của `apps/main/api/src/locations/locations.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseLocationsController } from './location.controller';

@Module({})
export class BaseLocationsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseLocationsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseLocationsController } from './location.controller';
export {
  BaseLocationsService,
  type LocationsRowDto,
  type LocationsCreateData,
  type LocationsUpdateData,
} from './location.service';
