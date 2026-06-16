/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable } from '@nestjs/common';
import { SocketGateway } from '../socket/socket.gateway';
import type { EventHanetSyncSocketPayload } from '../socket/socket.types';
import type {
  HanetWebhookHandleResult,
  HanetWebhookResult,
} from './hanet.types';

const ACTION_LABELS: Record<string, string> = {
  add: 'Thêm',
  update: 'Cập nhật',
  delete: 'Xóa',
};

function isAttendanceResult(
  result: HanetWebhookHandleResult,
): result is HanetWebhookResult {
  return result.kind === 'checkin' || result.kind === 'checkout';
}

function actionLabel(action?: string): string {
  if (!action) return 'Cập nhật';
  return ACTION_LABELS[action] ?? action;
}

function buildSummary(result: HanetWebhookHandleResult): string {
  if (isAttendanceResult(result)) {
    const label = result.kind === 'checkin' ? 'Check-in' : 'Check-out';
    const dup = result.duplicate ? ' · trùng' : '';
    return `${label}: ${result.fullName} (${result.email})${dup}`;
  }

  const sync = result;
  const label = actionLabel(sync.action);

  if (sync.error) {
    return `${label} ${sync.kind}: ${sync.error}`;
  }

  switch (sync.kind) {
    case 'device':
      return `${label} thiết bị ${sync.deviceId ?? '—'}`;
    case 'place':
      return `${label} địa điểm ${sync.placeId ?? '—'}`;
    case 'person': {
      const name = sync.personName || sync.personId || '—';
      const parts = [`${label} người ${name}`];
      if (sync.linkedUserId) parts.push(`user #${sync.linkedUserId}`);
      if (sync.linkedRegistrations) {
        parts.push(`${sync.linkedRegistrations} đăng ký`);
      }
      return parts.join(' · ');
    }
    default:
      return sync.note || 'Webhook HANET';
  }
}

function toPayload(
  result: HanetWebhookHandleResult,
  routeEventId?: number | null,
): EventHanetSyncSocketPayload {
  const at = isAttendanceResult(result) ? result.at : new Date().toISOString();

  const eventId = isAttendanceResult(result)
    ? result.eventId
    : (routeEventId ?? null);

  if (isAttendanceResult(result)) {
    return {
      kind: result.kind,
      eventId,
      at,
      summary: buildSummary(result),
      email: result.email,
      fullName: result.fullName,
      registrationId: result.registrationId,
      duplicate: result.duplicate,
      acknowledged: true,
    };
  }

  const sync = result;
  return {
    kind: sync.kind,
    action: sync.action,
    eventId,
    at,
    summary: buildSummary(sync),
    deviceId: sync.deviceId,
    placeId: sync.placeId,
    personId: sync.personId,
    personName: sync.personName,
    entityId: sync.entityId,
    linkedUserId: sync.linkedUserId,
    linkedRegistrations: sync.linkedRegistrations,
    acknowledged: sync.acknowledged,
    error: sync.error,
  };
}

@Injectable()
export class HanetRealtimeService {
  constructor(private readonly socketGateway: SocketGateway) {}

  emitWebhookResult(
    result: HanetWebhookHandleResult,
    routeEventId?: number | null,
  ): void {
    this.socketGateway.emitEventHanetSync(toPayload(result, routeEventId));
  }
}
