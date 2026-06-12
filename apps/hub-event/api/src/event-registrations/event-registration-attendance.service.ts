/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventRegistrationAttendanceService } from '@workspace/api-server/modules/event-registrations';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { EventRegistrationsService } from './event-registrations.service';

export type {
  AttendanceSource,
  ManualAttendanceAction,
  ApplyAttendanceResult,
} from '@workspace/api-server/modules/event-registrations';

@Injectable()
export class EventRegistrationAttendanceService extends BaseEventRegistrationAttendanceService {
  constructor(
    em: EntityManager,
    socketGateway: SocketGateway,
    eventRegistrationsService: EventRegistrationsService,
  ) {
    super(em, {
      eventEntity: Event as unknown as new () => Record<string, unknown>,
      eventRegistrationEntity:
        EventRegistration as unknown as new () => Record<string, unknown>,
      getRegistrationById: (id) => eventRegistrationsService.getById(id),
      emitAttendance: (payload) => socketGateway.emitEventAttendance(payload),
    });
  }
}
