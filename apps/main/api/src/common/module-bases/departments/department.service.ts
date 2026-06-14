/**
 * Departments Service.
 *
 * Bám sát pattern của `apps/main/api/src/departments/departments.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `department.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Department row DTO trả về cho client.
 * Các field khớp với entity `Department`.
 */
export interface DepartmentsRowDto extends CrudRowDto {
  id: number | string;
  description?: unknown;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Department create DTO - tất cả optional ngoại trừ các field required.
 */
export interface DepartmentsCreateData extends CrudCreateData {
  description?: unknown;
  status?: number;
}

/**
 * Department update DTO - tất cả optional (Partial pattern).
 */
export interface DepartmentsUpdateData extends CrudUpdateData {
  description?: unknown;
  status?: number;
}

/**
 * Abstract Departments Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseDepartmentsService extends BaseCrudService<
  DepartmentsRowDto,
  DepartmentsCreateData,
  DepartmentsUpdateData
> {
  protected readonly logger = new Logger(BaseDepartmentsService.name);

  /** Trả về class constructor của entity (vd: `Department`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Department';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field - null nếu entity không hỗ trợ. */
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
