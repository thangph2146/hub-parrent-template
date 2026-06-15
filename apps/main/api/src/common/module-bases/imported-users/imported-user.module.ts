/**
 * ImportedUsers Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseImportedUsersController } from './imported-user.controller';

@Module({})
export class BaseImportedUsersModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseImportedUsersController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseImportedUsersController } from './imported-user.controller';
export {
  BaseImportedUsersService,
  type ImportedUsersRowDto,
  type ImportedUsersCreateData,
  type ImportedUsersUpdateData,
} from './imported-user.service';
