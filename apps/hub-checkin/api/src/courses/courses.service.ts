/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { COURSE_COLUMN_FILTERS } from '../common/admin/filter-configs';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Course } from '../entities/course.entity';
import { BaseCoursesService } from '../common/module-bases/courses/course.service';
export type {
  CoursesRowDto,
  CoursesCreateData,
  CoursesUpdateData,
} from '../common/module-bases/courses/course.service';

@Injectable()
export class CoursesService extends BaseCoursesService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Course as unknown as new () => Record<string, unknown>;
  }

  protected getSearchFields(): string[] {
    return ['name', 'code'];
  }

  protected getColumnFiltersConfig() {
    return COURSE_COLUMN_FILTERS;
  }
}
