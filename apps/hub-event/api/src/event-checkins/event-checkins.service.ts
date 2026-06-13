/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventCheckinsService } from '@workspace/api-server/modules/event-checkins';
import { EventCheckin } from '../entities/event-checkin.entity';
import { Event } from '../entities/event.entity';
import { EventRegistration } from '../entities/event-registration.entity';

export type {
  EventCheckinRowDto,
  ListEventCheckinsParams,
  ListEventCheckinsResult,
} from '@workspace/api-server/modules/event-checkins';

@Injectable()
export class EventCheckinsService extends BaseEventCheckinsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventCheckinEntity(): new () => Record<string, unknown> {
    return EventCheckin as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getEventRegistrationEntity(): new () => Record<string, unknown> {
    return EventRegistration as unknown as new () => Record<string, unknown>;
  }
}
