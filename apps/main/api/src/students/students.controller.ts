/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { ADMIN_ROUTES } from '../config/constants';
import { PERMISSIONS } from '../config/permissions';
import { Permissions } from '../common/permissions.decorator';
import { BaseStudentsController } from '../common/module-bases/students/student.controller';
import { StudentsService } from './students.service';

@Permissions(PERMISSIONS.STUDENTS_VIEW)
@Controller(ADMIN_ROUTES.STUDENTS)
export class StudentsController extends BaseStudentsController {
  constructor(service: StudentsService) {
    super(service);
  }
}
