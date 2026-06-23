import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { toEntityId } from '../common';
import { Event } from '../entities/event.entity';
import { HanetAdminService } from './hanet-admin.service';
import { normalizeHanetBody } from './hanet-payload';
import { resolveHanetPlaceId } from './hanet-place-resolve';
import { formatHanetCheckinDayDate } from './hanet-partner.response';
import { HanetPartnerService } from './hanet-partner.service';
import { HanetWebhookService } from './hanet-webhook.service';
import type { HanetWebhookBody } from './hanet.types';

export type EventHanetReconcileInput = {
  placeId?: string;
  date?: string;
  from?: string;
  to?: string;
};

export type EventHanetReconcileResult = {
  eventId: string;
  placeId: string;
  mode: 'day' | 'timestamp';
  total: number;
  applied: number;
  duplicates: number;
  unmatched: number;
  errors: number;
};

function eventLocalDay(value: Date | null | undefined): string {
  if (!value) return formatHanetCheckinDayDate(new Date());
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, '0');
  const dd = String(value.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function rowTimestampMs(row: HanetWebhookBody): number {
  const raw =
    row.time ??
    row.checkinTime ??
    row.timestamp ??
    row.date_time ??
    row.dateTime;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

@Injectable()
export class EventHanetReconcileService {
  private readonly logger = new Logger(EventHanetReconcileService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly partner: HanetPartnerService,
    private readonly hanetAdmin: HanetAdminService,
    private readonly webhook: HanetWebhookService,
  ) {}

  async reconcile(
    eventId: string,
    input: EventHanetReconcileInput = {},
  ): Promise<EventHanetReconcileResult> {
    const id = toEntityId(eventId);
    const event = await this.em.findOne(
      Event,
      { id, deletedAt: null },
      { populate: ['checkinCamera', 'checkoutCamera'] },
    );
    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const placeId = await resolveHanetPlaceId(this.partner, input.placeId);
    const from = input.from?.trim();
    const to = input.to?.trim();
    const useTimestamp = Boolean(from && to);

    let rows: Record<string, unknown>[] = [];
    let mode: EventHanetReconcileResult['mode'] = 'day';

    if (useTimestamp) {
      mode = 'timestamp';
      const data = await this.hanetAdmin.getCheckinsByPlaceTimestamp(
        placeId,
        from!,
        to!,
      );
      rows = Array.isArray(data.rows) ? data.rows : [];
    } else {
      const day =
        input.date?.trim().slice(0, 10) ||
        eventLocalDay(event.startDate ?? event.checkinStart ?? null);
      const data = await this.hanetAdmin.getCheckinsByPlaceDay(placeId, day);
      rows = Array.isArray(data.rows) ? data.rows : [];
    }

    const checkinCode = event.checkinCamera?.code?.trim() || null;
    const checkoutCode = event.checkoutCamera?.code?.trim() || null;

    const filtered = rows.filter((raw) => {
      if (!checkinCode && !checkoutCode) return true;
      const body = normalizeHanetBody(raw);
      const deviceId = String(
        body.deviceID ?? body.deviceId ?? body.camera_id ?? '',
      ).trim();
      if (!deviceId) return true;
      if (checkinCode && deviceId === checkinCode) return true;
      if (checkoutCode && deviceId === checkoutCode) return true;
      return false;
    });

    const sorted = [...filtered].sort(
      (a, b) => rowTimestampMs(normalizeHanetBody(a)) - rowTimestampMs(normalizeHanetBody(b)),
    );

    let applied = 0;
    let duplicates = 0;
    let unmatched = 0;
    let errors = 0;

    for (const raw of sorted) {
      const body = normalizeHanetBody(raw);
      try {
        const result = await this.webhook.handleAttendance(String(id), body);
        if (!result.registrationId) {
          unmatched += 1;
          continue;
        }
        if (result.duplicate) duplicates += 1;
        else applied += 1;
      } catch (error) {
        errors += 1;
        const message =
          error instanceof Error ? error.message : String(error ?? 'unknown');
        this.logger.debug(
          `HANET reconcile bỏ qua event=${id}: ${message}`,
        );
      }
    }

    if (filtered.length === 0 && rows.length > 0 && (checkinCode || checkoutCode)) {
      throw new BadRequestException(
        'Không có bản ghi HANET khớp camera đã gắn sự kiện — kiểm tra deviceID trên form sự kiện.',
      );
    }

    return {
      eventId: String(id),
      placeId,
      mode,
      total: sorted.length,
      applied,
      duplicates,
      unmatched,
      errors,
    };
  }
}
