/**
 * GroupMembers Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseGroupMembersController } from './group-member.controller';

@Module({})
export class BaseGroupMembersModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [...(metadata.controllers ?? []), BaseGroupMembersController],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseGroupMembersController } from './group-member.controller';
export {
  BaseGroupMembersService,
  type GroupMembersRowDto,
  type GroupMembersCreateData,
  type GroupMembersUpdateData,
} from './group-member.service';
