/**
 * Groups Module barrel export.
 */
export {
  BaseGroupsService,
  BaseGroupsController,
  BaseGroupsModule,
} from './groups.module';

export type {
  CreateGroupInput,
  ListGroupsInput,
  GroupWithMembersDto,
  GroupMessageDto,
} from './group.service';
