/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseTemplatesController } from '../common/module-bases/templates/template.controller';
import { TemplatesService } from './templates.service';

@Permissions(PERMISSIONS.TEMPLATES_VIEW)
@Controller(ADMIN_ROUTES.TEMPLATES)
export class TemplatesController extends BaseTemplatesController {
  constructor(service: TemplatesService) {
    super(service);
  }
}
