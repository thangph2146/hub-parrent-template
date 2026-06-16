/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Courses Service.
 *
 * Bám sát pattern của `apps/main/api/src/courses/courses.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `course.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Course row DTO trả về cho client.
 * Các field khớp với entity `Course`.
 */
export interface CoursesRowDto extends CrudRowDto {
  id: number | string;
  startYear?: unknown;
  endYear?: unknown;
  departmentId?: unknown;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Course create DTO - tất cả optional ngoại trừ các field required.
 */
export interface CoursesCreateData extends CrudCreateData {
  startYear?: unknown;
  endYear?: unknown;
  departmentId?: unknown;
  status?: number;
}

/**
 * Course update DTO - tất cả optional (Partial pattern).
 */
export interface CoursesUpdateData extends CrudUpdateData {
  startYear?: unknown;
  endYear?: unknown;
  departmentId?: unknown;
  status?: number;
}

/**
 * Abstract Courses Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseCoursesService extends BaseCrudService<
  CoursesRowDto,
  CoursesCreateData,
  CoursesUpdateData
> {
  protected readonly logger = new Logger(BaseCoursesService.name);

  /** Trả về class constructor của entity (vd: `Course`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Course';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field. */
  protected getSoftDeleteField(): string | null {
    return 'deletedAt';
  }

  /** Fields cho phép search LIKE. Override trong subclass nếu cần. */
  protected getSearchFields(): string[] {
    return [];
  }

  /** Fields cho phép exact-match filter. */
  protected getFilterableFields(): string[] {
    return ['isActive'];
  }
}
