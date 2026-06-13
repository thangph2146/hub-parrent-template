/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseSpeakersService,
  type SpeakersRowDto,
} from '@workspace/api-server/modules/speakers';
import {
  toIso,
  type AdminColumnFiltersConfig,
} from '@workspace/api-server/common';

import { Speaker } from '../entities/speaker.entity';
import { SPEAKER_COLUMN_FILTERS } from '../common/admin-filter-configs';

export type SpeakerRowDto = SpeakersRowDto;

@Injectable()
export class SpeakersService extends BaseSpeakersService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Speaker as unknown as new () => Record<string, unknown>;
  }

  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return SPEAKER_COLUMN_FILTERS;
  }

  protected mapRow(entity: Record<string, unknown>): SpeakersRowDto {
    const row = entity as unknown as Speaker;
    return {
      id: row.id,
      name: row.name,
      title: row.title ?? null,
      organization: row.organization ?? null,
      bio: row.bio ?? null,
      avatar: row.avatar ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      status: row.status,
      isActive: row.status !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
