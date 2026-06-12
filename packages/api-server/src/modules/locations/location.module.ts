/**
 * Locations Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseLocationsController } from './location.controller';

@Module({})
export class BaseLocationsModule {
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
