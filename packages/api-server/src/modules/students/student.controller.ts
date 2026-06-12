/**
 * Students Controller.
 *
 * Bám sát pattern của `apps/main/api/src/students/students.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /students              - list
 *   GET    /students/:id          - getById
 *   POST   /students              - create
 *   PUT    /students/:id          - update
 *   DELETE /students/:id          - softDelete
 *   POST   /students/:id/restore  - restore
 *   DELETE /students/:id/hard     - hardDelete
 *   POST   /students/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  StudentsRowDto,
  StudentsCreateData,
  StudentsUpdateData,
} from './student.service';

export type IStudentsControllerService = ICrudControllerService<
  StudentsRowDto,
  StudentsCreateData,
  StudentsUpdateData
>;

@ApiTags('Students')
export class BaseStudentsController extends BaseCrudController<
  StudentsRowDto,
  StudentsCreateData,
  StudentsUpdateData
> {
  constructor(service: IStudentsControllerService) {
    super(service, 'students');
  }
}
