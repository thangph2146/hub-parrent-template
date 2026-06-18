/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { SPEAKER_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Speaker } from '../entities/speaker.entity';
import { BaseSpeakersService } from '../common/module-bases/speakers/speaker.service';
export type {
  SpeakersRowDto,
  SpeakersCreateData,
  SpeakersUpdateData,
} from '../common/module-bases/speakers/speaker.service';

@Injectable()
export class SpeakersService extends BaseSpeakersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Speaker as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'title', 'organization', 'email'];
  }

  protected getColumnFiltersConfig() {
    return SPEAKER_COLUMN_FILTERS;
  }
}
