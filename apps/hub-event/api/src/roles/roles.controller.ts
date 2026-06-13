/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseRolesController as PackageRolesController } from '@workspace/api-server/modules/roles';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller(ADMIN_ROUTES.ROLES)
@Permissions(PERMISSIONS.ROLES_VIEW)
export class RolesController extends PackageRolesController {
  constructor(@Inject(RolesService) rolesService: RolesService) {
    super(rolesService);
  }
}
