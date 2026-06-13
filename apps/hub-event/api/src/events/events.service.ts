/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseEventsService } from '@workspace/api-server/modules/events';
import { Event } from '../entities/event.entity';
import { Camera } from '../entities/camera.entity';

export type {
  EventRowDto,
  ListEventsParams,
  ListEventsResult,
} from '@workspace/api-server/modules/events';

@Injectable()
export class EventsService extends BaseEventsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEventEntity(): new () => Record<string, unknown> {
    return Event as unknown as new () => Record<string, unknown>;
  }

  protected getCameraEntity(): new () => Record<string, unknown> {
    return Camera as unknown as new () => Record<string, unknown>;
  }
}
