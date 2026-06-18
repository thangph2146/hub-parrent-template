/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseEventCheckinsController } from '../common/module-bases/event-checkins/event-checkins.controller';
import { EventCheckinsService } from './event-checkins.service';

@Permissions(PERMISSIONS.EVENT_CHECKINS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_CHECKINS)
export class EventCheckinsController extends BaseEventCheckinsController {
  constructor(service: EventCheckinsService) {
    super(service);
  }
}
