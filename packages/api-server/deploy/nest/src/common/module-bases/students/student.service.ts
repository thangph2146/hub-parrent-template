/**
 * Students Service.
 *
 * Bám sát pattern của `apps/main/api/src/students/students.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `student.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Student row DTO trả về cho client.
 * Các field khớp với entity `Student`.
 */
export interface StudentsRowDto extends CrudRowDto {
  id: number | string;
  name?: unknown;
  email?: unknown;
  isActive: boolean;
  deletedAt?: Date | string | null;
}

/**
 * Student create DTO - tất cả optional ngoại trừ các field required.
 */
export interface StudentsCreateData extends CrudCreateData {
  name?: unknown;
  email?: unknown;
}

/**
 * Student update DTO - tất cả optional (Partial pattern).
 */
export interface StudentsUpdateData extends CrudUpdateData {
  name?: unknown;
  email?: unknown;
  isActive?: boolean;
}

/**
 * Abstract Students Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseStudentsService extends BaseCrudService<
  StudentsRowDto,
  StudentsCreateData,
  StudentsUpdateData
> {
  protected readonly logger = new Logger(BaseStudentsService.name);

  /** Trả về class constructor của entity (vd: `Student`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Student';
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
