/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { UploadsService } from '../uploads/uploads.service';
import { BaseAccountsController } from '../common/module-bases/accounts/accounts.controller';
import { AccountsService } from './accounts.service';

@Permissions(PERMISSIONS.ACCOUNTS_VIEW)
@Controller(ADMIN_ROUTES.ACCOUNTS)
export class AccountsController extends BaseAccountsController {
  constructor(service: AccountsService, uploadsService: UploadsService) {
    super(service, uploadsService);
  }
}
