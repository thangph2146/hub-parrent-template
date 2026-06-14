/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseCoursesController } from '../common/module-bases/courses/course.controller';
import { CoursesService } from './courses.service';

@Permissions(PERMISSIONS.COURSES_VIEW)
@Controller(ADMIN_ROUTES.COURSES)
export class CoursesController extends BaseCoursesController {
  constructor(service: CoursesService) {
    super(service);
  }
}
