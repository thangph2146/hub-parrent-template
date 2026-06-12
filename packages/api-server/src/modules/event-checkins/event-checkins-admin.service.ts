/**
 * Event Checkins Admin Service — từ apps/hub-event/api.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../../common/bulk-actions';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../common/pagination';
import { safeIsoString, safeIsoStringNow } from '../../common/date-utils';
import { toEntityId } from '../../common/entity-id';

export interface EventCheckinRowDto {
  id: number;
  eventId: number;
  email: string;
  fullName: string;
  registrationId: number | null;
  checkinTime: string;
  checkinType: number;
  faceImage: string | null;
  faceMatchScore: number | null;
  faceVerified: boolean;
  status: number;
  locationData: string | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListEventCheckinsParams {
  page: number;
  limit: number;
  eventId: string;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
}

export interface ListEventCheckinsResult {
  data: EventCheckinRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type EventCheckinWithRelations = {
  id: number;
  email: string;
  fullName: string;
  checkinTime: Date | string;
  checkinType: number;
  faceImage?: string | null;
  faceMatchScore?: number | null;
  faceVerified: boolean;
  status: number;
  locationData?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
  event: { id: number };
  registration?: { id: number } | null;
};

function mapRow(r: EventCheckinWithRelations): EventCheckinRowDto {
  return {
    id: r.id,
    eventId: r.event.id,
    email: r.email,
    fullName: r.fullName,
    registrationId: r.registration?.id ?? null,
    checkinTime: safeIsoStringNow(r.checkinTime),
    checkinType: r.checkinType,
    faceImage: r.faceImage ?? null,
    faceMatchScore: r.faceMatchScore ?? null,
    faceVerified: r.faceVerified,
    status: r.status,
    locationData: r.locationData ?? null,
    deviceInfo: r.deviceInfo ?? null,
    ipAddress: r.ipAddress ?? null,
    createdAt: safeIsoString(r.createdAt),
    updatedAt: safeIsoString(r.updatedAt),
    deletedAt: safeIsoString(r.deletedAt),
  };
}

@Injectable()
export abstract class BaseEventCheckinsAdminService {
  protected abstract getEm(): EntityManager;
  protected abstract getEventCheckinEntity(): new () => Record<string, unknown>;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getEventRegistrationEntity(): new () => Record<string, unknown>;

  async list(
    params: ListEventCheckinsParams,
  ): Promise<ListEventCheckinsResult> {
    const EventCheckin = this.getEventCheckinEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: Record<string, unknown> = {
      event: toEntityId(params.eventId),
    };
    const status = params.status ?? 'active';
    if (status === 'deleted') where.deletedAt = { $ne: null };
    else if (status === 'active') where.deletedAt = null;
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.$or = [
        { email: { $like: `%${q}%` } },
        { fullName: { $like: `%${q}%` } },
      ];
    }
    const whereQuery = where as FilterQuery<object>;
    const [rows, total] = await Promise.all([
      this.getEm().find(EventCheckin, whereQuery, {
        orderBy: { checkinTime: 'DESC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(EventCheckin, whereQuery),
    ]);
    return {
      data: (rows as EventCheckinWithRelations[]).map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: string): Promise<EventCheckinRowDto | null> {
    const EventCheckin = this.getEventCheckinEntity();
    const r = await this.getEm().findOne(EventCheckin, { id: toEntityId(id) });
    if (!r) return null;
    return mapRow(r as EventCheckinWithRelations);
  }

  async create(data: {
    eventId: string;
    email: string;
    fullName: string;
    registrationId?: string | null;
    checkinTime?: Date;
    checkinType?: number;
  }): Promise<EventCheckinRowDto> {
    const EventCheckin = this.getEventCheckinEntity();
    const created = new EventCheckin() as EventCheckinWithRelations;
    created.event = this.getEm().getReference(
      this.getEventEntity(),
      toEntityId(data.eventId),
    ) as { id: number };
    created.email = data.email;
    created.fullName = data.fullName;
    if (data.registrationId !== undefined) {
      created.registration = data.registrationId
        ? (this.getEm().getReference(
            this.getEventRegistrationEntity(),
            toEntityId(data.registrationId),
          ) as { id: number })
        : null;
    }
    created.checkinTime = data.checkinTime ?? new Date();
    if (data.checkinType !== undefined) created.checkinType = data.checkinType;
    await this.getEm().persistAndFlush(created);
    return mapRow(created);
  }

  async update(
    id: string,
    data: {
      email?: string;
      fullName?: string;
      checkinType?: number;
      faceVerified?: boolean;
      status?: number;
    },
  ): Promise<EventCheckinRowDto | null> {
    const EventCheckin = this.getEventCheckinEntity();
    const existing = (await this.getEm().findOne(EventCheckin, {
      id: toEntityId(id),
    })) as EventCheckinWithRelations | null;
    if (!existing) return null;
    if (data.email !== undefined) existing.email = data.email;
    if (data.fullName !== undefined) existing.fullName = data.fullName;
    if (data.checkinType !== undefined) existing.checkinType = data.checkinType;
    if (data.faceVerified !== undefined) {
      existing.faceVerified = data.faceVerified;
    }
    if (data.status !== undefined) existing.status = data.status;
    await this.getEm().persistAndFlush(existing);
    return mapRow(existing);
  }

  async softDelete(id: string): Promise<boolean> {
    const EventCheckin = this.getEventCheckinEntity();
    const r = (await this.getEm().findOne(EventCheckin, {
      id: toEntityId(id),
    })) as { deletedAt?: Date | null } | null;
    if (!r || r.deletedAt) return false;
    r.deletedAt = new Date();
    await this.getEm().persistAndFlush(r);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const EventCheckin = this.getEventCheckinEntity();
    const r = (await this.getEm().findOne(EventCheckin, {
      id: toEntityId(id),
    })) as { deletedAt?: Date | null } | null;
    if (!r || !r.deletedAt) return false;
    r.deletedAt = null;
    await this.getEm().persistAndFlush(r);
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const EventCheckin = this.getEventCheckinEntity();
    const r = await this.getEm().findOne(EventCheckin, { id: toEntityId(id) });
    if (!r) return false;
    await this.getEm().removeAndFlush(r);
    return true;
  }

  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    const EventCheckin = this.getEventCheckinEntity();
    return applyBulkAction(this.getEm(), EventCheckin, action, ids, {
      label: 'luot check-in',
    });
  }
}
