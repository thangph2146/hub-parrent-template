/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseSettingsController as PackageSettingsController } from '@workspace/api-server/modules/settings';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller(ADMIN_ROUTES.SETTINGS)
@Permissions(PERMISSIONS.SETTINGS_VIEW)
export class SettingsController extends PackageSettingsController {
  constructor(@Inject(SettingsService) settingsService: SettingsService) {
    super(settingsService);
  }
}
