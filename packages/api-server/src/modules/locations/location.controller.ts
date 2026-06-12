/**
 * Locations Controller.
 *
 * Bám sát pattern của `apps/main/api/src/locations/locations.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /locations              - list
 *   GET    /locations/:id          - getById
 *   POST   /locations              - create
 *   PUT    /locations/:id          - update
 *   DELETE /locations/:id          - softDelete
 *   POST   /locations/:id/restore  - restore
 *   DELETE /locations/:id/hard     - hardDelete
 *   POST   /locations/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  LocationsRowDto,
  LocationsCreateData,
  LocationsUpdateData,
} from './location.service';

export type ILocationsControllerService = ICrudControllerService<
  LocationsRowDto,
  LocationsCreateData,
  LocationsUpdateData
>;

@ApiTags('Locations')
export class BaseLocationsController extends BaseCrudController<
  LocationsRowDto,
  LocationsCreateData,
  LocationsUpdateData
> {
  constructor(service: ILocationsControllerService) {
    super(service, 'locations');
  }
}
