/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EventRegistration } from '../entities/event-registration.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { BaseEventRegistrationsService } from '../common/module-bases/event-registrations/event-registrations.service';
export type {
  EventRegistrationRowDto,
  ListEventRegistrationsParams,
  ListEventRegistrationsResult,
  PublicEventRegistrantDto,
} from '../common/module-bases/event-registrations/event-registrations.service';

@Injectable()
export class EventRegistrationsService extends BaseEventRegistrationsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventRegistrationEntity() {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity() {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getUserEntity() {
    return User as unknown as new () => Record<string, unknown>;
  }
}
