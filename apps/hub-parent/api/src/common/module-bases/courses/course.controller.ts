/**
 * Courses Controller.
 *
 * Bám sát pattern của `apps/main/api/src/courses/courses.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /courses              - list
 *   GET    /courses/:id          - getById
 *   POST   /courses              - create
 *   PUT    /courses/:id          - update
 *   DELETE /courses/:id          - softDelete
 *   POST   /courses/:id/restore  - restore
 *   DELETE /courses/:id/hard     - hardDelete
 *   POST   /courses/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  CoursesRowDto,
  CoursesCreateData,
  CoursesUpdateData,
} from './course.service';

export type ICoursesControllerService = ICrudControllerService<
  CoursesRowDto,
  CoursesCreateData,
  CoursesUpdateData
>;

@ApiTags('Courses')
export class BaseCoursesController extends BaseCrudController<
  CoursesRowDto,
  CoursesCreateData,
  CoursesUpdateData
> {
  constructor(service: ICoursesControllerService) {
    super(service, 'courses');
  }
}
