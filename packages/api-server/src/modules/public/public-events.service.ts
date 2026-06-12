import { Injectable } from '@nestjs/common';
import { QueryOrder, type EntityManager, type FilterQuery } from '@mikro-orm/core';
import { relationEntityId } from '../../common';
import {
  ADMIN_TABLE_EXPORT_MAX_LIMIT,
  normalizePageLimit,
  paginationMeta,
} from '../../common/pagination';
import { normalizePosterField } from '../../common/poster-normalize';
import { resolveEventTimeStatus } from '../../common/event-time-status';
import type {
  IPublicEventsRegistrationsDeps,
  IPublicEventsSpeakersDeps,
  PublicEventSpeaker,
  PublicViewerRegistration,
} from './public-events.deps';

export type EventTimeFilter =
  | 'upcoming'
  | 'ongoing'
  | 'past'
  | 'all'
  | 'featured';

export interface PublicEventsQuery {
  page: number;
  limit: number;
  filter?: EventTimeFilter;
  categorySlug?: string;
  search?: string;
  registerable?: boolean;
}

export interface PublicEventItem {
  id: number;
  title: string;
  slug: string | null;
  poster: unknown;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  checkinStart: string | null;
  checkinEnd: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  organizer: string | null;
  location: string | null;
  address: string | null;
  format: number;
  onlineLink: string | null;
  schedule: unknown;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  featuredOrder: number;
  timeStatus: 'upcoming' | 'ongoing' | 'past';
}

export type PublicEventRegistrant = {
  fullName: string;
  registeredAt: string | null;
};

export interface PublicEventDetail extends PublicEventItem {
  content: unknown;
  qrCode: string | null;
  allowCheckin: boolean;
  allowCheckout: boolean;
  requireFaceId: boolean;
  maxParticipants: number;
  totalRegistrations: number;
  totalCheckins: number;
  totalCheckouts: number;
  myRegistration?: PublicViewerRegistration | null;
  speakers?: PublicEventSpeaker[];
  registrants?: PublicEventRegistrant[];
}

function toIso(
  value: Date | string | number | undefined | null,
): string | null {
  if (value == null) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === 'number')
    return Number.isNaN(value) ? null : new Date(value).toISOString();
  if (typeof value === 'string' && value.trim()) {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  }
  return null;
}

function mapItem(row: Record<string, unknown>): PublicEventItem {
  return {
    id: row.id as number,
    title: String(row.title ?? ''),
    slug: (row.slug as string | null | undefined) ?? null,
    poster: normalizePosterField(row.poster),
    description: (row.description as string | null | undefined) ?? null,
    startDate: toIso(row.startDate as never),
    endDate: toIso(row.endDate as never),
    checkinStart: toIso(row.checkinStart as never),
    checkinEnd: toIso(row.checkinEnd as never),
    registrationStart: toIso(row.registrationStart as never),
    registrationEnd: toIso(row.registrationEnd as never),
    organizer: (row.organizer as string | null | undefined) ?? null,
    location: (row.location as string | null | undefined) ?? null,
    address: (row.address as string | null | undefined) ?? null,
    format: Number(row.format ?? 0) || 0,
    onlineLink: (row.onlineLink as string | null | undefined) ?? null,
    schedule: row.schedule ?? null,
    createdAt: toIso(row.createdAt as never) ?? '',
    updatedAt: toIso(row.updatedAt as never) ?? '',
    isFeatured: Boolean(row.isFeatured),
    featuredOrder: Number(row.featuredOrder ?? 0) || 0,
    timeStatus: resolveEventTimeStatus(
      row.startDate as never,
      row.endDate as never,
    ),
  };
}

function isRegistrationOpen(
  row: Record<string, unknown>,
  now: Date,
): boolean {
  const endDate = row.endDate as Date | string | null | undefined;
  const registrationStart = row.registrationStart as Date | string | null | undefined;
  const registrationEnd = row.registrationEnd as Date | string | null | undefined;
  if (endDate && now > new Date(endDate)) return false;
  if (registrationStart && now < new Date(registrationStart)) return false;
  if (registrationEnd && now > new Date(registrationEnd)) return false;
  return true;
}

function mapDetail(row: Record<string, unknown>): PublicEventDetail {
  return {
    ...mapItem(row),
    content: row.content ?? null,
    qrCode: (row.qrCode as string | null | undefined) ?? null,
    allowCheckin: Boolean(row.allowCheckin),
    allowCheckout: Boolean(row.allowCheckout),
    requireFaceId: Boolean(row.requireFaceId),
    maxParticipants: Number(row.maxParticipants ?? 0) || 0,
    totalRegistrations: Number(row.totalRegistrations ?? 0) || 0,
    totalCheckins: Number(row.totalCheckins ?? 0) || 0,
    totalCheckouts: Number(row.totalCheckouts ?? 0) || 0,
  };
}

@Injectable()
export abstract class BasePublicEventsService {
  protected abstract getEm(): EntityManager;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getUserEntity(): new () => Record<string, unknown>;
  protected abstract getEventRegistrationsService(): IPublicEventsRegistrationsDeps;
  protected abstract getEventSpeakersService(): IPublicEventsSpeakersDeps;

  async list(params: PublicEventsQuery) {
    const em = this.getEm();
    const Event = this.getEventEntity();
    const { page, limit, skip } = normalizePageLimit(params.page, params.limit, 50);

    const now = new Date();
    const filter = params.filter ?? 'all';
    const timeFilter =
      filter === 'upcoming' || filter === 'ongoing' || filter === 'past'
        ? filter
        : null;

    const andConditions: Record<string, unknown>[] = [
      { status: 1, deletedAt: null },
    ];

    if (filter === 'featured') {
      andConditions.push({ isFeatured: true });
    }

    if (params.search?.trim()) {
      const q = `%${params.search.trim()}%`;
      andConditions.push({
        $or: [
          { title: { $like: q } },
          { description: { $like: q } },
          { location: { $like: q } },
          { address: { $like: q } },
          { organizer: { $like: q } },
          { slug: { $like: q } },
        ],
      });
    }

    const whereQuery = (
      andConditions.length === 1 ? andConditions[0] : { $and: andConditions }
    ) as FilterQuery<Record<string, unknown>>;
    const orderBy =
      filter === 'featured'
        ? { featuredOrder: QueryOrder.ASC, startDate: QueryOrder.DESC }
        : { startDate: QueryOrder.DESC };

    const fields = [
      'id',
      'title',
      'slug',
      'poster',
      'description',
      'startDate',
      'endDate',
      'checkinStart',
      'checkinEnd',
      'registrationStart',
      'registrationEnd',
      'organizer',
      'location',
      'address',
      'format',
      'onlineLink',
      'schedule',
      'createdAt',
      'updatedAt',
      'isFeatured',
      'featuredOrder',
    ] as const;

    const needsPostFilter = Boolean(timeFilter || params.registerable);

    if (needsPostFilter) {
      const allRows = await em.find(Event, whereQuery, {
        orderBy,
        fields: [...fields] as never,
      });
      let matched = allRows as Record<string, unknown>[];
      if (timeFilter) {
        matched = matched.filter(
          (row) =>
            resolveEventTimeStatus(row.startDate as never, row.endDate as never, now) ===
            timeFilter,
        );
      }
      if (params.registerable) {
        matched = matched.filter((row) => isRegistrationOpen(row, now));
      }
      const total = matched.length;
      const rows = matched.slice(skip, skip + limit);
      return {
        data: rows.map(mapItem),
        meta: paginationMeta(page, limit, total),
      };
    }

    const [rows, total] = await Promise.all([
      em.find(Event, whereQuery, {
        orderBy,
        offset: skip,
        limit,
        fields: [...fields] as never,
      }),
      em.count(Event, whereQuery),
    ]);

    return {
      data: (rows as Record<string, unknown>[]).map(mapItem),
      meta: paginationMeta(page, limit, total),
    };
  }

  private async resolveViewerRegistration(
    eventId: string | number,
    viewerUserId: string,
  ): Promise<PublicViewerRegistration | null> {
    const em = this.getEm();
    const User = this.getUserEntity();
    const viewerId = relationEntityId(viewerUserId.trim());
    if (viewerId == null) return null;

    const user = await em.findOne(User, {
      id: viewerId,
      deletedAt: null,
      isActive: true,
    } as never);
    const email = (user as Record<string, unknown> | null)?.email;
    if (!email) return null;

    const registration =
      await this.getEventRegistrationsService().findActiveByEventAndEmail(
        eventId,
        String(email),
      );
    if (!registration) return null;
    return {
      id: registration.id,
      email: registration.email,
      fullName: registration.fullName,
      status: registration.status,
      registeredAt: registration.registeredAt,
    };
  }

  async getBySlug(
    slug: string,
    viewerUserId?: string | null,
  ): Promise<PublicEventDetail | null> {
    const em = this.getEm();
    const Event = this.getEventEntity();
    const row = await em.findOne(Event, {
      slug,
      status: 1,
      deletedAt: null,
    } as never);
    if (!row) return null;

    const record = row as Record<string, unknown>;
    const totalRegistrations =
      await this.getEventRegistrationsService().syncEventRegistrationCount(
        record.id as string | number,
      );
    record.totalRegistrations = totalRegistrations;

    const detail = mapDetail(record);
    const viewerId = viewerUserId?.trim();

    const [speakersResult, registrants, myRegistration] = await Promise.all([
      this.getEventSpeakersService().list({
        eventId: record.id as string | number,
        page: 1,
        limit: 50,
      }),
      this.getEventRegistrationsService().listPublicForEvent(
        record.id as string | number,
        ADMIN_TABLE_EXPORT_MAX_LIMIT,
      ),
      viewerId
        ? this.resolveViewerRegistration(record.id as string | number, viewerId)
        : Promise.resolve(null),
    ]);

    const speakers: PublicEventSpeaker[] = speakersResult.data.map((s) => ({
      id: s.id,
      name: s.speakerName,
      title: s.speakerTitle,
      organization: s.speakerOrganization,
      avatar: s.speakerAvatar,
      role: s.role,
      presentationTitle: s.presentationTitle,
      duration: s.duration,
      startTime: s.startTime,
      endTime: s.endTime,
      sortOrder: s.sortOrder,
    }));

    return {
      ...detail,
      myRegistration,
      speakers,
      registrants,
    };
  }
}
