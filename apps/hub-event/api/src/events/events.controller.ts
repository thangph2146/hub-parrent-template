/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseEventsController as PackageEventsController } from '@workspace/api-server/modules/events';
import { EventsService } from './events.service';

export class EventsController extends PackageEventsController {
  constructor(@Inject(EventsService) eventsService: EventsService) {
    super(eventsService);
  }
}
