/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { EventRegistrationAttendanceService } from './event-registration-attendance.service';
import { Controller } from '@nestjs/common';
import { PERMISSIONS } from '../config/permissions';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { BaseEventRegistrationsController } from '../common/module-bases/event-registrations/event-registrations.controller';
import { EventRegistrationsService } from './event-registrations.service';

@Permissions(PERMISSIONS.EVENT_REGISTRATIONS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_REGISTRATIONS)
export class EventRegistrationsController extends BaseEventRegistrationsController {
  constructor(
    eventRegistrationsService: EventRegistrationsService,
    attendanceService: EventRegistrationAttendanceService,
  ) {
    super(eventRegistrationsService, attendanceService);
  }
}
