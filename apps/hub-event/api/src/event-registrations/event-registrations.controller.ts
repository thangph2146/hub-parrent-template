/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Inject } from '@nestjs/common';
import { BaseEventRegistrationsController as PackageEventRegistrationsController } from '@workspace/api-server/modules/event-registrations';
import { EventRegistrationAttendanceService } from './event-registration-attendance.service';
import { EventRegistrationsService } from './event-registrations.service';

export class EventRegistrationsController extends PackageEventRegistrationsController {
  constructor(
    @Inject(EventRegistrationsService)
    eventRegistrationsService: EventRegistrationsService,
    @Inject(EventRegistrationAttendanceService)
    attendanceService: EventRegistrationAttendanceService,
  ) {
    super(eventRegistrationsService, attendanceService);
  }
}
