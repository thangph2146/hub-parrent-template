/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại hub-event/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common';
import { PERMISSIONS } from '../config/permissions';
import { BaseUsersController } from '../common/module-bases/users/users.controller';
import { UploadsService } from '../uploads/uploads.service';
import { UsersService } from './users.service';

@Permissions(PERMISSIONS.USERS_VIEW)
@Controller(ADMIN_ROUTES.USERS)
export class UsersController extends BaseUsersController {
  constructor(service: UsersService, uploadsService: UploadsService) {
    super(service, uploadsService);
  }
}
