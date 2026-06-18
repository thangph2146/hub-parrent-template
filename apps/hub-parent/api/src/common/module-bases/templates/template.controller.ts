/**
 * Templates Controller.
 *
 * Bám sát pattern của `apps/main/api/src/templates/templates.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /templates              - list
 *   GET    /templates/:id          - getById
 *   POST   /templates              - create
 *   PUT    /templates/:id          - update
 *   DELETE /templates/:id          - softDelete
 *   POST   /templates/:id/restore  - restore
 *   DELETE /templates/:id/hard     - hardDelete
 *   POST   /templates/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  TemplatesRowDto,
  TemplatesCreateData,
  TemplatesUpdateData,
} from './template.service';

export type ITemplatesControllerService = ICrudControllerService<
  TemplatesRowDto,
  TemplatesCreateData,
  TemplatesUpdateData
>;

@ApiTags('Templates')
export class BaseTemplatesController extends BaseCrudController<
  TemplatesRowDto,
  TemplatesCreateData,
  TemplatesUpdateData
> {
  constructor(service: ITemplatesControllerService) {
    super(service, 'templates');
  }
}
