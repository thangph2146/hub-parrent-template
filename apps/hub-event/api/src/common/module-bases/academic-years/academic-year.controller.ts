/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * AcademicYears Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  AcademicYearsRowDto,
  AcademicYearsCreateData,
  AcademicYearsUpdateData,
} from './academic-year.service';

export type IAcademicYearsControllerService = ICrudControllerService<
  AcademicYearsRowDto,
  AcademicYearsCreateData,
  AcademicYearsUpdateData
>;

@ApiTags('AcademicYears')
export class BaseAcademicYearsController extends BaseCrudController<
  AcademicYearsRowDto,
  AcademicYearsCreateData,
  AcademicYearsUpdateData
> {
  constructor(service: IAcademicYearsControllerService) {
    super(service, 'academic-years');
  }
}
