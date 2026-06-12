/**
 * Notifications Controller.
 *
 * Bám sát pattern của `apps/main/api/src/notifications/notifications.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /notifications              - list
 *   GET    /notifications/:id          - getById
 *   POST   /notifications              - create
 *   PUT    /notifications/:id          - update
 *   DELETE /notifications/:id          - softDelete
 *   POST   /notifications/:id/restore  - restore
 *   DELETE /notifications/:id/hard     - hardDelete
 *   POST   /notifications/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  NotificationsRowDto,
  NotificationsCreateData,
  NotificationsUpdateData,
} from './notification.service';

export type INotificationsControllerService = ICrudControllerService<
  NotificationsRowDto,
  NotificationsCreateData,
  NotificationsUpdateData
>;

@ApiTags('Notifications')
export class BaseNotificationsController extends BaseCrudController<
  NotificationsRowDto,
  NotificationsCreateData,
  NotificationsUpdateData
> {
  constructor(service: INotificationsControllerService) {
    super(service, 'notifications');
  }
}
