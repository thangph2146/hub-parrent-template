/**
 * Event speakers admin service — logic dùng chung; app binding entity.
 */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
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
import { toEntityId } from '../../entity-id';

export interface EventSpeakerRowDto {
  id: number;
  eventId: number;
  speakerId: number;
  speakerName: string;
  speakerTitle: string | null;
  speakerOrganization: string | null;
  speakerAvatar: string | null;
  sortOrder: number;
  role: string | null;
  presentationTitle: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  attachments: unknown;
}

export interface ListEventSpeakersParams {
  eventId: string | number;
  page: number;
  limit: number;
}

export interface ListEventSpeakersResult {
  data: EventSpeakerRowDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type EventSpeakerWithRelations = {
  id: number;
  sortOrder: number;
  role?: string | null;
  presentationTitle?: string | null;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  duration?: number | null;
  attachments?: unknown;
  event: { id: number };
  speaker: {
    id: number;
    name: string;
    title?: string | null;
    organization?: string | null;
    avatar?: string | null;
  };
};

function mapRow(r: EventSpeakerWithRelations): EventSpeakerRowDto {
  return {
    id: r.id,
    eventId: r.event.id,
    speakerId: r.speaker.id,
    speakerName: r.speaker.name,
    speakerTitle: r.speaker.title ?? null,
    speakerOrganization: r.speaker.organization ?? null,
    speakerAvatar: r.speaker.avatar ?? null,
    sortOrder: r.sortOrder,
    role: r.role ?? null,
    presentationTitle: r.presentationTitle ?? null,
    startTime: safeIsoString(r.startTime),
    endTime: safeIsoString(r.endTime),
    duration: r.duration ?? null,
    attachments: r.attachments ?? null,
  };
}

@Injectable()
export abstract class BaseEventSpeakersService {
  protected abstract getEm(): EntityManager;
  protected abstract getEventSpeakerEntity(): new () => Record<string, unknown>;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getSpeakerEntity(): new () => Record<string, unknown>;

  async list(
    params: ListEventSpeakersParams,
  ): Promise<ListEventSpeakersResult> {
    const EventSpeaker = this.getEventSpeakerEntity();
    const { page, limit, skip } = normalizePageLimit(
      params.page,
      params.limit,
      ADMIN_TABLE_EXPORT_MAX_LIMIT,
    );
    const [rows, total] = await Promise.all([
      this.getEm().find(
        EventSpeaker,
        { event: toEntityId(params.eventId) },
        {
          populate: ['speaker', 'event'],
          orderBy: { sortOrder: 'ASC' },
          offset: skip,
          limit,
        },
      ),
      this.getEm().count(EventSpeaker, { event: toEntityId(params.eventId) }),
    ]);
    return {
      data: (rows as EventSpeakerWithRelations[]).map(mapRow),
      pagination: paginationMeta(page, limit, total),
    };
  }

  async getById(id: string): Promise<EventSpeakerRowDto | null> {
    const EventSpeaker = this.getEventSpeakerEntity();
    const r = await this.getEm().findOne(
      EventSpeaker,
      { id: toEntityId(id) },
      { populate: ['speaker', 'event'] },
    );
    if (!r) return null;
    return mapRow(r as EventSpeakerWithRelations);
  }

  async create(data: {
    eventId: string;
    speakerId: number;
    sortOrder?: number;
    role?: string | null;
    presentationTitle?: string | null;
    startTime?: Date | string | null;
    endTime?: Date | string | null;
    duration?: number | null;
  }): Promise<EventSpeakerRowDto> {
    const EventSpeaker = this.getEventSpeakerEntity();
    const created = new EventSpeaker() as EventSpeakerWithRelations;
    created.event = this.getEm().getReference(
      this.getEventEntity(),
      toEntityId(data.eventId),
    ) as { id: number };
    created.speaker = this.getEm().getReference(
      this.getSpeakerEntity(),
      toEntityId(data.speakerId),
    ) as EventSpeakerWithRelations['speaker'];
    if (data.sortOrder !== undefined) created.sortOrder = data.sortOrder;
    if (data.role !== undefined) created.role = data.role;
    if (data.presentationTitle !== undefined) {
      created.presentationTitle = data.presentationTitle;
    }
    if (data.startTime !== undefined) {
      created.startTime =
        typeof data.startTime === 'string'
          ? new Date(data.startTime)
          : data.startTime;
    }
    if (data.endTime !== undefined) {
      created.endTime =
        typeof data.endTime === 'string'
          ? new Date(data.endTime)
          : data.endTime;
    }
    if (data.duration !== undefined) created.duration = data.duration;
    await this.getEm().persistAndFlush(created);
    await this.getEm().populate(created, ['speaker', 'event']);
    return mapRow(created);
  }

  async update(
    id: string,
    data: {
      speakerId?: number;
      sortOrder?: number;
      role?: string | null;
      presentationTitle?: string | null;
      startTime?: Date | string | null;
      endTime?: Date | string | null;
      duration?: number | null;
    },
  ): Promise<EventSpeakerRowDto | null> {
    const EventSpeaker = this.getEventSpeakerEntity();
    const existing = (await this.getEm().findOne(
      EventSpeaker,
      { id: toEntityId(id) },
      { populate: ['speaker', 'event'] },
    )) as EventSpeakerWithRelations | null;
    if (!existing) return null;
    if (data.speakerId !== undefined) {
      existing.speaker = this.getEm().getReference(
        this.getSpeakerEntity(),
        toEntityId(data.speakerId),
      ) as EventSpeakerWithRelations['speaker'];
    }
    if (data.sortOrder !== undefined) existing.sortOrder = data.sortOrder;
    if (data.role !== undefined) existing.role = data.role;
    if (data.presentationTitle !== undefined) {
      existing.presentationTitle = data.presentationTitle;
    }
    if (data.startTime !== undefined) {
      existing.startTime =
        typeof data.startTime === 'string'
          ? new Date(data.startTime)
          : data.startTime;
    }
    if (data.endTime !== undefined) {
      existing.endTime =
        typeof data.endTime === 'string'
          ? new Date(data.endTime)
          : data.endTime;
    }
    if (data.duration !== undefined) existing.duration = data.duration;
    await this.getEm().persistAndFlush(existing);
    return mapRow(existing);
  }

  async delete(id: string): Promise<boolean> {
    const EventSpeaker = this.getEventSpeakerEntity();
    const r = await this.getEm().findOne(EventSpeaker, { id: toEntityId(id) });
    if (!r) return false;
    await this.getEm().removeAndFlush(r);
    return true;
  }

  async bulk(action: BulkAction, ids: string[]): Promise<BulkResult> {
    const EventSpeaker = this.getEventSpeakerEntity();
    return applyBulkAction(this.getEm(), EventSpeaker, action, ids, {
      label: 'gan dien gia',
    });
  }
}
