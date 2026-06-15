/**
 * Roles Module.
 *
 * Bám sát pattern của `apps/main/api/src/roles/roles.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseRolesController } from './role.controller';

@Module({})
export class BaseRolesModule {
  /**
   * Configure module với metadata bổ sung.
   */
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
