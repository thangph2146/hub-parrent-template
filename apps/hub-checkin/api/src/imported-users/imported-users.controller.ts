/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseImportedUsersController } from '../common/module-bases/imported-users/imported-user.controller';
import { ImportedUsersService } from './imported-users.service';

@Permissions(PERMISSIONS.IMPORTED_USERS_VIEW)
@Controller(ADMIN_ROUTES.IMPORTED_USERS)
export class ImportedUsersController extends BaseImportedUsersController {
  constructor(service: ImportedUsersService) {
    super(service);
  }
}
