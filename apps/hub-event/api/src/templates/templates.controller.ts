/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseTemplatesController as PackageTemplatesController } from '@workspace/api-server/modules/templates';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@Controller(ADMIN_ROUTES.TEMPLATES)
@Permissions(PERMISSIONS.TEMPLATES_VIEW)
export class TemplatesController extends PackageTemplatesController {
  constructor(@Inject(TemplatesService) templatesService: TemplatesService) {
    super(templatesService);
  }
}
