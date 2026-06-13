/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { BaseEventCheckoutsController as PackageEventCheckoutsController } from '@workspace/api-server/modules/event-checkouts';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Controller } from '@nestjs/common';
import { EventCheckoutsService } from './event-checkouts.service';

@ApiTags('EventCheckouts')
@Controller(ADMIN_ROUTES.EVENT_CHECKOUTS)
@Permissions(PERMISSIONS.EVENT_CHECKOUTS_VIEW)
export class EventCheckoutsController extends PackageEventCheckoutsController {
  constructor(
    @Inject(EventCheckoutsService) eventCheckoutsService: EventCheckoutsService,
  ) {
    super(eventCheckoutsService);
  }
}
