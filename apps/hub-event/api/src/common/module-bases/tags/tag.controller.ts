/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Tags Controller.
 *
 * Bám sát pattern của `apps/main/api/src/tags/tags.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /tags              - list
 *   GET    /tags/:id          - getById
 *   POST   /tags              - create
 *   PUT    /tags/:id          - update
 *   DELETE /tags/:id          - softDelete
 *   POST   /tags/:id/restore  - restore
 *   DELETE /tags/:id/hard     - hardDelete
 *   POST   /tags/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  TagsRowDto,
  TagsCreateData,
  TagsUpdateData,
} from './tag.service';

export type ITagsControllerService = ICrudControllerService<
  TagsRowDto,
  TagsCreateData,
  TagsUpdateData
>;

@ApiTags('Tags')
export class BaseTagsController extends BaseCrudController<
  TagsRowDto,
  TagsCreateData,
  TagsUpdateData
> {
  constructor(service: ITagsControllerService) {
    super(service, 'tags');
  }
}
