/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Screens Controller.
 *
 * Bám sát pattern của `apps/main/api/src/screens/screens.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /screens              - list
 *   GET    /screens/:id          - getById
 *   POST   /screens              - create
 *   PUT    /screens/:id          - update
 *   DELETE /screens/:id          - softDelete
 *   POST   /screens/:id/restore  - restore
 *   DELETE /screens/:id/hard     - hardDelete
 *   POST   /screens/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import type {
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData,
} from './screen.service';

export type IScreensControllerService = ICrudControllerService<
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData
>;

@ApiTags('Screens')
export class BaseScreensController extends BaseCrudController<
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData
> {
  constructor(service: IScreensControllerService) {
    super(service, 'screens');
  }
}
