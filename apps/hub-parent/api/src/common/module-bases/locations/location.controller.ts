/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Locations Controller.
 *
 * Bám sát pattern của `apps/main/api/src/locations/locations.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
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
} from '../../crud';
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
