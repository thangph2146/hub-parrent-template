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

export type {
  ManualAttendanceAction,
  IEventRegistrationsControllerService,
} from './event-registration.controller';
