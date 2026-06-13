/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseLocationsController as PackageLocationsController } from '@workspace/api-server/modules/locations';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Controller(ADMIN_ROUTES.LOCATIONS)
@Permissions(PERMISSIONS.LOCATIONS_VIEW)
export class LocationsController extends PackageLocationsController {
  constructor(@Inject(LocationsService) locationsService: LocationsService) {
    super(locationsService);
  }
}
