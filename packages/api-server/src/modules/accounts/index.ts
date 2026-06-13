/**
 * Accounts module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseAccountsService,
  BaseAccountsService as BaseAccountsAdminService,
} from './accounts.service';
export {
  BaseAccountsController,
  BaseAccountsController as BaseAccountsAdminController,
} from './accounts.controller';
export type { IAccountsControllerService } from './accounts.controller';
/** @deprecated Dùng `IAccountsControllerService`. */
export type { IAccountsControllerService as IAccountsAdminControllerService } from './accounts.controller';
export type {
  AccountProfileDto,
  UpdateAccountDto,
  UpdateAccountResult,
} from './accounts.service';
export { BaseAccountsModule } from './accounts.module';
