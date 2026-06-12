/**
 * AcademicYears Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
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
