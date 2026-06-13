/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseEventCheckinsController as PackageEventCheckinsController } from '@workspace/api-server/modules/event-checkins';
import { EventCheckinsService } from './event-checkins.service';

export class EventCheckinsController extends PackageEventCheckinsController {
  constructor(
    @Inject(EventCheckinsService) eventCheckinsService: EventCheckinsService,
  ) {
    super(eventCheckinsService);
  }
}
