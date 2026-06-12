/**
 * GroupMembers Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  GroupMembersRowDto,
  GroupMembersCreateData,
  GroupMembersUpdateData,
} from './group-member.service';

export type IGroupMembersControllerService = ICrudControllerService<
  GroupMembersRowDto,
  GroupMembersCreateData,
  GroupMembersUpdateData
>;

@ApiTags('GroupMembers')
export class BaseGroupMembersController extends BaseCrudController<
  GroupMembersRowDto,
  GroupMembersCreateData,
  GroupMembersUpdateData
> {
  constructor(service: IGroupMembersControllerService) {
    super(service, 'group-members');
  }
}
