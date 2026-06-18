/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Majors Controller.
 *
 * Bám sát pattern của `apps/main/api/src/majors/majors.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /majors              - list
 *   GET    /majors/:id          - getById
 *   POST   /majors              - create
 *   PUT    /majors/:id          - update
 *   DELETE /majors/:id          - softDelete
 *   POST   /majors/:id/restore  - restore
 *   DELETE /majors/:id/hard     - hardDelete
 *   POST   /majors/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  MajorsRowDto,
  MajorsCreateData,
  MajorsUpdateData,
} from './major.service';

export type IMajorsControllerService = ICrudControllerService<
  MajorsRowDto,
  MajorsCreateData,
  MajorsUpdateData
>;

@ApiTags('Majors')
export class BaseMajorsController extends BaseCrudController<
  MajorsRowDto,
  MajorsCreateData,
  MajorsUpdateData
> {
  constructor(service: IMajorsControllerService) {
    super(service, 'majors');
  }
}
