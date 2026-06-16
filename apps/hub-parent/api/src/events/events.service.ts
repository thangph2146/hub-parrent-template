/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { EVENT_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Event } from '../entities/event.entity';
import { Camera } from '../entities/camera.entity';
import { BaseEventsService } from '../common/module-bases/events/events.service';
export type {
  EventRowDto,
  ListEventsParams,
  ListEventsResult,
} from '../common/module-bases/events/events.service';

@Injectable()
export class EventsService extends BaseEventsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity() {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getCameraEntity() {
    return Camera as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['title', 'organizer', 'location'];
  }

  protected getColumnFiltersConfig() {
    return EVENT_COLUMN_FILTERS;
  }
}
