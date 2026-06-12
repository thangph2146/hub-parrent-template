/**
 * Groups Controller.
 *
 * Bám sát pattern của `apps/main/api/src/groups/groups.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /groups              - list
 *   GET    /groups/:id          - getById
 *   POST   /groups              - create
 *   PUT    /groups/:id          - update
 *   DELETE /groups/:id          - softDelete
 *   POST   /groups/:id/restore  - restore
 *   DELETE /groups/:id/hard     - hardDelete
 *   POST   /groups/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  GroupsRowDto,
  GroupsCreateData,
  GroupsUpdateData,
} from './group.service';

export type IGroupsControllerService = ICrudControllerService<
  GroupsRowDto,
  GroupsCreateData,
  GroupsUpdateData
>;

@ApiTags('Groups')
export class BaseGroupsController extends BaseCrudController<
  GroupsRowDto,
  GroupsCreateData,
  GroupsUpdateData
> {
  constructor(service: IGroupsControllerService) {
    super(service, 'groups');
  }
}
