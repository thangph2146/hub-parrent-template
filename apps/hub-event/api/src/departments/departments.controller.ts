/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseDepartmentsController } from '../common/module-bases/departments/department.controller';
import { DepartmentsService } from './departments.service';

@Permissions(PERMISSIONS.DEPARTMENTS_VIEW)
@Controller(ADMIN_ROUTES.DEPARTMENTS)
export class DepartmentsController extends BaseDepartmentsController {
  constructor(service: DepartmentsService) {
    super(service);
  }
}
