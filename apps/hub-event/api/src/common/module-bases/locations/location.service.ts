/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Locations Service.
 *
 * Bám sát pattern của `apps/main/api/src/locations/locations.service.ts`.
 * Extend `BaseCrudService` từ `src/common/crud`.
 *
 * Concrete DTOs được generate từ `location.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../crud';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../module-types';

/**
 * Location row DTO trả về cho client.
 * Các field khớp với entity `Location`.
 */
export interface LocationsRowDto extends CrudRowDto {
  name?: string | null;
  address?: string | null;
  mapUrl?: string;
  status?: number | null;
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
    return 'deletedAt';
  }

  protected getSearchFields(): string[] {
    return ['name', 'address', 'mapUrl'];
  }

  protected getFilterableFields(): string[] {
    return ['status'];
  }

  protected getBulkLabel(): string {
    return 'địa điểm';
  }
}
