/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseEventCheckoutsController } from '../common/module-bases/event-checkouts/event-checkout.controller';
import { EventCheckoutsService } from './event-checkouts.service';

@Permissions(PERMISSIONS.EVENT_CHECKOUTS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_CHECKOUTS)
export class EventCheckoutsController extends BaseEventCheckoutsController {
  constructor(service: EventCheckoutsService) {
    super(service);
  }
}
