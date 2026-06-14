/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EventSpeaker } from '../entities/event-speaker.entity';
import { BaseEventSpeakersService } from '../common/module-bases/event-speakers/event-speakers.service';
export type {
  EventSpeakerRowDto,
  ListEventSpeakersParams,
  ListEventSpeakersResult,
} from '../common/module-bases/event-speakers/event-speakers.service';

@Injectable()
export class EventSpeakersService extends BaseEventSpeakersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventSpeakerEntity() {
    return EventSpeaker as unknown as new () => Record<string, unknown>;
  }

  protected getEventEntity() {
    return EventSpeaker as unknown as new () => Record<string, unknown>;
  }

  protected getSpeakerEntity() {
    return EventSpeaker as unknown as new () => Record<string, unknown>;
  }
}
