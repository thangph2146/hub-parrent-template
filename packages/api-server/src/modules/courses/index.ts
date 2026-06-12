/**
 * Courses Module barrel export.
 */
export {
  BaseCoursesService,
  BaseCoursesController,
  BaseCoursesModule,
} from './courses.module';

export type { ICoursesControllerService } from './course.controller';

export type {
  CoursesRowDto,
  CoursesCreateData,
  CoursesUpdateData,
} from './course.service';
