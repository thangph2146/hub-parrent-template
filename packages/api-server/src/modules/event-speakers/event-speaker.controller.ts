/**
 * EventSpeakers Controller.
 */
import { ApiTags } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import type {
  EventSpeakersRowDto,
  EventSpeakersCreateData,
  EventSpeakersUpdateData,
} from './event-speaker.service';

export type IEventSpeakersControllerService = ICrudControllerService<
  EventSpeakersRowDto,
  EventSpeakersCreateData,
  EventSpeakersUpdateData
>;

@ApiTags('EventSpeakers')
export class BaseEventSpeakersController extends BaseCrudController<
  EventSpeakersRowDto,
  EventSpeakersCreateData,
  EventSpeakersUpdateData
> {
  constructor(service: IEventSpeakersControllerService) {
    super(service, 'event-speakers');
  }
}
