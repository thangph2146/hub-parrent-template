import type { EntityName } from '@mikro-orm/core';
import type { EventRegistrationRowDto } from './event-registrations.service';
import type { EventAttendanceSocketPayload } from './event-registration-attendance.types';

export interface EventRegistrationAttendanceDeps {
  eventEntity: EntityName<Record<string, unknown>>;
  eventRegistrationEntity: EntityName<Record<string, unknown>>;
  getRegistrationById(id: string): Promise<EventRegistrationRowDto | null>;
  emitAttendance(payload: EventAttendanceSocketPayload): void;
}
