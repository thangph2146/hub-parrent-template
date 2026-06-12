/**
 * Accounts Controller.
 *
 * Bám sát pattern của `apps/main/api/src/accounts/accounts.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /accounts              - list
 *   GET    /accounts/:id          - getById
 *   POST   /accounts              - create
 *   PUT    /accounts/:id          - update
 *   DELETE /accounts/:id          - softDelete
 *   POST   /accounts/:id/restore  - restore
 *   DELETE /accounts/:id/hard     - hardDelete
 *   POST   /accounts/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  AccountsRowDto,
  AccountsCreateData,
  AccountsUpdateData,
} from './account.service';

export type IAccountsControllerService = ICrudControllerService<
  AccountsRowDto,
  AccountsCreateData,
  AccountsUpdateData
>;

@ApiTags('Accounts')
export class BaseAccountsController extends BaseCrudController<
  AccountsRowDto,
  AccountsCreateData,
  AccountsUpdateData
> {
  constructor(service: IAccountsControllerService) {
    super(service, 'accounts');
  }
}
