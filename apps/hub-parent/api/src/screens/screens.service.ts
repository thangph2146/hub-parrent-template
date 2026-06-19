/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { SCREEN_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Screen } from '../entities/screen.entity';
import { BaseScreensService } from '../common/module-bases/screens/screen.service';
export type {
  ScreensRowDto,
  ScreensCreateData,
  ScreensUpdateData,
} from '../common/module-bases/screens/screen.service';

@Injectable()
export class ScreensService extends BaseScreensService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Screen as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getColumnFiltersConfig() {
    return SCREEN_COLUMN_FILTERS;
  }
}
