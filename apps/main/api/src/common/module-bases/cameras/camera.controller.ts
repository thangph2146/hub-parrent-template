/**
 * Cameras Controller.
 *
 * Bám sát pattern của `apps/main/api/src/cameras/cameras.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /cameras              - list
 *   GET    /cameras/:id          - getById
 *   POST   /cameras              - create
 *   PUT    /cameras/:id          - update
 *   DELETE /cameras/:id          - softDelete
 *   POST   /cameras/:id/restore  - restore
 *   DELETE /cameras/:id/hard     - hardDelete
 *   POST   /cameras/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  CamerasRowDto,
  CamerasCreateData,
  CamerasUpdateData,
} from './camera.service';

export type ICamerasControllerService = ICrudControllerService<
  CamerasRowDto,
  CamerasCreateData,
  CamerasUpdateData
>;

@ApiTags('Cameras')
export class BaseCamerasController extends BaseCrudController<
  CamerasRowDto,
  CamerasCreateData,
  CamerasUpdateData
> {
  constructor(service: ICamerasControllerService) {
    super(service, 'cameras');
  }
}
