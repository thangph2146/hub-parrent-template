/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseEventSpeakersController as PackageEventSpeakersController } from '@workspace/api-server/modules/event-speakers';
import { EventSpeakersService } from './event-speakers.service';

export class EventSpeakersController extends PackageEventSpeakersController {
  constructor(
    @Inject(EventSpeakersService) eventSpeakersService: EventSpeakersService,
  ) {
    super(eventSpeakersService);
  }
}
