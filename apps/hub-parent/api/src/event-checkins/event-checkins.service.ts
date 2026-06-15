/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EventCheckin } from '../entities/event-checkin.entity';
import { EventRegistration } from '../entities/event-registration.entity';
import { BaseEventCheckinsService } from '../common/module-bases/event-checkins/event-checkins.service';
export type {
  EventCheckinRowDto,
  ListEventCheckinsParams,
  ListEventCheckinsResult,
} from '../common/module-bases/event-checkins/event-checkins.service';

@Injectable()
export class EventCheckinsService extends BaseEventCheckinsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventCheckinEntity() {
    return EventCheckin as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity() {
    return EventCheckin as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity() {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }
}
