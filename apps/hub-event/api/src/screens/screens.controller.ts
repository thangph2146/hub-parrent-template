/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseScreensController as PackageScreensController } from '@workspace/api-server/modules/screens';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { ScreensService } from './screens.service';

@ApiTags('Screens')
@Controller(ADMIN_ROUTES.SCREENS)
@Permissions(PERMISSIONS.SCREENS_VIEW)
export class ScreensController extends PackageScreensController {
  constructor(@Inject(ScreensService) screensService: ScreensService) {
    super(screensService);
  }
}
