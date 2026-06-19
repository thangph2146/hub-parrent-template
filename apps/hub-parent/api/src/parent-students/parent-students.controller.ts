/** AUTO-GENERATED — extends Base* parent-students (local module-bases). */
import { Controller } from '@nestjs/common';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import {
  BaseParentStudentsController,
  BaseParentMyStudentsController,
} from '../common/module-bases/parent-students/parent-student.controller';
import { ParentStudentsService } from './parent-students.service';

@Permissions(PERMISSIONS.PARENT_STUDENTS_VIEW)
@Controller(ADMIN_ROUTES.PARENT_STUDENTS)
export class ParentStudentsAdminController extends BaseParentStudentsController {
  constructor(svc: ParentStudentsService) {
    super(svc);
  }
}

@Controller()
export class ParentStudentsPublicController extends BaseParentMyStudentsController {
  constructor(svc: ParentStudentsService) {
    super(svc);
  }
}
