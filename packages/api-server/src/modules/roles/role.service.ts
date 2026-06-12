/**
 * Roles Service.
 *
 * Bám sát pattern của `apps/main/api/src/roles/roles.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `role.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Role row DTO trả về cho client.
 * Các field khớp với entity `Role`.
 */
export interface RolesRowDto extends CrudRowDto {
  id: number | string;
  description?: unknown;
  permissions?: unknown;
  isActive: boolean;
  deletedAt?: Date | string | null;
}

/**
 * Role create DTO - tất cả optional ngoại trừ các field required.
 */
export interface RolesCreateData extends CrudCreateData {
  description?: unknown;
  permissions?: unknown;
}

/**
 * Role update DTO - tất cả optional (Partial pattern).
 */
export interface RolesUpdateData extends CrudUpdateData {
  description?: unknown;
  permissions?: unknown;
  isActive?: boolean;
}

/**
 * Abstract Roles Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseRolesService extends BaseCrudService<
  RolesRowDto,
  RolesCreateData,
  RolesUpdateData
> {
  protected readonly logger = new Logger(BaseRolesService.name);

  /** Trả về class constructor của entity (vd: `Role`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Role';
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
