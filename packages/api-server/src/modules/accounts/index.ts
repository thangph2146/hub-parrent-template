/**
 * Accounts Module barrel export.
 */
export {
  BaseAccountsService,
  BaseAccountsController,
  BaseAccountsModule,
} from './accounts.module';

export type { IAccountsControllerService } from './account.controller';

export type {
  AccountsRowDto,
  AccountsCreateData,
  AccountsUpdateData,
} from './account.service';
