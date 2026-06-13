/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseAccountsController as PackageAccountsController } from '@workspace/api-server/modules/accounts';
import { UploadsService } from '../uploads/uploads.service';
import { AccountsService } from './accounts.service';

export class AccountsController extends PackageAccountsController {
  constructor(
    @Inject(AccountsService) accountsService: AccountsService,
    @Inject(UploadsService) uploadsService: UploadsService,
  ) {
    super(accountsService, uploadsService);
  }
}
