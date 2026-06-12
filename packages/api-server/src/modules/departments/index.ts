/**
 * Departments Module barrel export.
 */
export {
  BaseDepartmentsService,
  BaseDepartmentsController,
  BaseDepartmentsModule,
} from './departments.module';

export type { IDepartmentsControllerService } from './department.controller';

export type {
  DepartmentsRowDto,
  DepartmentsCreateData,
  DepartmentsUpdateData,
} from './department.service';
