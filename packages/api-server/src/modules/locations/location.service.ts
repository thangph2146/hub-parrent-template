/**
 * Locations Service.
 *
 * Bám sát pattern của `apps/main/api/src/locations/locations.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `location.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Location row DTO trả về cho client.
 * Các field khớp với entity `Location`.
 */
export interface LocationsRowDto extends CrudRowDto {
  id: number | string;
  name?: unknown;
  address?: unknown;
  status?: unknown;
  deletedAt?: Date | string | null;
}

/**
 * Location create DTO - tất cả optional ngoại trừ các field required.
 */
export interface LocationsCreateData extends CrudCreateData {
  name?: unknown;
  address?: unknown;
  status?: unknown;
}

/**
 * Location update DTO - tất cả optional (Partial pattern).
 */
export interface LocationsUpdateData extends CrudUpdateData {
  name?: unknown;
  address?: unknown;
  status?: unknown;
}

/**
 * Abstract Locations Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseLocationsService extends BaseCrudService<
  LocationsRowDto,
  LocationsCreateData,
  LocationsUpdateData
> {
  protected readonly logger = new Logger(BaseLocationsService.name);

  /** Trả về class constructor của entity (vd: `Location`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Location';
  }

  /** Tên trường primary key. */
  protected getPrimaryKeyField(): string {
    return 'id';
  }

  /** Soft delete field - null nếu entity không hỗ trợ. */
  protected getSoftDeleteField(): string | null {
    return null;
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
