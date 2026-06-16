import { BadRequestException, Injectable } from '@nestjs/common';

import { HanetApiClient } from './hanet-api.client';

import { getHanetConfig, isHanetConfigured } from './hanet.config';

import { HanetPartnerService } from './hanet-partner.service';
import { HanetPersonAvatarSyncService } from './hanet-person-avatar-sync.service';
import { HanetSyncService } from './hanet-sync.service';
import { HanetRealtimeService } from './hanet-realtime.service';
import type { HanetPersonHubInput } from './hanet-partner-params';
import {
  buildHanetDeviceSyncBody,
  buildHanetPlaceSyncBody,
  type HanetSyncAction,
} from './hanet-mutation-sync';

import type {
  HanetCreatePlaceInput,
  HanetRegisterPersonByUrlInput,
  HanetRemovePlaceInput,
  HanetRemoveUserPartnerInput,
  HanetSetDeviceMqttInput,
  HanetTakeFacePictureInput,
  HanetUpdateDeviceInput,
  HanetUpdateFaceImageInput,
  HanetUpdateFaceUrlInput,
  HanetUpdatePartnerTokenInput,
  HanetUpdatePlaceInput,
} from './hanet-partner.types';

import { getHanetWebhookUrls } from './hanet-webhook-urls';

@Injectable()
export class HanetAdminService {
  constructor(
    private readonly hanetApi: HanetApiClient,

    private readonly partner: HanetPartnerService,

    private readonly avatarSync: HanetPersonAvatarSyncService,

    private readonly sync: HanetSyncService,

    private readonly realtime: HanetRealtimeService,
  ) {}

  private async applyPlacePartnerSync(
    action: HanetSyncAction,
    placeId: string,
    placeName?: string,
  ) {
    const result = await this.sync.handleSync(
      buildHanetPlaceSyncBody(action, placeId, placeName),
    );
    this.realtime.emitWebhookResult(result);
    return result;
  }

  private async applyDevicePartnerSync(
    action: HanetSyncAction,
    deviceId: string,
    deviceName: string,
    placeId: string,
    placeName?: string,
  ) {
    const result = await this.sync.handleSync(
      buildHanetDeviceSyncBody(
        action,
        deviceId,
        deviceName,
        placeId,
        placeName,
      ),
    );
    this.realtime.emitWebhookResult(result);
    return result;
  }

  getStatus(eventId?: string) {
    const config = getHanetConfig();

    return {
      configured: isHanetConfigured(config),

      webhookVerify: config.webhookVerify,

      webhookVerifyRequired: config.webhookVerifyRequired,

      clientId: config.clientId || null,

      hasAccessToken: Boolean(config.accessToken),

      hasRefreshToken: Boolean(config.refreshToken),

      apiBaseUrl: config.apiBaseUrl,

      defaultPlaceId: config.defaultPlaceId || null,

      urls: getHanetWebhookUrls(eventId),
    };
  }

  async testConnection() {
    const config = getHanetConfig();

    if (!isHanetConfigured(config)) {
      throw new BadRequestException(
        'Chưa cấu hình HANET — đặt HANET_CLIENT_ID và HANET_CLIENT_SECRET trong .env API',
      );
    }

    if (!config.accessToken && !config.refreshToken) {
      throw new BadRequestException(
        'Thiếu HANET_ACCESS_TOKEN hoặc HANET_REFRESH_TOKEN trong .env API',
      );
    }

    try {
      const token = await this.hanetApi.getAccessToken();

      const preview =
        token.length > 16 ? `${token.slice(0, 12)}…${token.slice(-4)}` : '***';

      return {
        ok: true,

        tokenPreview: preview,

        message: 'Lấy access token HANET thành công — OAuth/API sẵn sàng',
      };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Không kết nối được HANET OAuth/API';

      throw new BadRequestException(message);
    }
  }

  testPartnerApi() {
    return this.partner.probePartnerApi();
  }

  listPartnerUsers() {
    return this.partner.getListUserPartner();
  }

  removePartnerUser(input: HanetRemoveUserPartnerInput) {
    return this.partner.removeUserPartner(input.clientId);
  }

  updatePartnerToken(input?: HanetUpdatePartnerTokenInput) {
    return this.partner.updatePartnerToken(input ?? {});
  }

  listPlaces() {
    return this.partner.getPlaces();
  }

  getPlaceInfo(placeId: string) {
    return this.partner.getPlaceInfo(placeId);
  }

  async createPlace(body: HanetCreatePlaceInput) {
    const result = await this.partner.addPlace(body);
    if (result.placeId) {
      await this.applyPlacePartnerSync('add', result.placeId, body.placeName);
    }
    return result;
  }

  async updatePlace(body: HanetUpdatePlaceInput) {
    const result = await this.partner.updatePlace(body);
    await this.applyPlacePartnerSync('update', result.placeId, body.placeName);
    return result;
  }

  async removePlace(body: HanetRemovePlaceInput) {
    const result = await this.partner.removePlace(body);
    await this.applyPlacePartnerSync('delete', result.placeId);
    return result;
  }

  listDevices(placeId?: string) {
    return this.partner.getListDevices(placeId);
  }

  getProfile() {
    return this.partner.getProfile();
  }

  getDeviceConnectionStatus(deviceId: string) {
    return this.partner.getConnectionStatus(deviceId);
  }

  getDeviceInfo(deviceId: string) {
    return this.partner.getDeviceInfo(deviceId);
  }

  updateDevice(body: HanetUpdateDeviceInput) {
    return this.partner.updateDevice(body);
  }

  setDeviceMqtt(body: HanetSetDeviceMqttInput) {
    return this.partner.setDeviceMqtt(body);
  }

  registerPersonByUrl(body: HanetRegisterPersonByUrlInput) {
    return this.partner.registerPersonByUrl(body);
  }

  updatePersonFaceByUrl(body: HanetUpdateFaceUrlInput) {
    return this.partner.updatePersonFaceByUrl(body);
  }

  updatePersonFaceByUrlAlias(body: HanetUpdateFaceUrlInput) {
    return this.partner.updatePersonFaceByUrlAlias(body);
  }

  updatePersonFaceByUrlPersonId(body: HanetUpdateFaceUrlInput) {
    return this.partner.updatePersonFaceByUrlPersonId(body);
  }

  updatePersonFaceByImage(body: HanetUpdateFaceImageInput) {
    return this.partner.updatePersonFaceByImage(body);
  }

  updatePersonFaceByImageAlias(body: HanetUpdateFaceImageInput) {
    return this.partner.updatePersonFaceByImageAlias(body);
  }

  updatePersonFaceByImagePersonId(body: HanetUpdateFaceImageInput) {
    return this.partner.updatePersonFaceByImagePersonId(body);
  }

  takePersonFacePicture(body: HanetTakeFacePictureInput) {
    return this.partner.takePersonFacePicture(body);
  }

  registerPerson(body: HanetPersonHubInput) {
    return this.partner.registerPerson(body);
  }

  getListPersonByAliasAllPlace(aliasId: string) {
    return this.partner.getListPersonByAliasAllPlace(aliasId);
  }

  getListPersonByAlias(body: HanetPersonHubInput) {
    return this.partner.getListPersonByAlias(body);
  }

  getUserInfoByAlias(body: HanetPersonHubInput) {
    return this.partner.getUserInfoByAlias(body);
  }

  getUserInfoByPersonId(body: HanetPersonHubInput) {
    return this.partner.getUserInfoByPersonId(body);
  }

  updatePerson(body: HanetPersonHubInput) {
    return this.partner.updatePerson(body);
  }

  updatePersonInfo(body: HanetPersonHubInput) {
    return this.partner.updatePersonInfo(body);
  }

  updatePersonAliasId(body: HanetPersonHubInput) {
    return this.partner.updatePersonAliasId(body);
  }

  removePerson(body: HanetPersonHubInput) {
    return this.partner.removePerson(body);
  }

  removePersonByPlace(body: HanetPersonHubInput) {
    return this.partner.removePersonByPlace(body);
  }

  removePersonsByAliasIds(body: HanetPersonHubInput) {
    return this.partner.removePersonsByAliasIds(body);
  }

  removeAllPersonsInPlace(placeId?: string) {
    return this.partner.removeAllPersonsInPlace(placeId);
  }

  removePersonById(body: HanetPersonHubInput) {
    return this.partner.removePersonById(body);
  }

  getCheckinsByPlaceDay(placeId: string | undefined, date: string) {
    return this.partner.getCheckinByPlaceIdInDay({
      placeId: placeId ?? '',
      date,
    });
  }

  getCheckinsByPlaceTimestamp(
    placeId: string | undefined,

    from: string,

    to: string,
  ) {
    return this.partner.getCheckinByPlaceIdInTimestamp({
      placeId: placeId ?? '',

      from,

      to,
    });
  }

  listPersonsFromHanet(
    placeId: string | undefined,

    pageIndex?: number,

    pageSize?: number,
  ) {
    return this.avatarSync.listFromHanet(placeId, pageIndex, pageSize);
  }

  syncPersonAvatars(placeId?: string) {
    return this.avatarSync.syncFromPlace(placeId);
  }

  listStoredAvatars(params?: {
    page?: number;

    limit?: number;

    search?: string;
  }) {
    return this.avatarSync.listStored(params);
  }

  async ensureCamera(body: {
    deviceId: string;
    name?: string;
    placeId?: string;
    placeName?: string;
  }) {
    const deviceId = body.deviceId?.trim();

    if (!deviceId) {
      throw new BadRequestException('Thiếu deviceID');
    }

    const camera = await this.sync.ensureCameraFromDevice(
      deviceId,
      body.name?.trim(),
    );

    const placeId = body.placeId?.trim();
    if (placeId) {
      await this.applyDevicePartnerSync(
        'update',
        deviceId,
        body.name?.trim() || camera.name,
        placeId,
        body.placeName,
      );
    }

    return camera;
  }
}
