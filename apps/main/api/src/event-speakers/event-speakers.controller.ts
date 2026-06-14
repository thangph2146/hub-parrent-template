/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseEventSpeakersController } from '../common/module-bases/event-speakers/event-speakers.controller';
import { EventSpeakersService } from './event-speakers.service';

@Permissions(PERMISSIONS.EVENT_SPEAKERS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_SPEAKERS)
export class EventSpeakersController extends BaseEventSpeakersController {
  constructor(service: EventSpeakersService) {
    super(service);
  }
}
