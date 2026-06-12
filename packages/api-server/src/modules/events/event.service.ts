/**
 * Events Service.
 *
 * Bám sát pattern của `apps/main/api/src/events/events.service.ts`.
 * Extend `BaseCrudService` từ `@workspace/api-server/bases`.
 *
 * Concrete DTOs được generate từ `event.entity.ts`.
 */
import { Injectable, Logger } from '@nestjs/common';
import { BaseCrudService } from '../../bases';
import type { CrudRowDto, CrudCreateData, CrudUpdateData } from '../../types';

/**
 * Event row DTO trả về cho client.
 * Các field khớp với entity `Event`.
 */
export interface EventsRowDto extends CrudRowDto {
  id: number | string;
  slug?: unknown;
  poster?: unknown;
  description?: unknown;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  checkinStart?: Date | string | null;
  checkinEnd?: Date | string | null;
  checkoutStart?: Date | string | null;
  checkoutEnd?: Date | string | null;
  registrationStart?: Date | string | null;
  registrationEnd?: Date | string | null;
  organizer?: unknown;
  location?: unknown;
  address?: unknown;
  qrCode?: unknown;
  status: number;
  isFeatured: boolean;
  featuredOrder: number;
  totalRegistrations: number;
  totalCheckins: number;
  totalCheckouts: number;
  allowCheckin: boolean;
  allowCheckout: boolean;
  requireFaceId: boolean;
  maxParticipants: number;
  onlineLink?: unknown;
  schedule?: unknown;
  deletedAt?: Date | string | null;
}

/**
 * Event create DTO - tất cả optional ngoại trừ các field required.
 */
export interface EventsCreateData extends CrudCreateData {
  slug?: unknown;
  poster?: unknown;
  description?: unknown;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  checkinStart?: Date | string | null;
  checkinEnd?: Date | string | null;
  checkoutStart?: Date | string | null;
  checkoutEnd?: Date | string | null;
  registrationStart?: Date | string | null;
  registrationEnd?: Date | string | null;
  organizer?: unknown;
  location?: unknown;
  address?: unknown;
  qrCode?: unknown;
  status?: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  totalRegistrations?: number;
  totalCheckins?: number;
  totalCheckouts?: number;
  allowCheckin?: boolean;
  allowCheckout?: boolean;
  requireFaceId?: boolean;
  maxParticipants?: number;
  onlineLink?: unknown;
  schedule?: unknown;
}

/**
 * Event update DTO - tất cả optional (Partial pattern).
 */
export interface EventsUpdateData extends CrudUpdateData {
  slug?: unknown;
  poster?: unknown;
  description?: unknown;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  checkinStart?: Date | string | null;
  checkinEnd?: Date | string | null;
  checkoutStart?: Date | string | null;
  checkoutEnd?: Date | string | null;
  registrationStart?: Date | string | null;
  registrationEnd?: Date | string | null;
  organizer?: unknown;
  location?: unknown;
  address?: unknown;
  qrCode?: unknown;
  status?: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  totalRegistrations?: number;
  totalCheckins?: number;
  totalCheckouts?: number;
  allowCheckin?: boolean;
  allowCheckout?: boolean;
  requireFaceId?: boolean;
  maxParticipants?: number;
  onlineLink?: unknown;
  schedule?: unknown;
}

/**
 * Abstract Events Service.
 *
 * Subclass override `getEntity()` để integrate với concrete entity class.
 * Tất cả CRUD operations (list, getById, create, update, softDelete,
 * restore, hardDelete, bulk) đã có sẵn từ `BaseCrudService`.
 */
@Injectable()
export abstract class BaseEventsService extends BaseCrudService<
  EventsRowDto,
  EventsCreateData,
  EventsUpdateData
> {
  protected readonly logger = new Logger(BaseEventsService.name);

  /** Trả về class constructor của entity (vd: `Event`). */
  protected abstract getEntity(): new () => Record<string, unknown>;

  /** Tên entity dùng cho logging. */
  protected getEntityName(): string {
    return 'Event';
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
