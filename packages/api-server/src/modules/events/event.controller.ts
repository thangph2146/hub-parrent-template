/**
 * Events Controller.
 *
 * Bám sát pattern của `apps/main/api/src/events/events.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /events              - list
 *   GET    /events/:id          - getById
 *   POST   /events              - create
 *   PUT    /events/:id          - update
 *   DELETE /events/:id          - softDelete
 *   POST   /events/:id/restore  - restore
 *   DELETE /events/:id/hard     - hardDelete
 *   POST   /events/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  EventsRowDto,
  EventsCreateData,
  EventsUpdateData,
} from './event.service';

export type IEventsControllerService = ICrudControllerService<
  EventsRowDto,
  EventsCreateData,
  EventsUpdateData
>;

@ApiTags('Events')
export class BaseEventsController extends BaseCrudController<
  EventsRowDto,
  EventsCreateData,
  EventsUpdateData
> {
  constructor(service: IEventsControllerService) {
    super(service, 'events');
  }
}
