/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable } from '@nestjs/common';
import { pickHanetDeviceId, pickHanetString } from './hanet-payload';
import type { HanetWebhookBody } from './hanet.types';

export type HanetWebhookIngestEntry = {
  id: string;
  receivedAt: string;
  eventId: string | null;
  deviceId: string;
  personName: string;
  personType: string;
  placeId: string;
  dataType: string;
  actionType: string;
  keys: string[];
  processed: boolean;
  error: string | null;
};

const MAX_INGEST = 100;

@Injectable()
export class HanetWebhookIngestService {
  private entries: HanetWebhookIngestEntry[] = [];

  push(
    body: HanetWebhookBody,
    meta: {
      eventId?: string;
      processed?: boolean;
      error?: string | null;
    } = {},
  ): HanetWebhookIngestEntry {
    const entry: HanetWebhookIngestEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: new Date().toISOString(),
      eventId: meta.eventId?.trim() || null,
      deviceId: pickHanetDeviceId(body),
      personName: pickHanetString(body, [
        'person_name',
        'personName',
        'name',
        'fullName',
      ]),
      personType: String(body.person_type ?? body.personType ?? ''),
      placeId: pickHanetString(body, ['placeID', 'placeId', 'place_id']),
      dataType: pickHanetString(body, ['data_type', 'dataType']),
      actionType: pickHanetString(body, ['action_type', 'actionType']),
      keys: Object.keys(body).slice(0, 24),
      processed: meta.processed ?? false,
      error: meta.error ?? null,
    };
    this.entries.unshift(entry);
    if (this.entries.length > MAX_INGEST) {
      this.entries.length = MAX_INGEST;
    }
    return entry;
  }

  markProcessed(id: string, error?: string | null): void {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry) return;
    entry.processed = !error;
    entry.error = error ?? null;
  }

  listRecent(limit = 20): HanetWebhookIngestEntry[] {
    return this.entries.slice(0, Math.max(1, Math.min(limit, MAX_INGEST)));
  }

  getStats() {
    const latest = this.entries[0];
    return {
      totalBuffered: this.entries.length,
      lastReceivedAt: latest?.receivedAt ?? null,
      lastDeviceId: latest?.deviceId ?? null,
      lastPersonName: latest?.personName ?? null,
    };
  }
}
