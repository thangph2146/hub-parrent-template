/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { DEPARTMENT_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Department } from '../entities/department.entity';
import { BaseDepartmentsService } from '../common/module-bases/departments/department.service';
export type {
  DepartmentsRowDto,
  DepartmentsCreateData,
  DepartmentsUpdateData,
} from '../common/module-bases/departments/department.service';

@Injectable()
export class DepartmentsService extends BaseDepartmentsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Department as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code', 'description'];
  }

  protected getColumnFiltersConfig() {
    return DEPARTMENT_COLUMN_FILTERS;
  }
}
