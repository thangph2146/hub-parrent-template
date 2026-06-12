/**
 * UserRoles Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseUserRolesController } from './user-role.controller';

@Module({})
export class BaseUserRolesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseUserRolesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseUserRolesController } from './user-role.controller';
export {
  BaseUserRolesService,
  type UserRolesRowDto,
  type UserRolesCreateData,
  type UserRolesUpdateData,
} from './user-role.service';
