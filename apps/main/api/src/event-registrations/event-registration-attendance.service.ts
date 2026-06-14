/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventRegistrationAttendanceService } from '../common/module-bases/event-registrations/event-registration-attendance.service';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { EventRegistrationsService } from './event-registrations.service';

export type {
  AttendanceSource,
  ManualAttendanceAction,
  ApplyAttendanceResult,
} from '../common/module-bases/event-registrations/event-registration-attendance.types';

@Injectable()
export class EventRegistrationAttendanceService extends BaseEventRegistrationAttendanceService {
  constructor(
    em: EntityManager,
    socketGateway: SocketGateway,
    eventRegistrationsService: EventRegistrationsService,
  ) {
    super(em, {
      eventEntity: Event,
      eventRegistrationEntity: EventRegistration,
      getRegistrationById: (id) => eventRegistrationsService.getById(id),
      emitAttendance: (payload) =>
        socketGateway.emitEventAttendance(
          payload as import('../socket/socket.types').EventAttendanceSocketPayload,
        ),
    });
  }
}
