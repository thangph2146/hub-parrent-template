/**
 * Groups Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseGroupsController } from './group.controller';

@Module({})
export class BaseGroupsModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseGroupsController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseGroupsController } from './group.controller';
export {
  BaseGroupsService,
  type GroupsRowDto,
  type GroupsCreateData,
  type GroupsUpdateData,
} from './group.service';
