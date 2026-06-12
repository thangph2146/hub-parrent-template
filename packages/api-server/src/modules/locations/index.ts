/**
 * Locations Module barrel export.
 */
export {
  BaseLocationsService,
  BaseLocationsController,
  BaseLocationsModule,
} from './locations.module';

export type { ILocationsControllerService } from './location.controller';

export type {
  LocationsRowDto,
  LocationsCreateData,
  LocationsUpdateData,
} from './location.service';
