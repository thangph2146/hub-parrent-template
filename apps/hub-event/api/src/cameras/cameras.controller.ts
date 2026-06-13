/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseCamerasController as PackageCamerasController } from '@workspace/api-server/modules/cameras';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { CamerasService } from './cameras.service';

@ApiTags('Cameras')
@Controller(ADMIN_ROUTES.CAMERAS)
@Permissions(PERMISSIONS.CAMERAS_VIEW)
export class CamerasController extends PackageCamerasController {
  constructor(@Inject(CamerasService) camerasService: CamerasService) {
    super(camerasService);
  }
}
