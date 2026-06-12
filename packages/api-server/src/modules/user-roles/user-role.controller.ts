/**
 * UserRoles Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  UserRolesRowDto,
  UserRolesCreateData,
  UserRolesUpdateData,
} from './user-role.service';

export type IUserRolesControllerService = ICrudControllerService<
  UserRolesRowDto,
  UserRolesCreateData,
  UserRolesUpdateData
>;

@ApiTags('UserRoles')
export class BaseUserRolesController extends BaseCrudController<
  UserRolesRowDto,
  UserRolesCreateData,
  UserRolesUpdateData
> {
  constructor(service: IUserRolesControllerService) {
    super(service, 'user-roles');
  }
}
