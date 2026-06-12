/**
 * Notifications Service.
 *
 * Bám sát pattern của `apps/main/api/src/notifications/notifications.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `notification.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Notification row DTO trả về cho client.
 * Các field khớp với entity `Notification`.
 */
export interface NotificationsRowDto extends CrudRowDto {
  id: number | string;
  kind: unknown;
  description?: unknown;
  isRead: boolean;
  actionUrl?: unknown;
  metadata?: unknown;
  expiresAt?: Date | string | null;
  readAt?: Date | string | null;
}

/**
 * Notification create DTO - tất cả optional ngoại trừ các field required.
 */
export interface NotificationsCreateData extends CrudCreateData {
  kind?: unknown;
  description?: unknown;
  isRead?: boolean;
  actionUrl?: unknown;
  metadata?: unknown;
  expiresAt?: Date | string | null;
  readAt?: Date | string | null;
}

/**
 * Notification update DTO - tất cả optional (Partial pattern).
 */
export interface NotificationsUpdateData extends CrudUpdateData {
  kind?: unknown;
  description?: unknown;
  isRead?: boolean;
  actionUrl?: unknown;
  metadata?: unknown;
  expiresAt?: Date | string | null;
  readAt?: Date | string | null;
}

/**
 * Abstract Notifications Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseNotificationsService extends BaseCrudService<
  NotificationsRowDto,
  NotificationsCreateData,
  NotificationsUpdateData
> {
  protected readonly logger = new Logger(BaseNotificationsService.name);

  /** Trả về class constructor của entity (vd: `Notification`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Notification';
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
