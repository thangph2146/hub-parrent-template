/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { LOCATION_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Location } from '../entities/location.entity';
import { BaseLocationsService } from '../common/module-bases/locations/location.service';
export type {
  LocationsRowDto,
  LocationsCreateData,
  LocationsUpdateData,
} from '../common/module-bases/locations/location.service';

@Injectable()
export class LocationsService extends BaseLocationsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Location as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'address', 'mapUrl'];
  }

  protected getColumnFiltersConfig() {
    return LOCATION_COLUMN_FILTERS;
  }
}
