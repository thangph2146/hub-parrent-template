/**
 * Event registrations admin service — logic dùng chung; app binding entity.
 */
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  applyBulkAction,
  type BulkAction,
  type BulkResult,
} from '../../bulk-actions';
import {
  normalizePageLimit,
  paginationMeta,
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
} from '../../pagination';
import { safeIsoString } from '../../date-utils';
import { relationEntityId, toEntityId } from '../../entity-id';

/** RegistrationStatus.CANCELLED */
const REGISTRATION_STATUS_CANCELLED = 2;

export interface EventRegistrationRowDto {
  id: number;
  eventId: number;
  email: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  registeredAt: string | null;
  status: number;
  faceVerified: boolean;
  hasCheckin: boolean;
  hasCheckout: boolean;
  attendanceStatus: number;
  attendanceMinutes: number;
  checkinMethod: number;
  formData: unknown;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListEventRegistrationsParams {
  eventId: string | number;
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface ListEventRegistrationsResult {
  data: EventRegistrationRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PublicEventRegistrantDto {
  fullName: string;
  registeredAt: string | null;
}

type EventRegistrationRow = {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  registeredAt?: Date | string | null;
  status: number;
  faceVerified: boolean;
  hasCheckin: boolean;
  hasCheckout: boolean;
  attendanceStatus: number;
  attendanceMinutes: number;
  checkinMethod: number;
  formData?: unknown;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
  event?: unknown;
};

function avatarFromFormData(formData: unknown): string | null {
  if (formData == null || typeof formData !== 'object') return null;
  const record = formData as Record<string, unknown>;
  for (const key of ['avatar', 'avatarUrl', 'image', 'photo', 'profileImage']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      if (typeof nested.url === 'string' && nested.url.trim()) {
        return nested.url.trim();
      }
    }
  }
  return null;
}

function normalizeEventIdParam(eventId: string | number): number {
  return typeof eventId === 'number' ? eventId : toEntityId(eventId);
}

function mapRow(
  r: EventRegistrationRow,
  avatarByEmail?: Map<string, string | null>,
): EventRegistrationRowDto {
  const eventId = relationEntityId(r.event) ?? 0;
  return {
    id: r.id,
    eventId,
    email: r.email,
    fullName: r.fullName,
    avatar: resolveRegistrationAvatar(r, avatarByEmail),
    phone: r.phone ?? null,
    registeredAt: safeIsoString(r.registeredAt),
    status: r.status,
    faceVerified: r.faceVerified,
    hasCheckin: r.hasCheckin,
    hasCheckout: r.hasCheckout,
    attendanceStatus: r.attendanceStatus,
    attendanceMinutes: r.attendanceMinutes,
    checkinMethod: r.checkinMethod,
    formData: r.formData,
    createdAt: safeIsoString(r.createdAt),
    updatedAt: safeIsoString(r.updatedAt),
    deletedAt: safeIsoString(r.deletedAt),
  };
}

function resolveRegistrationAvatar(
  row: EventRegistrationRow,
  avatarByEmail?: Map<string, string | null>,
): string | null {
  const fromUser = avatarByEmail?.get(row.email.trim().toLowerCase());
  if (fromUser) return fromUser;
  return avatarFromFormData(row.formData);
}

export abstract class BaseEventRegistrationsService {
  protected abstract getEm(): EntityManager;
  protected abstract getEventRegistrationEntity(): new () => Record<
    string,
    unknown
  >;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;

  private async loadAvatarByEmails(
    emails: string[],
  ): Promise<Map<string, string | null>> {
    const User = this.getUserEntity();
    const normalized = [
      ...new Set(
        emails.map((e) => e.trim().toLowerCase()).filter((e) => e.length > 0),
      ),
    ];
    const map = new Map<string, string | null>();
    if (!normalized.length) return map;

    const users = await this.getEm().find(User, {
      email: { $in: normalized },
      deletedAt: null,
    } as FilterQuery<object>);

    for (const user of users as Array<{
      email?: string;
      avatar?: string | null;
    }>) {
      const email = user.email?.trim().toLowerCase();
      if (!email) continue;
      map.set(email, user.avatar?.trim() || null);
    }
    return map;
  }

  async countActiveForEvent(eventId: string | number): Promise<number> {
    const EventRegistration = this.getEventRegistrationEntity();
    const eid = normalizeEventIdParam(eventId);
    return this.getEm().count(EventRegistration, {
      event: eid,
      deletedAt: null,
      status: { $ne: REGISTRATION_STATUS_CANCELLED },
    } as FilterQuery<object>);
  }

  async syncEventRegistrationCount(eventId: string | number): Promise<number> {
    const Event = this.getEventEntity();
    const eid = normalizeEventIdParam(eventId);
    const count = await this.countActiveForEvent(eid);
    await this.getEm().nativeUpdate(
      Event,
      { id: eid },
      { totalRegistrations: count },
    );
    return count;
  }

  async listPublicForEvent(
    eventId: string | number,
    limit = 100,
  ): Promise<PublicEventRegistrantDto[]> {
    const EventRegistration = this.getEventRegistrationEntity();
    const eid = normalizeEventIdParam(eventId);
    const cap = Math.min(200, Math.max(1, limit));
    const rows = await this.getEm().find(
      EventRegistration,
      {
        event: eid,
        deletedAt: null,
        status: { $ne: REGISTRATION_STATUS_CANCELLED },
      } as FilterQuery<object>,
      {
        orderBy: { registeredAt: 'DESC', createdAt: 'DESC' },
        limit: cap,
        fields: ['fullName', 'registeredAt'],
      },
    );
    return (rows as EventRegistrationRow[]).map((r) => ({
      fullName: r.fullName,
      registeredAt: safeIsoString(r.registeredAt),
    }));
  }

  async findActiveByEventAndEmail(
    eventId: string | number,
    email: string,
  ): Promise<EventRegistrationRowDto | null> {
    const EventRegistration = this.getEventRegistrationEntity();
    const evId = normalizeEventIdParam(eventId);
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) return null;
    const row = await this.getEm().findOne(EventRegistration, {
      event: evId,
      email: normalizedEmail,
      deletedAt: null,
      status: { $ne: REGISTRATION_STATUS_CANCELLED },
    } as FilterQuery<object>);
    if (!row) return null;
    const avatarByEmail = await this.loadAvatarByEmails([
      (row as EventRegistrationRow).email,
    ]);
    return mapRow(row as EventRegistrationRow, avatarByEmail);
  }

  async list(
    params: ListEventRegistrationsParams,
  ): Promise<ListEventRegistrationsResult> {
    const EventRegistration = this.getEventRegistrationEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where: Record<string, unknown> = {};
    where.eventId = params.eventId;
    where.deletedAt = null;
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.$or = [
        { email: { $like: `%${q}%` } },
        { fullName: { $like: `%${q}%` } },
      ];
    }
    if (params.status) {
      const parsed = parseInt(params.status, 10);
      if (!Number.isNaN(parsed)) {
        where.status = parsed;
      }
    }
    const whereQuery = where as FilterQuery<object>;
    const [rows, total] = await Promise.all([
      this.getEm().find(EventRegistration, whereQuery, {
        orderBy: { createdAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(EventRegistration, whereQuery),
    ]);
    const avatarByEmail = await this.loadAvatarByEmails(
      (rows as EventRegistrationRow[]).map((row) => row.email),
    );
    return {
      data: (rows as EventRegistrationRow[]).map((row) =>
        mapRow(row, avatarByEmail),
      ),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: string | number): Promise<EventRegistrationRowDto | null> {
    const EventRegistration = this.getEventRegistrationEntity();
    const r = await this.getEm().findOne(EventRegistration, {
      id: toEntityId(id),
    });
    if (!r) return null;
    const avatarByEmail = await this.loadAvatarByEmails([
      (r as EventRegistrationRow).email,
    ]);
    return mapRow(r as EventRegistrationRow, avatarByEmail);
  }

  async create(data: {
    eventId: string | number;
    email: string;
    fullName: string;
    phone?: string | null;
    registeredAt?: Date;
    status?: number;
  }): Promise<EventRegistrationRowDto> {
    const EventRegistration = this.getEventRegistrationEntity();
    const Event = this.getEventEntity();
    const created = new EventRegistration() as EventRegistrationRow &
      Record<string, unknown>;
    created.event = this.getEm().getReference(Event, toEntityId(data.eventId));
    created.email = data.email;
    created.fullName = data.fullName;
    if (data.phone !== undefined) created.phone = data.phone;
    created.registeredAt = data.registeredAt ?? new Date();
    if (data.status !== undefined) created.status = data.status;
    await this.getEm().persistAndFlush(created);
    const avatarByEmail = await this.loadAvatarByEmails([created.email]);
    return mapRow(created, avatarByEmail);
  }

  async update(
    id: string,
    data: {
      email?: string;
      fullName?: string;
      phone?: string | null;
      status?: number;
      faceVerified?: boolean;
      attendanceStatus?: number;
      checkinMethod?: number;
    },
  ): Promise<EventRegistrationRowDto | null> {
    const EventRegistration = this.getEventRegistrationEntity();
    const existing = await this.getEm().findOne(EventRegistration, {
      id: toEntityId(id),
    });
    if (!existing) return null;
    const row = existing as EventRegistrationRow & Record<string, unknown>;
    if (data.email !== undefined) row.email = data.email;
    if (data.fullName !== undefined) row.fullName = data.fullName;
    if (data.phone !== undefined) row.phone = data.phone;
    if (data.status !== undefined) row.status = data.status;
    if (data.faceVerified !== undefined) row.faceVerified = data.faceVerified;
    if (data.attendanceStatus !== undefined)
      row.attendanceStatus = data.attendanceStatus;
    if (data.checkinMethod !== undefined)
      row.checkinMethod = data.checkinMethod;
    await this.getEm().persistAndFlush(existing);
    const avatarByEmail = await this.loadAvatarByEmails([row.email]);
    return mapRow(row, avatarByEmail);
  }

  async softDelete(id: string): Promise<boolean> {
    const EventRegistration = this.getEventRegistrationEntity();
    const r = await this.getEm().findOne(EventRegistration, {
      id: toEntityId(id),
    });
    if (!r) return false;
    const row = r as EventRegistrationRow & { deletedAt?: Date | null };
    if (row.deletedAt) return false;
    row.deletedAt = new Date();
    await this.getEm().persistAndFlush(r);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const EventRegistration = this.getEventRegistrationEntity();
    const r = await this.getEm().findOne(EventRegistration, {
      id: toEntityId(id),
    });
    if (!r) return false;
    const row = r as EventRegistrationRow & { deletedAt?: Date | null };
    if (!row.deletedAt) return false;
    row.deletedAt = null;
    await this.getEm().persistAndFlush(r);
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const EventRegistration = this.getEventRegistrationEntity();
    const r = await this.getEm().findOne(EventRegistration, {
      id: toEntityId(id),
    });
    if (!r) return false;
    await this.getEm().removeAndFlush(r);
    return true;
  }

  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    const EventRegistration = this.getEventRegistrationEntity();
    return applyBulkAction(this.getEm(), EventRegistration, action, ids, {
      label: 'luot dang ky',
    });
  }
}
