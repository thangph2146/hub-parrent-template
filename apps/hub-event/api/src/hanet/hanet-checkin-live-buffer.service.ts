/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable, Logger } from '@nestjs/common';
import { getHanetConfig } from './hanet.config';
import {
  parseHanetCompactTime,
  pickHanetDeviceId,
  pickHanetString,
} from './hanet-payload';
import { HanetPartnerService } from './hanet-partner.service';
import {
  formatHanetCheckinDayDate,
  formatHanetCompactTimestamp,
} from './hanet-partner.response';
import type {
  HanetWebhookBody,
  HanetWebhookHandleResult,
  HanetWebhookResult,
} from './hanet.types';

type BufferedCheckin = {
  placeId: string;
  at: Date;
  kind: 'checkin' | 'checkout';
  fullName: string;
  personId: string;
  aliasId: string;
  deviceId: string;
  deviceName: string;
};

const MAX_ENTRIES = 2_000;
const MAX_AGE_MS = 48 * 60 * 60 * 1000;
const DEVICE_PLACE_CACHE_MS = 60 * 60 * 1000;

function isAttendanceResult(
  result: HanetWebhookHandleResult,
): result is HanetWebhookResult {
  return result.kind === 'checkin' || result.kind === 'checkout';
}

function resolveRangeBound(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const compact = parseHanetCompactTime(trimmed);
  if (compact) return compact;

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

@Injectable()
export class HanetCheckinLiveBufferService {
  private readonly logger = new Logger(HanetCheckinLiveBufferService.name);
  private entries: BufferedCheckin[] = [];
  private readonly devicePlaceCache = new Map<
    string,
    { placeId: string; cachedAt: number }
  >();

  constructor(private readonly partner: HanetPartnerService) {}

  async record(
    result: HanetWebhookHandleResult,
    body?: HanetWebhookBody,
  ): Promise<void> {
    if (!isAttendanceResult(result)) return;

    const placeId = await this.resolvePlaceId(result, body);
    if (!placeId) {
      this.logger.warn(
        `HANET live buffer bỏ qua — không xác định placeId (device=${(result.deviceId ?? (body ? pickHanetDeviceId(body) : '')) || '—'})`,
      );
      return;
    }

    const at = new Date(result.at);
    if (Number.isNaN(at.getTime())) return;

    this.entries.unshift({
      placeId,
      at,
      kind: result.kind,
      fullName: result.fullName,
      personId: String(result.personId ?? '').trim(),
      aliasId: String(result.personId ?? '').trim(),
      deviceId: String(result.deviceId ?? '').trim(),
      deviceName: String(result.deviceName ?? '').trim(),
    });
    this.prune();
    this.logger.log(
      `HANET live buffer +1 ${result.kind} place=${placeId} person=${result.fullName}`,
    );
  }

  getStats() {
    return {
      totalBuffered: this.entries.length,
      latestAt: this.entries[0]?.at.toISOString() ?? null,
    };
  }

  mergeDayRows(
    placeId: string,
    date: string,
    partnerRows: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const day = formatHanetCheckinDayDate(date);
    const buffered = this.entries
      .filter(
        (entry) =>
          entry.placeId === placeId &&
          formatHanetCheckinDayDate(entry.at) === day,
      )
      .map((entry) => this.toPartnerRow(entry));

    return this.prependUnique(buffered, partnerRows);
  }

  mergeTimestampRows(
    placeId: string,
    from: string,
    to: string,
    partnerRows: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const fromAt = resolveRangeBound(from);
    const toAt = resolveRangeBound(to);
    if (!fromAt || !toAt) return partnerRows;

    const buffered = this.entries
      .filter(
        (entry) =>
          entry.placeId === placeId &&
          entry.at.getTime() >= fromAt.getTime() &&
          entry.at.getTime() <= toAt.getTime(),
      )
      .map((entry) => this.toPartnerRow(entry));

    return this.prependUnique(buffered, partnerRows);
  }

  private async resolvePlaceId(
    result: HanetWebhookResult,
    body?: HanetWebhookBody,
  ): Promise<string> {
    const fromResult = String(result.placeId ?? '').trim();
    if (fromResult) return fromResult;

    const fromBody = body
      ? pickHanetString(body, ['placeID', 'placeId', 'place_id'])
      : '';
    if (fromBody) return fromBody;

    const defaultPlaceId = getHanetConfig().defaultPlaceId.trim();
    if (defaultPlaceId) return defaultPlaceId;

    const deviceId =
      String(result.deviceId ?? '').trim() ||
      (body ? pickHanetDeviceId(body) : '');
    if (!deviceId) return '';

    return this.resolvePlaceByDevice(deviceId);
  }

  private async resolvePlaceByDevice(deviceId: string): Promise<string> {
    const cached = this.devicePlaceCache.get(deviceId);
    if (cached && Date.now() - cached.cachedAt < DEVICE_PLACE_CACHE_MS) {
      return cached.placeId;
    }

    try {
      const placeId = await this.partner.resolvePlaceIdByDeviceId(deviceId);
      if (placeId) {
        this.devicePlaceCache.set(deviceId, {
          placeId,
          cachedAt: Date.now(),
        });
      }
      return placeId;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `HANET resolve place từ device ${deviceId} thất bại: ${message}`,
      );
      return '';
    }
  }

  private toPartnerRow(entry: BufferedCheckin): Record<string, unknown> {
    return {
      name: entry.fullName,
      personID: entry.personId || entry.aliasId,
      aliasID: entry.aliasId,
      deviceID: entry.deviceId,
      deviceName: entry.deviceName,
      type: entry.kind === 'checkout' ? 1 : 0,
      checkinTime: entry.at.getTime(),
      time: formatHanetCompactTimestamp(entry.at),
      _hubLive: true,
    };
  }

  private rowKey(row: Record<string, unknown>): string {
    const personId = String(row.personID ?? row.personId ?? '').trim();
    const deviceId = String(row.deviceID ?? row.deviceId ?? '').trim();
    const rawTime = row.checkinTime ?? row.time ?? row.timestamp;
    const type = String(row.type ?? row.person_type ?? '').trim();
    return [personId, deviceId, String(rawTime), type].join('|').toLowerCase();
  }

  private prependUnique(
    buffered: Record<string, unknown>[],
    partnerRows: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    if (buffered.length === 0) return partnerRows;

    const seen = new Set(partnerRows.map((row) => this.rowKey(row)));
    const prepended: Record<string, unknown>[] = [];

    for (const row of buffered) {
      const key = this.rowKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      prepended.push(row);
    }

    if (prepended.length === 0) return partnerRows;
    return [...prepended, ...partnerRows];
  }

  private prune(): void {
    const cutoff = Date.now() - MAX_AGE_MS;
    this.entries = this.entries
      .filter((entry) => entry.at.getTime() >= cutoff)
      .slice(0, MAX_ENTRIES);
  }
}
