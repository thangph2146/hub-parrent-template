/**
 * Groups Module.
 *
 * Bám sát pattern của `apps/main/api/src/groups/groups.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseGroupsController } from './group.controller';

@Module({})
export class BaseGroupsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseGroupsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseGroupsController } from './group.controller';
export {
  BaseGroupsService,
  type CreateGroupInput,
  type ListGroupsInput,
  type GroupWithMembersDto,
  type GroupMessageDto,
} from './group.service';
