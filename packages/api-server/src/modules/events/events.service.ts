/**
 * Events admin service — logic dùng chung; app binding entity.
 */
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
import { safeIsoString } from '../../common/date-utils';
import { normalizePosterField } from '../../common/poster-normalize';
import { buildStandardAdminListWhere } from '../../common/apply-column-filters';
import { EVENT_COLUMN_FILTERS } from './events-column-filters';
import { toEntityId } from '../../common/entity-id';

export interface EventRowDto {
  id: number;
  title: string;
  slug: string | null;
  poster: unknown;
  description: string | null;
  content: unknown;
  startDate: string | null;
  endDate: string | null;
  checkinStart: string | null;
  checkinEnd: string | null;
  checkoutStart: string | null;
  checkoutEnd: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  organizer: string | null;
  location: string | null;
  address: string | null;
  qrCode: string | null;
  status: number;
  totalRegistrations: number;
  totalCheckins: number;
  totalCheckouts: number;
  allowCheckin: boolean;
  allowCheckout: boolean;
  requireFaceId: boolean;
  maxParticipants: number;
  format: number;
  onlineLink: string | null;
  schedule: unknown;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isFeatured: boolean;
  featuredOrder: number;
  checkinCameraId: number | null;
  checkoutCameraId: number | null;
  checkinCameraName: string | null;
  checkoutCameraName: string | null;
  checkinCameraCode: string | null;
  checkoutCameraCode: string | null;
}

export interface ListEventsParams {
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'deleted' | 'all';
  statusFilter?: number;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  deletedAtFrom?: string;
  deletedAtTo?: string;
  filters?: Record<string, string>;
}

export interface ListEventsResult {
  data: EventRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const EVENT_CAMERA_POPULATE = ['checkinCamera', 'checkoutCamera'] as const;

type EventRow = {
  id: number;
  title: string;
  slug?: string | null;
  poster?: unknown;
  description?: string | null;
  content?: unknown;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  checkinStart?: Date | string | null;
  checkinEnd?: Date | string | null;
  checkoutStart?: Date | string | null;
  checkoutEnd?: Date | string | null;
  registrationStart?: Date | string | null;
  registrationEnd?: Date | string | null;
  organizer?: string | null;
  location?: string | null;
  address?: string | null;
  qrCode?: string | null;
  status: number;
  totalRegistrations: number;
  totalCheckins: number;
  totalCheckouts: number;
  allowCheckin: boolean;
  allowCheckout: boolean;
  requireFaceId: boolean;
  maxParticipants: number;
  format: number;
  onlineLink?: string | null;
  schedule?: unknown;
  createdBy?: { id?: number } | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  deletedAt?: Date | string | null;
  isFeatured?: boolean;
  featuredOrder?: number;
  checkinCamera?: { id?: number; name?: string; code?: string } | null;
  checkoutCamera?: { id?: number; name?: string; code?: string } | null;
  checkinCameraId?: number | null;
  checkoutCameraId?: number | null;
};

function mapRow(r: EventRow): EventRowDto {
  let content: unknown = null;
  if (r.content != null) {
    content =
      typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
  }

  return {
    id: r.id,
    title: r.title,
    slug: r.slug ?? null,
    poster: normalizePosterField(r.poster),
    description: r.description ?? null,
    content,
    startDate: safeIsoString(r.startDate),
    endDate: safeIsoString(r.endDate),
    checkinStart: safeIsoString(r.checkinStart),
    checkinEnd: safeIsoString(r.checkinEnd),
    checkoutStart: safeIsoString(r.checkoutStart),
    checkoutEnd: safeIsoString(r.checkoutEnd),
    registrationStart: safeIsoString(r.registrationStart),
    registrationEnd: safeIsoString(r.registrationEnd),
    organizer: r.organizer ?? null,
    location: r.location ?? null,
    address: r.address ?? null,
    qrCode: r.qrCode ?? null,
    status: r.status,
    totalRegistrations: r.totalRegistrations,
    totalCheckins: r.totalCheckins,
    totalCheckouts: r.totalCheckouts,
    allowCheckin: r.allowCheckin,
    allowCheckout: r.allowCheckout,
    requireFaceId: r.requireFaceId,
    maxParticipants: r.maxParticipants,
    format: r.format,
    onlineLink: r.onlineLink ?? null,
    schedule: r.schedule ?? null,
    createdBy: r.createdBy?.id ?? null,
    createdAt: safeIsoString(r.createdAt) ?? '',
    updatedAt: safeIsoString(r.updatedAt) ?? '',
    deletedAt: safeIsoString(r.deletedAt),
    isFeatured: r.isFeatured ?? false,
    featuredOrder: r.featuredOrder ?? 0,
    checkinCameraId: r.checkinCamera?.id ?? null,
    checkoutCameraId: r.checkoutCamera?.id ?? null,
    checkinCameraName: r.checkinCamera?.name ?? null,
    checkoutCameraName: r.checkoutCamera?.name ?? null,
    checkinCameraCode: r.checkinCamera?.code ?? null,
    checkoutCameraCode: r.checkoutCamera?.code ?? null,
  };
}

export abstract class BaseEventsService {
  protected abstract getEm(): EntityManager;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getCameraEntity(): new () => Record<string, unknown>;

  async list(params: ListEventsParams): Promise<ListEventsResult> {
    const Event = this.getEventEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const where = buildStandardAdminListWhere({
      ...params,
      searchFields: ['title', 'organizer', 'location'],
      filterConfig: EVENT_COLUMN_FILTERS,
    });
    const whereQuery = where as FilterQuery<object>;
    const [rows, total] = await Promise.all([
      this.getEm().find(Event, whereQuery, {
        populate: [...EVENT_CAMERA_POPULATE],
        orderBy: { updatedAt: 'DESC' },
        offset: skip,
        limit,
      }),
      this.getEm().count(Event, whereQuery),
    ]);
    return {
      data: (rows as EventRow[]).map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: string): Promise<EventRowDto | null> {
    const Event = this.getEventEntity();
    const r = await this.getEm().findOne(
      Event,
      { id: toEntityId(id) },
      { populate: [...EVENT_CAMERA_POPULATE] },
    );
    if (!r) return null;
    return mapRow(r as EventRow);
  }

  private applyEventCameras(
    event: EventRow & Record<string, unknown>,
    data: Record<string, unknown>,
  ): void {
    const Camera = this.getCameraEntity();
    if (data.checkinCameraId !== undefined) {
      const raw = data.checkinCameraId;
      const id = raw === null || raw === '' ? '' : String(raw).trim();
      event.checkinCamera = id
        ? (this.getEm().getReference(Camera, toEntityId(id)) as EventRow['checkinCamera'])
        : null;
    }
    if (data.checkoutCameraId !== undefined) {
      const raw = data.checkoutCameraId;
      const id = raw === null || raw === '' ? '' : String(raw).trim();
      event.checkoutCamera = id
        ? (this.getEm().getReference(Camera, toEntityId(id)) as EventRow['checkoutCamera'])
        : null;
    }
  }

  private async syncCamerasForEvent(event: EventRow): Promise<void> {
    const Event = this.getEventEntity();
    const Camera = this.getCameraEntity();
    const eventId = event.id;
    const selected = new Set(
      [event.checkinCamera?.id, event.checkoutCamera?.id].filter(
        (id): id is number => typeof id === 'number' && id > 0,
      ),
    );

    for (const cameraId of selected) {
      const camera = (await this.getEm().findOne(Camera, {
        id: cameraId,
        deletedAt: null,
      })) as { linkedEvent?: unknown } | null;
      if (camera) {
        camera.linkedEvent = this.getEm().getReference(Event, toEntityId(eventId));
      }
    }

    const previouslyLinked = await this.getEm().find(Camera, {
      linkedEvent: eventId,
      deletedAt: null,
    } as FilterQuery<object>);

    for (const camera of previouslyLinked as Array<{ id: number; linkedEvent?: unknown }>) {
      if (!selected.has(camera.id)) {
        camera.linkedEvent = null;
      }
    }

    await this.getEm().flush();
  }

  async create(data: Record<string, unknown>): Promise<EventRowDto> {
    const Event = this.getEventEntity();
    const created = new Event() as EventRow & Record<string, unknown>;
    Object.assign(created, {
      title: data.title,
      slug: data.slug ?? null,
      poster:
        data.poster === undefined || data.poster === null
          ? null
          : normalizePosterField(data.poster),
      description: data.description ?? null,
      content: data.content ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      checkinStart: data.checkinStart ?? null,
      checkinEnd: data.checkinEnd ?? null,
      checkoutStart: data.checkoutStart ?? null,
      checkoutEnd: data.checkoutEnd ?? null,
      registrationStart: data.registrationStart ?? null,
      registrationEnd: data.registrationEnd ?? null,
      organizer: data.organizer ?? null,
      location: data.location ?? null,
      address: data.address ?? null,
      qrCode: data.qrCode ?? null,
      status: data.status ?? 1,
      totalRegistrations: 0,
      totalCheckins: 0,
      totalCheckouts: 0,
      allowCheckin: data.allowCheckin ?? true,
      allowCheckout: data.allowCheckout ?? true,
      requireFaceId: data.requireFaceId ?? false,
      maxParticipants: data.maxParticipants ?? 0,
      format: data.format ?? 'offline',
      onlineLink: data.onlineLink ?? null,
      schedule: data.schedule ?? null,
      isFeatured: Boolean(data.isFeatured),
      featuredOrder:
        typeof data.featuredOrder === 'number'
          ? data.featuredOrder
          : Number(data.featuredOrder) || 0,
    });
    this.applyEventCameras(created, data);
    await this.getEm().persistAndFlush(created);
    await this.syncCamerasForEvent(created);
    await this.getEm().populate(created, [...EVENT_CAMERA_POPULATE]);
    return mapRow(created);
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<EventRowDto | null> {
    const Event = this.getEventEntity();
    const existing = (await this.getEm().findOne(Event, {
      id: toEntityId(id),
    })) as (EventRow & Record<string, unknown>) | null;
    if (!existing) return null;
    const fields = [
      'title',
      'slug',
      'poster',
      'description',
      'content',
      'startDate',
      'endDate',
      'checkinStart',
      'checkinEnd',
      'checkoutStart',
      'checkoutEnd',
      'registrationStart',
      'registrationEnd',
      'organizer',
      'location',
      'address',
      'qrCode',
      'status',
      'allowCheckin',
      'allowCheckout',
      'requireFaceId',
      'maxParticipants',
      'format',
      'onlineLink',
      'schedule',
      'isFeatured',
      'featuredOrder',
    ] as const;
    for (const f of fields) {
      if (data[f] === undefined) continue;
      if (f === 'isFeatured') {
        existing.isFeatured = Boolean(data.isFeatured);
        continue;
      }
      if (f === 'featuredOrder') {
        existing.featuredOrder =
          typeof data.featuredOrder === 'number'
            ? data.featuredOrder
            : Number(data.featuredOrder) || 0;
        continue;
      }
      if (f === 'poster') {
        existing.poster =
          data.poster === null || data.poster === undefined
            ? null
            : normalizePosterField(data.poster);
        continue;
      }
      (existing as Record<string, unknown>)[f] = data[f];
    }
    this.applyEventCameras(existing, data);
    await this.getEm().persistAndFlush(existing);
    await this.syncCamerasForEvent(existing);
    await this.getEm().populate(existing, [...EVENT_CAMERA_POPULATE]);
    return mapRow(existing);
  }

  async softDelete(id: string): Promise<boolean> {
    const Event = this.getEventEntity();
    const r = (await this.getEm().findOne(Event, { id: toEntityId(id) })) as
      | (EventRow & { deletedAt?: Date | null })
      | null;
    if (!r || r.deletedAt) return false;
    r.deletedAt = new Date();
    await this.getEm().persistAndFlush(r);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const Event = this.getEventEntity();
    const r = (await this.getEm().findOne(Event, { id: toEntityId(id) })) as
      | (EventRow & { deletedAt?: Date | null })
      | null;
    if (!r || !r.deletedAt) return false;
    r.deletedAt = null;
    await this.getEm().persistAndFlush(r);
    return true;
  }

  async hardDelete(id: string): Promise<boolean> {
    const Event = this.getEventEntity();
    const r = await this.getEm().findOne(Event, { id: toEntityId(id) });
    if (!r) return false;
    await this.getEm().removeAndFlush(r);
    return true;
  }

  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    const Event = this.getEventEntity();
    return applyBulkAction(this.getEm(), Event, action, ids, { label: 'su kien' });
  }
}
