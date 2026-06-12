/**
 * Groups Module barrel export.
 */
export {
  BaseGroupsService,
  BaseGroupsController,
  BaseGroupsModule,
} from './groups.module';

export type { IGroupsControllerService } from './group.controller';

export type {
  GroupsRowDto,
  GroupsCreateData,
  GroupsUpdateData,
} from './group.service';
