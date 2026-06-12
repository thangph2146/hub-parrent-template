/**
 * HANET webhook service — logic dùng chung; app binding entity và attendance deps.
 */
import {
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { toEntityId } from '../../common/entity-id';
import {
  HANET_PERSON_ID_KEYS,
  HANET_PERSON_NAME_KEYS,
  pickHanetAttendanceKind,
  pickHanetDeviceId,
  pickHanetString,
  pickHanetTimestamp,
} from './hanet-payload';
import type {
  HanetAttendanceApplyResult,
  HanetCameraRole,
  HanetResolveContext,
  HanetWebhookBody,
  HanetWebhookResult,
} from './hanet.types';

const EVENT_CAMERA_POPULATE = ['checkinCamera', 'checkoutCamera'] as const;

type EventWithCameras = {
  id: number;
  checkinCamera?: { code?: string } | null;
  checkoutCamera?: { code?: string } | null;
};

type CameraWithEvent = {
  name?: string;
  linkedEvent?: { id: number } | null;
};

function resolveAttendanceKind(
  body: HanetWebhookBody,
  cameraRole: HanetCameraRole | null,
): HanetCameraRole {
  return pickHanetAttendanceKind(body) ?? cameraRole ?? 'checkin';
}

export abstract class BaseHanetWebhookService {
  protected readonly logger = new Logger(BaseHanetWebhookService.name);

  protected abstract getEm(): EntityManager;
  protected abstract getEventEntity(): new () => Record<string, unknown>;
  protected abstract getEventRegistrationEntity(): new () => Record<string, unknown>;
  protected abstract getCameraEntity(): new () => Record<string, unknown>;
  protected abstract recordCheckin(input: {
    eventId: number;
    registration: Record<string, unknown>;
    at: Date;
    source: 'hanet';
    deviceId?: string | null;
    deviceName?: string | null;
  }): Promise<HanetAttendanceApplyResult>;
  protected abstract recordCheckout(input: {
    eventId: number;
    registration: Record<string, unknown>;
    at: Date;
    source: 'hanet';
  }): Promise<HanetAttendanceApplyResult>;

  async resolveContext(
    eventIdParam: string | undefined,
    body: HanetWebhookBody,
  ): Promise<HanetResolveContext> {
    const Event = this.getEventEntity();
    const Camera = this.getCameraEntity();
    const deviceId = pickHanetDeviceId(body);
    const fromParam = eventIdParam?.trim();

    if (fromParam) {
      const event = await this.getEm().findOne(Event, {
        id: toEntityId(fromParam),
        deletedAt: null,
      });
      if (!event) {
        throw new NotFoundException('Không tìm thấy sự kiện');
      }
      const eventRow = event as EventWithCameras;
      const cameraRole = deviceId
        ? await this.inferCameraRole(eventRow.id, deviceId)
        : null;
      return { eventId: eventRow.id, cameraRole };
    }

    if (!deviceId) {
      throw new BadRequestException(
        'Thiếu eventId trên URL hoặc deviceID trong payload HANET',
      );
    }

    const eventCheckin = await this.getEm().findOne(Event, {
      deletedAt: null,
      checkinCamera: { code: deviceId, deletedAt: null },
    } as FilterQuery<object>);

    if (eventCheckin) {
      const row = eventCheckin as EventWithCameras;
      this.logger.debug(
        `HANET deviceID=${deviceId} → event ${row.id} (camera check-in)`,
      );
      return { eventId: row.id, cameraRole: 'checkin' };
    }

    const eventCheckout = await this.getEm().findOne(Event, {
      deletedAt: null,
      checkoutCamera: { code: deviceId, deletedAt: null },
    } as FilterQuery<object>);

    if (eventCheckout) {
      const row = eventCheckout as EventWithCameras;
      this.logger.debug(
        `HANET deviceID=${deviceId} → event ${row.id} (camera check-out)`,
      );
      return { eventId: row.id, cameraRole: 'checkout' };
    }

    const camera = await this.getEm().findOne(
      Camera,
      { code: deviceId, deletedAt: null } as FilterQuery<object>,
      { populate: ['linkedEvent'] },
    );

    const cameraRow = camera as CameraWithEvent | null;
    const linkedId = cameraRow?.linkedEvent?.id;

    if (linkedId) {
      const event = await this.getEm().findOne(Event, {
        id: linkedId,
        deletedAt: null,
      });
      if (event) {
        const eventRow = event as EventWithCameras;
        const cameraRole = await this.inferCameraRole(eventRow.id, deviceId);
        this.logger.debug(
          `HANET deviceID=${deviceId} → event ${linkedId} (camera "${cameraRow?.name ?? ''}")`,
        );
        return { eventId: eventRow.id, cameraRole };
      }
    }

    if (cameraRow) {
      this.logger.warn(
        `HANET deviceID=${deviceId} khớp camera "${cameraRow.name ?? ''}" nhưng chưa gắn sự kiện`,
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
    const Event = this.getEventEntity();
    const event = await this.getEm().findOne(
      Event,
      { id: eventId, deletedAt: null },
      { populate: [...EVENT_CAMERA_POPULATE] },
    );
    if (!event) return null;

    const row = event as EventWithCameras;
    const isCheckin = row.checkinCamera?.code === deviceId;
    const isCheckout = row.checkoutCamera?.code === deviceId;
    if (isCheckin && isCheckout) return null;
    if (isCheckout) return 'checkout';
    if (isCheckin) return 'checkin';
    return null;
  }

  async handleWebhook(
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

    const registration = await this.findRegistration(
      String(eventId),
      email,
      fullName,
    );

    if (!registration) {
      throw new BadRequestException(
        'Người này chưa có trong danh sách đăng ký sự kiện',
      );
    }

    if (kind === 'checkin') {
      const result = await this.recordCheckin({
        eventId,
        registration,
        at,
        source: 'hanet',
        deviceId: pickHanetDeviceId(body) || null,
        deviceName: pickHanetString(body, ['deviceName', 'device_name']) || null,
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

    const result = await this.recordCheckout({
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

  private async findRegistration(
    eventId: string,
    email: string,
    fullName: string,
  ): Promise<Record<string, unknown> | null> {
    const EventRegistration = this.getEventRegistrationEntity();
    const byEmail = await this.getEm().findOne(EventRegistration, {
      event: toEntityId(eventId),
      email,
      deletedAt: null,
    } as FilterQuery<object>);

    if (byEmail) return byEmail as Record<string, unknown>;

    if (fullName) {
      return (await this.getEm().findOne(EventRegistration, {
        event: toEntityId(eventId),
        fullName,
        deletedAt: null,
      } as FilterQuery<object>)) as Record<string, unknown> | null;
    }

    return null;
  }
}
