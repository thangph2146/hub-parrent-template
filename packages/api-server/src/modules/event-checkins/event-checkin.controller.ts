/**
 * EventCheckins Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  EventCheckinsRowDto,
  EventCheckinsCreateData,
  EventCheckinsUpdateData,
} from './event-checkin.service';

export type IEventCheckinsControllerService = ICrudControllerService<
  EventCheckinsRowDto,
  EventCheckinsCreateData,
  EventCheckinsUpdateData
>;

@ApiTags('EventCheckins')
export class BaseEventCheckinsController extends BaseCrudController<
  EventCheckinsRowDto,
  EventCheckinsCreateData,
  EventCheckinsUpdateData
> {
  constructor(service: IEventCheckinsControllerService) {
    super(service, 'event-checkins');
  }
}
