/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  BaseLocationsService,
  type LocationsRowDto,
} from '@workspace/api-server/modules/locations';
import {
  toIso,
  type AdminColumnFiltersConfig,
} from '@workspace/api-server/common';

import { Location } from '../entities/location.entity';
import { LOCATION_COLUMN_FILTERS } from '../common/admin-filter-configs';

export type LocationRowDto = LocationsRowDto;

@Injectable()
export class LocationsService extends BaseLocationsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Location as unknown as new () => Record<string, unknown>;
  }

  protected getColumnFiltersConfig(): AdminColumnFiltersConfig {
    return LOCATION_COLUMN_FILTERS;
  }

  protected mapRow(entity: Record<string, unknown>): LocationsRowDto {
    const row = entity as unknown as Location;
    return {
      id: row.id,
      name: row.name ?? null,
      address: row.address ?? null,
      mapUrl: row.mapUrl,
      status: row.status ?? null,
      isActive: (row.status ?? 0) !== 0,
      createdAt: toIso(row.createdAt) ?? '',
      updatedAt: toIso(row.updatedAt) ?? '',
      deletedAt: toIso(row.deletedAt),
    };
  }
}
