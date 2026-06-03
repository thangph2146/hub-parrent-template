import { Injectable } from '@nestjs/common';
import { EntityManager, QueryOrder, type FilterQuery } from '@mikro-orm/core';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { normalizePageLimit, paginationMeta } from '../common/pagination';
import { normalizePosterField } from '../common/poster-normalize';
import { resolveEventTimeStatus } from '../common/event-time-status';
import { EventRegistrationsService } from '../event-registrations/event-registrations.service';
import { EventSpeakersService } from '../event-speakers/event-speakers.service';

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
}

export interface PublicEventItem {
  id: string;
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

export type PublicViewerRegistration = {
  id: string;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
};

export type PublicEventSpeaker = {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  avatar: string | null;
  role: string | null;
  presentationTitle: string | null;
  duration: number | null;
  startTime: string | null;
  endTime: string | null;
  sortOrder: number;
};

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

interface PublicEventsResult {
  data: PublicEventItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

function mapItem(r: Event): PublicEventItem {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug ?? null,
    poster: normalizePosterField(r.poster),
    description: r.description ?? null,
    startDate: toIso(r.startDate),
    endDate: toIso(r.endDate),
    checkinStart: toIso(r.checkinStart),
    checkinEnd: toIso(r.checkinEnd),
    registrationStart: toIso(r.registrationStart),
    registrationEnd: toIso(r.registrationEnd),
    organizer: r.organizer ?? null,
    location: r.location ?? null,
    address: r.address ?? null,
    format: r.format,
    onlineLink: r.onlineLink ?? null,
    schedule: r.schedule ?? null,
    createdAt: toIso(r.createdAt) ?? '',
    updatedAt: toIso(r.updatedAt) ?? '',
    isFeatured: r.isFeatured ?? false,
    featuredOrder: r.featuredOrder ?? 0,
    timeStatus: resolveEventTimeStatus(r.startDate, r.endDate),
  };
}

function mapDetail(r: Event): PublicEventDetail {
  return {
    ...mapItem(r),
    content: r.content ?? null,
    qrCode: r.qrCode ?? null,
    allowCheckin: r.allowCheckin,
    allowCheckout: r.allowCheckout,
    requireFaceId: r.requireFaceId,
    maxParticipants: r.maxParticipants,
    totalRegistrations: r.totalRegistrations,
    totalCheckins: r.totalCheckins,
    totalCheckouts: r.totalCheckouts,
  };
}

@Injectable()
export class PublicEventsService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventRegistrationsService: EventRegistrationsService,
    private readonly eventSpeakersService: EventSpeakersService,
  ) {}

  async list(params: PublicEventsQuery): Promise<PublicEventsResult> {
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      50,
    );

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
    ) as FilterQuery<Event>;
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

    if (timeFilter) {
      const allRows = await this.em.find(Event, whereQuery, {
        orderBy,
        fields: [...fields] as any,
      });
      const matched = allRows.filter(
        (row) =>
          resolveEventTimeStatus(row.startDate, row.endDate, now) ===
          timeFilter,
      );
      const total = matched.length;
      const rows = matched.slice(skip, skip + limit);
      return {
        data: rows.map(mapItem),
        meta: paginationMeta(page, limit, total),
      };
    }

    const [rows, total] = await Promise.all([
      this.em.find(Event, whereQuery, {
        orderBy,
        offset: skip,
        limit,
        fields: [...fields] as any,
      }),
      this.em.count(Event, whereQuery),
    ]);

    return {
      data: rows.map(mapItem),
      meta: paginationMeta(page, limit, total),
    };
  }

  private async resolveViewerRegistration(
    eventId: string,
    viewerUserId: string,
  ): Promise<PublicViewerRegistration | null> {
    const user = await this.em.findOne(User, {
      id: viewerUserId.trim(),
      deletedAt: null,
      isActive: true,
    });
    if (!user?.email) return null;

    const registration =
      await this.eventRegistrationsService.findActiveByEventAndEmail(
        eventId,
        user.email,
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
    const r = await this.em.findOne(Event, {
      slug,
      status: 1,
      deletedAt: null,
    });
    if (!r) return null;

    const totalRegistrations =
      await this.eventRegistrationsService.syncEventRegistrationCount(r.id);
    r.totalRegistrations = totalRegistrations;

    const detail = mapDetail(r);
    const viewerId = viewerUserId?.trim();

    const [speakersResult, registrants, myRegistration] = await Promise.all([
      this.eventSpeakersService.list({
        eventId: r.id,
        page: 1,
        limit: 50,
      }),
      this.eventRegistrationsService.listPublicForEvent(r.id, 100),
      viewerId
        ? this.resolveViewerRegistration(r.id, viewerId)
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
