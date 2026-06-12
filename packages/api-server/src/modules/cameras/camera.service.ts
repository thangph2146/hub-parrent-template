/**
 * Cameras Service.
 *
 * Bám sát pattern của `apps/main/api/src/cameras/cameras.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `camera.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Camera row DTO trả về cho client.
 * Các field khớp với entity `Camera`.
 */
export interface CamerasRowDto extends CrudRowDto {
  name?: string;
  code?: unknown;
  linkedEventId?: number | null;
  linkedEventTitle?: string | null;
  linkedEventSlug?: string | null;
  ipAddress?: unknown;
  port?: unknown;
  username?: unknown;
  password?: unknown;
  status: number;
  deletedAt?: Date | string | null;
}

/**
 * Camera create DTO - tất cả optional ngoại trừ các field required.
 */
export interface CamerasCreateData extends CrudCreateData {
  name?: string;
  code?: unknown;
  ipAddress?: unknown;
  port?: unknown;
  username?: unknown;
  password?: unknown;
  status?: number;
}

/**
 * Camera update DTO - tất cả optional (Partial pattern).
 */
export interface CamerasUpdateData extends CrudUpdateData {
  name?: string;
  code?: unknown;
  ipAddress?: unknown;
  port?: unknown;
  username?: unknown;
  password?: unknown;
  status?: number;
}

/**
 * Abstract Cameras Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseCamerasService extends BaseCrudService<
  CamerasRowDto,
  CamerasCreateData,
  CamerasUpdateData
> {
  protected readonly logger = new Logger(BaseCamerasService.name);

  /** Trả về class constructor của entity (vd: `Camera`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Camera';
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
    return ['name', 'code', 'ipAddress'];
  }

  protected getFilterableFields(): string[] {
    return ['status'];
  }

  protected getBulkLabel(): string {
    return 'camera';
  }
}
