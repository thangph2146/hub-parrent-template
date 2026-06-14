/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseMajorsController } from '../common/module-bases/majors/major.controller';
import { MajorsService } from './majors.service';

@Permissions(PERMISSIONS.MAJORS_VIEW)
@Controller(ADMIN_ROUTES.MAJORS)
export class MajorsController extends BaseMajorsController {
  constructor(service: MajorsService) {
    super(service);
  }
}
