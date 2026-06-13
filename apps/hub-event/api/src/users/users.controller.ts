/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseUsersController as PackageUsersController } from '@workspace/api-server/modules/users';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller(ADMIN_ROUTES.USERS)
@Permissions(PERMISSIONS.USERS_VIEW)
export class UsersController extends PackageUsersController {
  constructor(@Inject(UsersService) usersService: UsersService) {
    super(usersService);
  }
}
