/**
 * Accounts Module — NestJS wiring cho admin accounts.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAccountsController } from './accounts.controller';

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

export { BaseAccountsController } from './accounts.controller';
export {
  BaseAccountsService,
  type AccountProfileDto,
  type UpdateAccountDto,
  type UpdateAccountResult,
} from './accounts.service';
