/**
 * Accounts Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAccountsController } from './account.controller';

@Module({})
export class BaseAccountsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseAccountsController],
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
