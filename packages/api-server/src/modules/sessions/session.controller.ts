/**
 * Sessions Controller.
 *
 * Bám sát pattern của `apps/main/api/src/sessions/sessions.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /sessions              - list
 *   GET    /sessions/:id          - getById
 *   POST   /sessions              - create
 *   PUT    /sessions/:id          - update
 *   DELETE /sessions/:id          - softDelete
 *   POST   /sessions/:id/restore  - restore
 *   DELETE /sessions/:id/hard     - hardDelete
 *   POST   /sessions/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  SessionsRowDto,
  SessionsCreateData,
  SessionsUpdateData,
} from './session.service';

export type ISessionsControllerService = ICrudControllerService<
  SessionsRowDto,
  SessionsCreateData,
  SessionsUpdateData
>;

@ApiTags('Sessions')
export class BaseSessionsController extends BaseCrudController<
  SessionsRowDto,
  SessionsCreateData,
  SessionsUpdateData
> {
  constructor(service: ISessionsControllerService) {
    super(service, 'sessions');
  }
}
