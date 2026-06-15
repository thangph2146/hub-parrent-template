/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { Camera } from '../entities/camera.entity';
import { FaceData } from '../entities/face-data.entity';
import { Location } from '../entities/location.entity';
import { linkHanetPersonToRegistrationsByEmail } from './hanet-registration-match';
import { linkFaceDataToUserByEmail } from './hanet-user-link';
import {
  pickHanetActionType,
  pickHanetDataType,
  pickHanetString,
} from './hanet-payload';
import type { HanetSyncResult, HanetWebhookBody } from './hanet.types';
@Injectable()
export class HanetSyncService {
  private readonly logger = new Logger(HanetSyncService.name);

  constructor(private readonly em: EntityManager) {}

  async handleSync(body: HanetWebhookBody): Promise<HanetSyncResult> {
    const dataType = pickHanetDataType(body);
    const action = pickHanetActionType(body) || 'update';

    switch (dataType) {
      case 'device':
        return this.syncDevice(body, action);
      case 'place':
        return this.syncPlace(body, action);
      case 'person':
        return this.syncPerson(body, action);
      default:
        return {
          kind: 'unknown',
          dataType,
          action,
          acknowledged: true,
        };
    }
  }

  private async syncDevice(
    body: HanetWebhookBody,
    action: string,
  ): Promise<HanetSyncResult> {
    const deviceId = pickHanetString(body, [
      'deviceID',
      'deviceId',
      'device_id',
    ]);
    const deviceName =
      pickHanetString(body, ['deviceName', 'device_name']) || deviceId;

    if (!deviceId) {
      return { kind: 'device', action, acknowledged: false, error: 'Thiếu deviceID' };
    }

    if (action === 'delete') {
      const existing = await this.em.findOne(Camera, {
        code: deviceId,
        deletedAt: null,
      } as FilterQuery<Camera>);
      if (existing) {
        existing.deletedAt = new Date();
        await this.em.flush();
      }
      return { kind: 'device', action, deviceId, acknowledged: true };
    }

    let camera = await this.em.findOne(Camera, {
      code: deviceId,
      deletedAt: null,
    } as FilterQuery<Camera>);

    if (!camera) {
      const now = new Date();
      camera = this.em.create(Camera, {
        name: deviceName || deviceId,
        code: deviceId,
        status: 1,
        createdAt: now,
        updatedAt: now,
      });
      this.em.persist(camera);
    } else {
      camera.name = deviceName || camera.name;
    }

    await this.em.flush();

    return {
      kind: 'device',
      action,
      deviceId,
      entityId: camera.id,
      acknowledged: true,
    };
  }

  private async syncPlace(
    body: HanetWebhookBody,
    action: string,
  ): Promise<HanetSyncResult> {
    const placeId = pickHanetString(body, ['placeID', 'placeId', 'place_id']);
    const placeName = pickHanetString(body, ['placeName', 'place_name']);
    const mapUrl = placeId ? `hanet:place:${placeId}` : '';

    if (!placeId) {
      return { kind: 'place', action, acknowledged: false, error: 'Thiếu placeID' };
    }

    if (action === 'delete') {
      const existing = await this.em.findOne(Location, {
        mapUrl,
        deletedAt: null,
      } as FilterQuery<Location>);
      if (existing) {
        existing.deletedAt = new Date();
        await this.em.flush();
      }
      return { kind: 'place', action, placeId, acknowledged: true };
    }

    let location = await this.em.findOne(Location, {
      mapUrl,
      deletedAt: null,
    } as FilterQuery<Location>);

    if (!location) {
      const now = new Date();
      location = this.em.create(Location, {
        name: placeName || `HANET place ${placeId}`,
        mapUrl,
        status: 1,
        createdAt: now,
        updatedAt: now,
      });
      this.em.persist(location);
    } else if (placeName) {
      location.name = placeName;
    }

    await this.em.flush();

    return {
      kind: 'place',
      action,
      placeId,
      entityId: location.id,
      acknowledged: true,
    };
  }

  private async syncPerson(
    body: HanetWebhookBody,
    action: string,
  ): Promise<HanetSyncResult> {
    const personId = pickHanetString(body, [
      'personID',
      'personId',
      'person_id',
    ]);
    const personName = pickHanetString(body, ['personName', 'person_name']);
    const avatar = pickHanetString(body, ['avatar']);
    const aliasId = pickHanetString(body, ['aliasID', 'aliasId']);

    if (!personId) {
      return {
        kind: 'person',
        action,
        acknowledged: false,
        error: 'Thiếu personID',
      };
    }

    if (action === 'delete') {
      const existing = await this.em.findOne(FaceData, {
        hanetPersonId: personId,
        deletedAt: null,
      } as FilterQuery<FaceData>);
      if (existing) {
        existing.deletedAt = new Date();
        await this.em.flush();
      }
      return {
        kind: 'person',
        action,
        personId,
        acknowledged: true,
        entityId: existing?.id,
      };
    }

    const imagePath = avatar || `hanet:person:${personId}`;

    let face = await this.em.findOne(FaceData, {
      hanetPersonId: personId,
      deletedAt: null,
    } as FilterQuery<FaceData>);

    if (!face) {
      const now = new Date();
      face = this.em.create(FaceData, {
        hanetPersonId: personId,
        hanetAliasId: aliasId || null,
        displayName: personName || null,
        imagePath,
        status: 1,
        createdAt: now,
      });
      this.em.persist(face);
    } else {
      if (personName) face.displayName = personName;
      if (avatar) face.imagePath = avatar;
      if (aliasId) face.hanetAliasId = aliasId;
      face.updatedAt = new Date();
    }

    await this.em.flush();

    let linkedRegistrations = 0;
    let linkedUserId: number | undefined;
    const linkEmail = aliasId?.includes('@') ? aliasId : '';
    if (linkEmail) {
      linkedRegistrations = await linkHanetPersonToRegistrationsByEmail(
        this.em,
        personId,
        linkEmail,
      );
      const userId = await linkFaceDataToUserByEmail(this.em, face, linkEmail);
      if (userId) linkedUserId = userId;
    }

    this.logger.log(
      `HANET person ${action} id=${personId} name=${personName || '-'} faceData=${face.id} linkedRegs=${linkedRegistrations} linkedUser=${linkedUserId ?? '-'}`,
    );

    return {
      kind: 'person',
      action,
      personId,
      personName: personName || undefined,
      avatar: avatar || undefined,
      entityId: face.id,
      linkedRegistrations,
      linkedUserId,
      acknowledged: true,
    };
  }
}