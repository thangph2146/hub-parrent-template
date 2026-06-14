/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { CAMERA_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Camera } from '../entities/camera.entity';
import { BaseCamerasService } from '../common/module-bases/cameras/camera.service';
export type {
  CamerasRowDto,
  CamerasCreateData,
  CamerasUpdateData,
} from '../common/module-bases/cameras/camera.service';

@Injectable()
export class CamerasService extends BaseCamerasService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Camera as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'ipAddress', 'code'];
  }

  protected getColumnFiltersConfig() {
    return CAMERA_COLUMN_FILTERS;
  }
}
