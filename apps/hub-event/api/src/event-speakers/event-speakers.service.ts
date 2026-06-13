/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventSpeakersService } from '@workspace/api-server/modules/event-speakers';
import { EventSpeaker } from '../entities/event-speaker.entity';
import { Event } from '../entities/event.entity';
import { Speaker } from '../entities/speaker.entity';

export type {
  EventSpeakerRowDto,
  ListEventSpeakersParams,
  ListEventSpeakersResult,
} from '@workspace/api-server/modules/event-speakers';

@Injectable()
export class EventSpeakersService extends BaseEventSpeakersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventSpeakerEntity(): new () => Record<string, unknown> {
    return EventSpeaker as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getSpeakerEntity(): new () => Record<string, unknown> {
    return Speaker as unknown as new () => Record<string, unknown>;
  }
}
