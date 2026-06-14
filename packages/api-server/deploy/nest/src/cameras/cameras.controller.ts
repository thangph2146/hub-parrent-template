/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseCamerasController } from '../common/module-bases/cameras/camera.controller';
import { CamerasService } from './cameras.service';

@Permissions(PERMISSIONS.CAMERAS_VIEW)
@Controller(ADMIN_ROUTES.CAMERAS)
export class CamerasController extends BaseCamerasController {
  constructor(service: CamerasService) {
    super(service);
  }
}
