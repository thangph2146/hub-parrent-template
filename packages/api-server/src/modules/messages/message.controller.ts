/**
 * Messages Controller.
 *
 * Bám sát pattern của `apps/main/api/src/messages/messages.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /messages              - list
 *   GET    /messages/:id          - getById
 *   POST   /messages              - create
 *   PUT    /messages/:id          - update
 *   DELETE /messages/:id          - softDelete
 *   POST   /messages/:id/restore  - restore
 *   DELETE /messages/:id/hard     - hardDelete
 *   POST   /messages/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  MessagesRowDto,
  MessagesCreateData,
  MessagesUpdateData,
} from './message.service';

export type IMessagesControllerService = ICrudControllerService<
  MessagesRowDto,
  MessagesCreateData,
  MessagesUpdateData
>;

@ApiTags('Messages')
export class BaseMessagesController extends BaseCrudController<
  MessagesRowDto,
  MessagesCreateData,
  MessagesUpdateData
> {
  constructor(service: IMessagesControllerService) {
    super(service, 'messages');
  }
}
