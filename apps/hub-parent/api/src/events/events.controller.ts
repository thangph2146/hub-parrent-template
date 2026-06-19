/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseEventsController } from '../common/module-bases/events/events.controller';
import { EventsService } from './events.service';

@Permissions(PERMISSIONS.EVENTS_VIEW)
@Controller(ADMIN_ROUTES.EVENTS)
export class EventsController extends BaseEventsController {
  constructor(service: EventsService) {
    super(service);
  }
}
