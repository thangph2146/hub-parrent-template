/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { toEntityId } from '../common';
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { EntityManager, type FilterQuery } from '@mikro-orm/core';

import { Event } from '../entities/event.entity';

import { Camera } from '../entities/camera.entity';

import { EventRegistrationAttendanceService } from '../event-registrations/event-registration-attendance.service';

import { getHanetConfig } from './hanet.config';
import { verifyHanetWebhookHash } from './hanet-signature';
import { findEventRegistrationForHanet } from './hanet-registration-match';
import { HanetSyncService } from './hanet-sync.service';
import { HanetRealtimeService } from './hanet-realtime.service';
import {
  HANET_PERSON_ID_KEYS,
  HANET_PERSON_NAME_KEYS,
  isHanetSyncWebhook,
  pickHanetDeviceId,
  pickHanetString,
  pickHanetTimestamp,
  pickHanetAttendanceKind,
} from './hanet-payload';

import type {
  HanetCameraRole,
  HanetResolveContext,
  HanetWebhookBody,
  HanetWebhookHandleResult,
  HanetWebhookResult,
} from './hanet.types';

const EVENT_CAMERA_POPULATE = ['checkinCamera', 'checkoutCamera'] as const;

function resolveAttendanceKind(
  body: HanetWebhookBody,
  cameraRole: HanetCameraRole | null,
): HanetCameraRole {
  return pickHanetAttendanceKind(body) ?? cameraRole ?? 'checkin';
}

@Injectable()
export class HanetWebhookService {
  private readonly logger = new Logger(HanetWebhookService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly attendanceService: EventRegistrationAttendanceService,
    private readonly syncService: HanetSyncService,
    private readonly realtimeService: HanetRealtimeService,
  ) {}

  assertWebhookTrusted(body: HanetWebhookBody): void {
    const config = getHanetConfig();
    if (!config.webhookVerify || !config.clientSecret) return;

    const recordId = pickHanetString(body, ['id']);
    const hash = pickHanetString(body, ['hash']);

    if (!recordId || !hash) {
      if (config.webhookVerifyRequired) {
        throw new UnauthorizedException('Webhook HANET thiếu id/hash');
      }
      this.logger.warn('HANET webhook thiếu id/hash — bỏ qua verify (dev)');
      return;
    }

    if (!verifyHanetWebhookHash(config.clientSecret, recordId, hash)) {
      throw new UnauthorizedException('Hash webhook HANET không hợp lệ');
    }

    const keycode = pickHanetString(body, ['keycode']);
    if (config.webhookKeycode && keycode && keycode !== config.webhookKeycode) {
      throw new UnauthorizedException('keycode webhook HANET không khớp');
    }
  }

  async handleWebhook(
    eventIdParam: string | undefined,
    body: HanetWebhookBody,
  ): Promise<HanetWebhookHandleResult> {
    this.assertWebhookTrusted(body);

    let result: HanetWebhookHandleResult;
    if (isHanetSyncWebhook(body)) {
      this.logger.debug(
        `HANET sync data_type=${pickHanetString(body, ['data_type', 'dataType'])} action=${pickHanetString(body, ['action_type', 'actionType'])}`,
      );
      result = await this.syncService.handleSync(body);
    } else {
      result = await this.handleAttendance(eventIdParam, body);
    }

    const routeEventId = eventIdParam?.trim()
      ? toEntityId(eventIdParam)
      : null;
    this.realtimeService.emitWebhookResult(result, routeEventId);
    return result;
  }

  async handleAttendance(
    eventIdParam: string | undefined,
    body: HanetWebhookBody,
  ): Promise<HanetWebhookResult> {
    const { eventId, cameraRole } = await this.resolveContext(
      eventIdParam,
      body,
    );

    const kind = resolveAttendanceKind(body, cameraRole);
    const at = pickHanetTimestamp(body);
    const fullName = pickHanetString(body, HANET_PERSON_NAME_KEYS) || 'Khách';
    const aliasId = pickHanetString(body, HANET_PERSON_ID_KEYS);
    const emailFromBody = pickHanetString(body, ['email', 'personEmail']);
    const email =
      emailFromBody ||
      (aliasId.includes('@') ? aliasId : `${aliasId || 'hanet'}@hanet.local`);

    const registration = await findEventRegistrationForHanet(
      this.em,
      String(eventId),
      body,
      email,
      fullName,
    );

    if (!registration) {
      throw new BadRequestException(
        'Người này chưa có trong danh sách đăng ký sự kiện',
      );
    }

    if (kind === 'checkin') {
      const result = await this.attendanceService.recordCheckin({
        eventId,
        registration,
        at,
        source: 'hanet',
        deviceId: pickHanetDeviceId(body) || null,
        deviceName:
          pickHanetString(body, ['deviceName', 'device_name']) || null,
      });

      return {
        kind: 'checkin',
        eventId,
        email: result.email,
        fullName: result.fullName,
        registrationId: result.registrationId,
        checkinId: null,
        at: result.at,
        duplicate: result.duplicate,
      };
    }

    const result = await this.attendanceService.recordCheckout({
      eventId,
      registration,
      at,
      source: 'hanet',
    });

    return {
      kind: 'checkout',
      eventId,
      email: result.email,
      fullName: result.fullName,
      registrationId: result.registrationId,
      checkinId: null,
      at: result.at,
      duplicate: result.duplicate,
    };
  }

  async resolveContext(
    eventIdParam: string | undefined,
    body: HanetWebhookBody,
  ): Promise<HanetResolveContext> {
    const deviceId = pickHanetDeviceId(body);
    const fromParam = eventIdParam?.trim();

    if (fromParam) {
      const event = await this.em.findOne(Event, {
        id: toEntityId(fromParam),
        deletedAt: null,
      });

      if (!event) {
        throw new NotFoundException('Không tìm thấy sự kiện');
      }

      const cameraRole = deviceId
        ? await this.inferCameraRole(event.id, deviceId)
        : null;

      return { eventId: event.id, cameraRole };
    }

    if (!deviceId) {
      throw new BadRequestException(
        'Thiếu eventId trên URL hoặc deviceID trong payload HANET',
      );
    }

    const eventCheckin = await this.em.findOne(
      Event,
      {
        deletedAt: null,
        checkinCamera: { code: deviceId, deletedAt: null },
      } as FilterQuery<Event>,
    );

    if (eventCheckin) {
      this.logger.debug(
        `HANET deviceID=${deviceId} → event ${eventCheckin.id} (camera check-in)`,
      );
      return { eventId: eventCheckin.id, cameraRole: 'checkin' };
    }

    const eventCheckout = await this.em.findOne(
      Event,
      {
        deletedAt: null,
        checkoutCamera: { code: deviceId, deletedAt: null },
      } as FilterQuery<Event>,
    );

    if (eventCheckout) {
      this.logger.debug(
        `HANET deviceID=${deviceId} → event ${eventCheckout.id} (camera check-out)`,
      );
      return { eventId: eventCheckout.id, cameraRole: 'checkout' };
    }

    const camera = await this.em.findOne(
      Camera,
      { code: deviceId, deletedAt: null } as FilterQuery<Camera>,
      { populate: ['linkedEvent'] },
    );

    const linkedId = camera?.linkedEvent?.id;

    if (linkedId) {
      const event = await this.em.findOne(Event, {
        id: linkedId,
        deletedAt: null,
      });

      if (event) {
        const role = await this.inferCameraRole(event.id, deviceId);
        this.logger.debug(
          `HANET deviceID=${deviceId} → event ${linkedId} (camera "${camera!.name}")`,
        );
        return { eventId: event.id, cameraRole: role };
      }
    }

    if (camera) {
      this.logger.warn(
        `HANET deviceID=${deviceId} khớp camera "${camera.name}" nhưng chưa gắn sự kiện`,
      );
    }

    throw new BadRequestException(
      `Thiếu eventId. Gắn sự kiện cho camera (code=${deviceId}) hoặc dùng POST /api/public/hanet/webhook/{eventId}`,
    );
  }

  private async inferCameraRole(
    eventId: number,
    deviceId: string,
  ): Promise<HanetCameraRole | null> {
    const event = await this.em.findOne(
      Event,
      { id: eventId, deletedAt: null },
      { populate: [...EVENT_CAMERA_POPULATE] },
    );

    if (!event) return null;

    const isCheckin = event.checkinCamera?.code === deviceId;
    const isCheckout = event.checkoutCamera?.code === deviceId;

    if (isCheckin && isCheckout) return null;
    if (isCheckout) return 'checkout';
    if (isCheckin) return 'checkin';
    return null;
  }
}
