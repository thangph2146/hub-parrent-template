/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseDashboardController } from '../common/module-bases/dashboard/dashboard.controller';
import { DashboardService } from './dashboard.service';

@Permissions(PERMISSIONS.DASHBOARD_VIEW)
@Controller(ADMIN_ROUTES.DASHBOARD)
export class DashboardController extends BaseDashboardController {
  constructor(service: DashboardService) {
    super(service);
  }
}
