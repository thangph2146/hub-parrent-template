/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { ACADEMIC_YEAR_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AcademicYear } from '../entities/academic-year.entity';
import { BaseAcademicYearsService } from '../common/module-bases/academic-years/academic-year.service';
export type {
  AcademicYearsRowDto,
  AcademicYearsCreateData,
  AcademicYearsUpdateData,
} from '../common/module-bases/academic-years/academic-year.service';

@Injectable()
export class AcademicYearsService extends BaseAcademicYearsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return AcademicYear as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name'];
  }

  protected getColumnFiltersConfig() {
    return ACADEMIC_YEAR_COLUMN_FILTERS;
  }
}
