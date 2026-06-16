/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Departments Controller.
 *
 * Bám sát pattern của `apps/main/api/src/departments/departments.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /departments              - list
 *   GET    /departments/:id          - getById
 *   POST   /departments              - create
 *   PUT    /departments/:id          - update
 *   DELETE /departments/:id          - softDelete
 *   POST   /departments/:id/restore  - restore
 *   DELETE /departments/:id/hard     - hardDelete
 *   POST   /departments/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  DepartmentsRowDto,
  DepartmentsCreateData,
  DepartmentsUpdateData,
} from './department.service';

export type IDepartmentsControllerService = ICrudControllerService<
  DepartmentsRowDto,
  DepartmentsCreateData,
  DepartmentsUpdateData
>;

@ApiTags('Departments')
export class BaseDepartmentsController extends BaseCrudController<
  DepartmentsRowDto,
  DepartmentsCreateData,
  DepartmentsUpdateData
> {
  constructor(service: IDepartmentsControllerService) {
    super(service, 'departments');
  }
}
