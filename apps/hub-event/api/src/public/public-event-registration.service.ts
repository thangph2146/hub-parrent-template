/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BasePublicEventRegistrationService } from '@workspace/api-server/modules/public';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';

export type {
  RegisterForEventResult,
  MyRegisteredEventItem,
} from '@workspace/api-server/modules/public';

@Injectable()
export class PublicEventRegistrationService extends BasePublicEventRegistrationService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
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

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationsService() {
    return this.eventRegistrationsService;
  }
}
