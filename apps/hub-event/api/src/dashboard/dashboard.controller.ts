/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseDashboardController as PackageDashboardController } from '@workspace/api-server/modules/dashboard';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller(ADMIN_ROUTES.DASHBOARD)
@Permissions(PERMISSIONS.DASHBOARD_VIEW)
export class DashboardController extends PackageDashboardController {
  constructor(@Inject(DashboardService) dashboardService: DashboardService) {
    super(dashboardService);
  }
}
