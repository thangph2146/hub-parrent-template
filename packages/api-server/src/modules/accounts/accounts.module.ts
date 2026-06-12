/**
 * Accounts Module.
 *
 * Bám sát pattern của `apps/main/api/src/accounts/accounts.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAccountsController } from './account.controller';

@Module({})
export class BaseAccountsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseAccountsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseAccountsController } from './account.controller';
export {
  BaseAccountsService,
  type AccountsRowDto,
  type AccountsCreateData,
  type AccountsUpdateData,
} from './account.service';
