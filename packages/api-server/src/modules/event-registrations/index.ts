/**
 * EventRegistrations module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseEventRegistrationsService,
  BaseEventRegistrationsService as BaseEventRegistrationsAdminService,
} from './event-registrations.service';
export {
  BaseEventRegistrationsController,
  BaseEventRegistrationsController as BaseEventRegistrationsAdminController,
} from './event-registrations.controller';
export type { IEventRegistrationsControllerService } from './event-registrations.controller';
/** @deprecated Dùng `IEventRegistrationsControllerService`. */
export type { IEventRegistrationsControllerService as IEventRegistrationsAdminControllerService } from './event-registrations.controller';
export type {
  EventRegistrationRowDto,
  ListEventRegistrationsParams,
  ListEventRegistrationsResult,
  PublicEventRegistrantDto,
} from './event-registrations.service';
export { BaseEventRegistrationAttendanceService } from './event-registration-attendance.service';
export type { AttendanceSource, ManualAttendanceAction, ApplyAttendanceResult } from './event-registration-attendance.types';
export { BaseEventRegistrationsModule } from './event-registrations.module';
