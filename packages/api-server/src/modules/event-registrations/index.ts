/**
 * EventRegistrations Module barrel export.
 */
export {
  BaseEventRegistrationsService,
  BaseEventRegistrationsController,
  BaseEventRegistrationsModule,
} from './event-registration.module';

export type {
  EventRegistrationsRowDto,
  EventRegistrationsCreateData,
  EventRegistrationsUpdateData,
} from './event-registration.service';

export { BaseEventRegistrationsAdminService } from './event-registrations-admin.service';
export type {
  EventRegistrationRowDto,
  ListEventRegistrationsParams,
  ListEventRegistrationsResult,
  PublicEventRegistrantDto,
} from './event-registrations-admin.service';

export type {
  ManualAttendanceAction,
  IEventRegistrationsControllerService,
} from './event-registration.controller';

export { BaseEventRegistrationAttendanceService } from './event-registration-attendance.service';
export type { EventRegistrationAttendanceDeps } from './event-registration-attendance.deps';
export type {
  AttendanceSource,
  ApplyAttendanceResult,
  EventAttendanceSocketPayload,
  AttendanceRegistrationRow,
} from './event-registration-attendance.types';
export {
  REGISTRATION_STATUS,
  ATTENDANCE_STATUS,
  CHECKIN_METHOD,
} from './event-registration-attendance.types';
