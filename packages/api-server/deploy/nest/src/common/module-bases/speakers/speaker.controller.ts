/**
 * Speakers Controller.
 *
 * Bám sát pattern của `apps/main/api/src/speakers/speakers.controller.ts`.
 * Extend `BaseCrudController` từ `src/common/crud`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /speakers              - list
 *   GET    /speakers/:id          - getById
 *   POST   /speakers              - create
 *   PUT    /speakers/:id          - update
 *   DELETE /speakers/:id          - softDelete
 *   POST   /speakers/:id/restore  - restore
 *   DELETE /speakers/:id/hard     - hardDelete
 *   POST   /speakers/bulk         - bulk action
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../crud';
import type {
  SpeakersRowDto,
  SpeakersCreateData,
  SpeakersUpdateData,
} from './speaker.service';

export type ISpeakersControllerService = ICrudControllerService<
  SpeakersRowDto,
  SpeakersCreateData,
  SpeakersUpdateData
>;

@ApiTags('Speakers')
export class BaseSpeakersController extends BaseCrudController<
  SpeakersRowDto,
  SpeakersCreateData,
  SpeakersUpdateData
> {
  constructor(service: ISpeakersControllerService) {
    super(service, 'speakers');
  }
}
