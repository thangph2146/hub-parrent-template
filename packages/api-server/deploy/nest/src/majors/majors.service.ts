/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { MAJOR_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Major } from '../entities/major.entity';
import { BaseMajorsService } from '../common/module-bases/majors/major.service';
export type {
  MajorsRowDto,
  MajorsCreateData,
  MajorsUpdateData,
} from '../common/module-bases/majors/major.service';

@Injectable()
export class MajorsService extends BaseMajorsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Major as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getColumnFiltersConfig() {
    return MAJOR_COLUMN_FILTERS;
  }
}
