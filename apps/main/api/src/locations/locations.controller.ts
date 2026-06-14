/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseLocationsController } from '../common/module-bases/locations/location.controller';
import { LocationsService } from './locations.service';

@Permissions(PERMISSIONS.LOCATIONS_VIEW)
@Controller(ADMIN_ROUTES.LOCATIONS)
export class LocationsController extends BaseLocationsController {
  constructor(service: LocationsService) {
    super(service);
  }
}
