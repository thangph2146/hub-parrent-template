/**
 * Majors Service.
 *
 * Bám sát pattern của `apps/main/api/src/majors/majors.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `major.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Major row DTO trả về cho client.
 * Các field khớp với entity `Major`.
 */
export interface MajorsRowDto extends CrudRowDto {
  id: number | string;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Major create DTO - tất cả optional ngoại trừ các field required.
 */
export interface MajorsCreateData extends CrudCreateData {
  status?: number;
}

/**
 * Major update DTO - tất cả optional (Partial pattern).
 */
export interface MajorsUpdateData extends CrudUpdateData {
  status?: number;
}

/**
 * Abstract Majors Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseMajorsService extends BaseCrudService<
  MajorsRowDto,
  MajorsCreateData,
  MajorsUpdateData
> {
  protected readonly logger = new Logger(BaseMajorsService.name);

  /** Trả về class constructor của entity (vd: `Major`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Major';
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
