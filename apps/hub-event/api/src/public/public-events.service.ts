/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicEventsService } from '@workspace/api-server/modules/public';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';
import { EventSpeakersService } from '../event-speakers/event-speakers.service';

export type { EventTimeFilter } from '@workspace/api-server/modules/public';

@Injectable()
export class PublicEventsService extends BasePublicEventsService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
    private readonly eventSpeakersService: EventSpeakersService,
  ) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationsService() {
    const svc = this.eventRegistrationsService;
    return {
      findActiveByEventAndEmail: async (eventId: string | number, email: string) => {
        const row = await svc.findActiveByEventAndEmail(eventId, email);
        if (!row) return null;
        return {
          id: row.id,
          email: row.email,
          fullName: row.fullName,
          status: row.status,
          registeredAt: row.registeredAt,
        };
      },
      syncEventRegistrationCount: (eventId: string | number) =>
        svc.syncEventRegistrationCount(eventId),
      listPublicForEvent: (eventId: string | number, limit: number) =>
        svc.listPublicForEvent(eventId, limit),
    };
  }

  protected getEventSpeakersService() {
    return this.eventSpeakersService;
  }
}
