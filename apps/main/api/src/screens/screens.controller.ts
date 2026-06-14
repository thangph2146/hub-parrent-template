/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseScreensController } from '../common/module-bases/screens/screen.controller';
import { ScreensService } from './screens.service';

@Permissions(PERMISSIONS.SCREENS_VIEW)
@Controller(ADMIN_ROUTES.SCREENS)
export class ScreensController extends BaseScreensController {
  constructor(service: ScreensService) {
    super(service);
  }
}
