/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseAcademicYearsController } from '../common/module-bases/academic-years/academic-year.controller';
import { AcademicYearsService } from './academic-years.service';

@Permissions(PERMISSIONS.ACADEMIC_YEARS_VIEW)
@Controller(ADMIN_ROUTES.ACADEMIC_YEARS)
export class AcademicYearsController extends BaseAcademicYearsController {
  constructor(service: AcademicYearsService) {
    super(service);
  }
}
