/**
 * Roles Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseRolesController } from './role.controller';

@Module({})
export class BaseRolesModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseRolesController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseRolesController } from './role.controller';
export {
  BaseRolesService,
  type RolesRowDto,
  type RolesCreateData,
  type RolesUpdateData,
} from './role.service';
