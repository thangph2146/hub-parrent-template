/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventRegistrationsAdminService } from '@workspace/api-server/modules/event-registrations';
import { EventRegistration } from '../entities/event-registration.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

export type {
  EventRegistrationRowDto,
  ListEventRegistrationsParams,
  ListEventRegistrationsResult,
  PublicEventRegistrantDto,
} from '@workspace/api-server/modules/event-registrations';

@Injectable()
export class EventRegistrationsService extends BaseEventRegistrationsAdminService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity(): new () => Record<string, unknown> {
    return User as unknown as new () => Record<string, unknown>;
  }
}
