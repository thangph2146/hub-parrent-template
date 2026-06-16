import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getHanetConfig, isHanetConfigured } from './hanet.config';
import { HanetApiClient } from './hanet-api.client';
import {
  assertHanetPartnerOk,
  formatHanetCheckinDayDate,
  formatHanetCompactTimestamp,
  normalizeHanetPartnerList,
  normalizeHanetPartnerScalarCount,
} from './hanet-partner.response';
import { resolveHanetPublicImageUrl } from './hanet-face-image';
import { decodeHanetFaceImageBase64 } from './hanet-face-image-upload';
import { pickHanetString } from './hanet-payload';
import type {
  HanetCheckinByPlaceQuery,
  HanetCheckinByTimestampQuery,
  HanetCreatePlaceInput,
  HanetPersonListQuery,
  HanetRegisterPersonByUrlInput,
  HanetRemovePlaceInput,
  HanetSetDeviceMqttInput,
  HanetTakeFacePictureInput,
  HanetUpdateDeviceInput,
  HanetUpdateFaceImageInput,
  HanetUpdateFaceUrlInput,
  HanetUpdatePlaceInput,
} from './hanet-partner.types';
import { resolveHanetPlaceId } from './hanet-place-resolve';
import {
  buildHanetPersonParams,
  type HanetPersonHubInput,
} from './hanet-partner-params';

@Injectable()
export class HanetPartnerService {
  private readonly logger = new Logger(HanetPartnerService.name);

  constructor(private readonly client: HanetApiClient) {}

  private assertReady(): void {
    if (!isHanetConfigured(getHanetConfig())) {
      throw new BadRequestException(
        'Chưa cấu hình HANET — đặt HANET_CLIENT_ID và HANET_CLIENT_SECRET trong .env API',
      );
    }
  }

  private async resolvePlaceId(placeId?: string): Promise<string> {
    return resolveHanetPlaceId(this, placeId);
  }

  async getProfile() {
    this.assertReady();
    return this.client.postPartner('/profile/getProfile', {});
  }

  async getPlaces() {
    this.assertReady();
    return this.client.postPartner('/place/getPlaces', {});
  }

  private extractPlaceIdFromPartnerData(data: unknown): string {
    if (data == null) return '';
    if (typeof data === 'number' && Number.isFinite(data)) {
      return String(data);
    }
    if (typeof data !== 'object' || Array.isArray(data)) return '';

    const record = data as Record<string, unknown>;
    const direct = pickHanetString(record, [
      'placeID',
      'placeId',
      'place_id',
      'id',
    ]);
    if (direct) return direct;

    for (const key of ['data', 'place', 'result', 'info']) {
      const nested = this.extractPlaceIdFromPartnerData(record[key]);
      if (nested) return nested;
    }

    return '';
  }

  async getPlaceInfo(placeId: string) {
    this.assertReady();
    const resolved = placeId?.trim();
    if (!resolved) {
      throw new BadRequestException('Thiếu placeID');
    }
    return this.client.postPartner('/place/getPlaceInfo', {
      placeID: resolved,
    });
  }

  async addPlace(input: HanetCreatePlaceInput) {
    this.assertReady();
    const placeName = input.placeName?.trim();
    if (!placeName) {
      throw new BadRequestException('Thiếu tên địa điểm (placeName)');
    }

    // Partner API dùng `name`, không phải `placeName` (placeName bị bỏ qua).
    const params: Record<string, string | number> = { name: placeName };
    const address = input.address?.trim();
    if (address) params.address = address;
    if (input.type != null && Number.isFinite(input.type)) {
      params.type = input.type;
    }

    const created = await this.client.postPartner<unknown>(
      '/place/addPlace',
      params,
    );
    const placeId = this.extractPlaceIdFromPartnerData(created);
    if (!placeId) {
      throw new BadRequestException(
        'HANET addPlace không trả placeID — kiểm tra quyền tài khoản partner',
      );
    }

    await this.linkPlacePartnerBestEffort(placeId);
    await this.assertPlaceCreated(placeId, placeName, address);

    return { placeId, data: created };
  }

  async updatePlace(input: HanetUpdatePlaceInput) {
    this.assertReady();
    const placeId = input.placeId?.trim();
    const placeName = input.placeName?.trim();
    if (!placeId) {
      throw new BadRequestException('Thiếu placeID');
    }
    if (!placeName) {
      throw new BadRequestException('Thiếu tên địa điểm (placeName)');
    }

    // Partner API dùng `name`, không phải `placeName` (placeName trả success nhưng không đổi tên).
    const params: Record<string, string> = {
      placeID: placeId,
      name: placeName,
    };
    const address = input.address?.trim();
    if (address) params.address = address;

    const data = await this.client.postPartner('/place/updatePlace', params);
    await this.assertPlaceFields(placeId, {
      name: placeName,
      address,
    });
    return { placeId, data };
  }

  private placesListContains(places: unknown, placeId: string): boolean {
    if (!Array.isArray(places)) return false;
    const normalized = placeId.trim();
    return places.some((row) => {
      if (!row || typeof row !== 'object') return false;
      const id = pickHanetString(row as Record<string, unknown>, [
        'placeID',
        'placeId',
        'place_id',
        'id',
      ]);
      return id === normalized;
    });
  }

  /** addPlacePartner thường trả Invalid input param — place vẫn hiện trong getPlaces (linked=false). */
  private async linkPlacePartnerBestEffort(placeId: string): Promise<void> {
    try {
      await this.client.postPartner('/partner/addPlacePartner', {
        placeID: placeId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `HANET addPlacePartner thất bại placeID=${placeId} (${message}) — bỏ qua, place vẫn dùng được.`,
      );
    }
  }

  private async assertPlaceCreated(
    placeId: string,
    expectedName: string,
    expectedAddress?: string,
  ): Promise<void> {
    const places = await this.getPlaces();
    if (!this.placesListContains(places, placeId)) {
      throw new BadRequestException(
        'HANET addPlace báo thành công nhưng place không có trong getPlaces.',
      );
    }
    await this.assertPlaceFields(placeId, {
      name: expectedName,
      address: expectedAddress,
    });
  }

  /** HANET có thể trả returnCode=1 dù bỏ qua field sai — đọc lại getPlaceInfo để chắc chắn. */
  private async assertPlaceFields(
    placeId: string,
    expected: { name?: string; address?: string },
  ): Promise<void> {
    const info = await this.getPlaceInfo(placeId);
    const record =
      info && typeof info === 'object' && !Array.isArray(info)
        ? (info as Record<string, unknown>)
        : {};

    if (expected.name) {
      const appliedName = pickHanetString(record, [
        'name',
        'placeName',
        'place_name',
      ]);
      if (appliedName.trim() !== expected.name.trim()) {
        throw new BadRequestException(
          appliedName
            ? `HANET không áp dụng tên mới (hiện tại: "${appliedName}"). Kiểm tra quyền OWNER trên place.`
            : 'HANET báo thành công nhưng không đọc được tên place.',
        );
      }
    }

    if (!expected.address) return;

    const appliedAddress = pickHanetString(record, [
      'address',
      'placeAddress',
      'place_address',
    ]);
    if (appliedAddress.trim() !== expected.address.trim()) {
      throw new BadRequestException(
        appliedAddress
          ? `HANET không áp dụng địa chỉ mới (hiện tại: "${appliedAddress}").`
          : 'HANET báo thành công nhưng không đọc được địa chỉ sau cập nhật.',
      );
    }
  }

  private async assertPlaceRemoved(placeId: string): Promise<void> {
    try {
      await this.getPlaceInfo(placeId);
      throw new BadRequestException(
        'HANET báo xóa thành công nhưng place vẫn còn — có thể còn thiết bị/người (PLACE_NOT_EMPTY).',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        const msg = error.message.toLowerCase();
        if (msg.includes('vẫn còn')) throw error;
        if (msg.includes('place not found') || msg.includes('not found')) {
          return;
        }
        throw error;
      }
      throw error;
    }
  }

  async removePlace(input: HanetRemovePlaceInput) {
    this.assertReady();
    const placeId = input.placeId?.trim();
    if (!placeId) {
      throw new BadRequestException('Thiếu placeID');
    }

    try {
      await this.client.postPartner('/partner/removePlacePartner', {
        placeID: placeId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `HANET removePlacePartner thất bại placeID=${placeId} (${message}) — vẫn thử removePlace.`,
      );
    }

    const data = await this.client.postPartner('/place/removePlace', {
      placeID: placeId,
    });
    await this.assertPlaceRemoved(placeId);
    return { placeId, data };
  }

  async getListDevices(placeId?: string) {
    this.assertReady();
    const resolved = await this.resolvePlaceId(placeId);
    return this.client.postPartner('/device/getListDeviceByPlace', {
      placeID: resolved,
    });
  }

  async getConnectionStatus(deviceId: string) {
    this.assertReady();
    const normalized = deviceId.trim();
    if (!normalized) {
      throw new BadRequestException('Thiếu deviceID');
    }
    return this.client.postPartner('/device/getConnectionStatus', {
      deviceIDs: normalized,
    });
  }

  async getDeviceInfo(deviceId: string) {
    this.assertReady();
    const normalized = deviceId.trim();
    if (!normalized) {
      throw new BadRequestException('Thiếu deviceID');
    }
    return this.client.postPartner('/device/getDeviceInfo', {
      deviceID: normalized,
    });
  }

  async updateDevice(input: HanetUpdateDeviceInput) {
    this.assertReady();
    const deviceID = input.deviceId.trim();
    if (!deviceID) {
      throw new BadRequestException('Thiếu deviceID');
    }
    const deviceName = input.deviceName?.trim();
    if (!deviceName) {
      throw new BadRequestException('Thiếu deviceName');
    }
    return this.client.postPartner('/device/updateDevice', {
      deviceID,
      deviceName,
    });
  }

  async setDeviceMqtt(input: HanetSetDeviceMqttInput) {
    this.assertReady();
    const deviceID = input.deviceId.trim();
    if (!deviceID) {
      throw new BadRequestException('Thiếu deviceID');
    }
    const params: Record<string, string> = { deviceID };
    for (const [key, value] of Object.entries(input)) {
      if (key === 'deviceId' || value == null) continue;
      const text = String(value).trim();
      if (text) params[key] = text;
    }
    return this.client.postPartner('/device/setDeviceMQTT', params);
  }

  async registerPersonByUrl(input: HanetRegisterPersonByUrlInput) {
    this.assertReady();
    const placeId = await this.resolvePlaceId(input.placeId);
    if (!input.name.trim()) {
      throw new BadRequestException('Thiếu tên người (name)');
    }
    if (!input.aliasId.trim()) {
      throw new BadRequestException('Thiếu aliasID (email hoặc mã nội bộ)');
    }
    if (!input.url.trim()) {
      throw new BadRequestException('Thiếu url ảnh khuôn mặt');
    }

    const faceUrl = resolveHanetPublicImageUrl(input.url);

    const data = await this.client.postPartner<Record<string, unknown>>(
      '/person/registerByUrl',
      {
        placeID: placeId,
        name: input.name.trim(),
        aliasID: input.aliasId.trim(),
        url: faceUrl,
        personType: input.personType ?? 1,
      },
    );

    return { placeId, faceUrl, ...data };
  }

  private async resolveFaceUrlFields(input: HanetUpdateFaceUrlInput) {
    const placeId = await this.resolvePlaceId(input.placeId);
    const faceUrl = resolveHanetPublicImageUrl(input.url);
    return { placeId, faceUrl };
  }

  async updatePersonFaceByUrl(input: HanetUpdateFaceUrlInput) {
    this.assertReady();
    const { placeId, faceUrl } = await this.resolveFaceUrlFields(input);
    const personID = input.personId?.trim();
    if (!personID) {
      throw new BadRequestException('Thiếu personID');
    }
    return this.client.postPartner('/person/updateByFaceUrl', {
      placeID: placeId,
      personID,
      url: faceUrl,
    });
  }

  async updatePersonFaceByUrlAlias(input: HanetUpdateFaceUrlInput) {
    this.assertReady();
    const { placeId, faceUrl } = await this.resolveFaceUrlFields(input);
    const aliasID = input.aliasId?.trim();
    if (!aliasID) {
      throw new BadRequestException('Thiếu aliasID');
    }
    return this.client.postPartner('/person/updateByFaceUrlByAliasID', {
      placeID: placeId,
      aliasID,
      url: faceUrl,
    });
  }

  async updatePersonFaceByUrlPersonId(input: HanetUpdateFaceUrlInput) {
    this.assertReady();
    const { placeId, faceUrl } = await this.resolveFaceUrlFields(input);
    const personID = input.personId?.trim();
    if (!personID) {
      throw new BadRequestException('Thiếu personID');
    }
    return this.client.postPartner('/person/updateByFaceUrlByPersonID', {
      placeID: placeId,
      personID,
      url: faceUrl,
    });
  }

  private async postPersonFaceImage(
    partnerPath: string,
    input: HanetUpdateFaceImageInput,
    idField: 'personID' | 'aliasID',
  ) {
    this.assertReady();
    const placeId = await this.resolvePlaceId(input.placeId);
    const idValue =
      idField === 'personID' ? input.personId?.trim() : input.aliasId?.trim();
    if (!idValue) {
      throw new BadRequestException(
        idField === 'personID' ? 'Thiếu personID' : 'Thiếu aliasID',
      );
    }
    const image = decodeHanetFaceImageBase64(input.fileBase64);
    return this.client.postPartnerMultipart(
      partnerPath,
      {
        placeID: placeId,
        [idField]: idValue,
      },
      {
        buffer: image.buffer,
        filename: image.filename,
        mimeType: image.mimeType,
      },
    );
  }

  async updatePersonFaceByImage(input: HanetUpdateFaceImageInput) {
    return this.postPersonFaceImage(
      '/person/updateByFaceImage',
      input,
      'personID',
    );
  }

  async updatePersonFaceByImageAlias(input: HanetUpdateFaceImageInput) {
    return this.postPersonFaceImage(
      '/person/updateByFaceImageByAliasID',
      input,
      'aliasID',
    );
  }

  async updatePersonFaceByImagePersonId(input: HanetUpdateFaceImageInput) {
    return this.postPersonFaceImage(
      '/person/updateByFaceImageByPersonID',
      input,
      'personID',
    );
  }

  async takePersonFacePicture(input: HanetTakeFacePictureInput) {
    this.assertReady();
    const placeId = await this.resolvePlaceId(input.placeId);
    const deviceID = input.deviceId?.trim();
    if (!deviceID) {
      throw new BadRequestException('Thiếu deviceID');
    }
    const personID = input.personId?.trim();
    const aliasID = input.aliasId?.trim();
    if (!personID && !aliasID) {
      throw new BadRequestException('Thiếu personID hoặc aliasID');
    }
    return this.client.postPartner('/person/takeFacePicture', {
      placeID: placeId,
      deviceID,
      ...(personID ? { personID } : {}),
      ...(aliasID ? { aliasID } : {}),
    });
  }

  private assertPersonParams(
    params: Record<string, string | number>,
    keys: string[],
    label: string,
  ): void {
    for (const key of keys) {
      const value = params[key];
      if (value == null || String(value).trim() === '') {
        throw new BadRequestException(`Thiếu ${key} (${label})`);
      }
    }
  }

  private async buildPersonPartnerParams(
    input: HanetPersonHubInput,
    options?: { requirePlace?: boolean },
  ): Promise<Record<string, string | number>> {
    const hasPlace =
      input.placeId != null && String(input.placeId).trim().length > 0;
    const resolvedPlace = hasPlace
      ? await this.resolvePlaceId(String(input.placeId))
      : undefined;
    const params = buildHanetPersonParams(input, resolvedPlace);
    if (options?.requirePlace && !params.placeID) {
      throw new BadRequestException('Thiếu placeID');
    }
    return params;
  }

  private postPerson(path: string, params: Record<string, string | number>) {
    return this.client.postPartner(path, params);
  }

  async registerPerson(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['name', 'aliasID'], 'person/register');
    return this.postPerson('/person/register', params);
  }

  async getListPersonByAliasAllPlace(aliasId: string) {
    this.assertReady();
    const params = buildHanetPersonParams({ aliasId });
    this.assertPersonParams(params, ['aliasID'], 'getListByAliasIDAllPlace');
    return this.postPerson('/person/getListByAliasIDAllPlace', params);
  }

  async getListPersonByAlias(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['aliasID'], 'getListByAliasID');
    return this.postPerson('/person/getListByAliasID', params);
  }

  async getUserInfoByAlias(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['aliasID'], 'getUserInfoByAliasID');
    return this.postPerson('/person/getUserInfoByAliasID', params);
  }

  async getUserInfoByPersonId(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['personID'], 'getUserInfoByPersonID');
    return this.postPerson('/person/getUserInfoByPersonID', params);
  }

  async updatePerson(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['personID'], 'person/update');
    return this.postPerson('/person/update', params);
  }

  async updatePersonInfo(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['personID'], 'person/updateInfo');
    return this.postPerson('/person/updateInfo', params);
  }

  async updatePersonAliasId(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(
      params,
      ['personID', 'aliasID'],
      'person/updateAliasID',
    );
    return this.postPerson('/person/updateAliasID', params);
  }

  async removePerson(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['personID'], 'person/remove');
    return this.postPerson('/person/remove', params);
  }

  async removePersonByPlace(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['aliasID'], 'person/removeByPlace');
    return this.postPerson('/person/removeByPlace', params);
  }

  async removePersonsByAliasIds(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(
      params,
      ['listAliasID'],
      'person/removePersonByListAliasID',
    );
    return this.postPerson('/person/removePersonByListAliasID', params);
  }

  async removeAllPersonsInPlace(placeId?: string) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(
      { placeId: placeId ?? '' },
      { requirePlace: true },
    );
    return this.postPerson('/person/removeAllPersonInPlace', params);
  }

  async removePersonById(input: HanetPersonHubInput) {
    this.assertReady();
    const params = await this.buildPersonPartnerParams(input, {
      requirePlace: true,
    });
    this.assertPersonParams(params, ['personID'], 'person/removePersonByID');
    return this.postPerson('/person/removePersonByID', params);
  }

  async getListPersonByPlace(query: HanetPersonListQuery = {}) {
    this.assertReady();
    const placeId = await this.resolvePlaceId(query.placeId);
    const hubPageIndex = Math.max(0, query.pageIndex ?? 0);
    const pageSize = query.pageSize ?? 50;
    const hanetPage = hubPageIndex + 1;

    const data = await this.client.postPartner<unknown>(
      '/person/getListByPlace',
      {
        placeID: placeId,
        pageIndex: hanetPage,
        pageSize,
        ...(query.personType != null ? { personType: query.personType } : {}),
      },
    );

    return { placeId, pageIndex: hubPageIndex, pageSize, data };
  }

  async getTotalPersonByPlace(placeId?: string): Promise<number> {
    this.assertReady();
    const resolvedPlaceId = await this.resolvePlaceId(placeId);
    const totalRaw = await this.client.postPartner<unknown>(
      '/person/getTotalPersonByPlaceID',
      { placeID: resolvedPlaceId },
    );
    return normalizeHanetPartnerScalarCount(totalRaw);
  }

  async getCheckinByPlaceIdInDay(query: HanetCheckinByPlaceQuery) {
    this.assertReady();
    const placeId = await this.resolvePlaceId(query.placeId);
    const date = formatHanetCheckinDayDate(query.date);

    const rowsRaw = await this.client.postPartner<unknown>(
      '/person/getCheckinByPlaceIdInDay',
      {
        placeID: placeId,
        date,
      },
    );

    const totalRaw = await this.client.postPartner<unknown>(
      '/person/getTotalCheckinByPlaceIdInDay',
      {
        placeID: placeId,
        date,
      },
    );

    const rows = normalizeHanetPartnerList(rowsRaw);
    const total = normalizeHanetPartnerScalarCount(totalRaw);

    return { placeId, date, rows, total };
  }

  async getCheckinByPlaceIdInTimestamp(query: HanetCheckinByTimestampQuery) {
    this.assertReady();
    const placeId = await this.resolvePlaceId(query.placeId);
    const from = formatHanetCompactTimestamp(query.from);
    const to = formatHanetCompactTimestamp(query.to);

    const rowsRaw = await this.client.postPartner<unknown>(
      '/person/getCheckinByPlaceIdInTimestamp',
      {
        placeID: placeId,
        from,
        to,
      },
    );

    const totalRaw = await this.client.postPartner<unknown>(
      '/person/getTotalCheckinByPlaceIdInTimestamp',
      {
        placeID: placeId,
        from,
        to,
      },
    );

    const rows = normalizeHanetPartnerList(rowsRaw);
    const total = normalizeHanetPartnerScalarCount(totalRaw);

    return { placeId, from, to, rows, total };
  }

  async getListUserPartner() {
    this.assertReady();
    return this.client.postPartner<unknown>('/partner/getListUserPartner', {});
  }

  async removeUserPartner(clientId: string) {
    this.assertReady();
    const resolved = clientId?.trim();
    if (!resolved) {
      throw new BadRequestException('Thiếu clientID');
    }
    return this.client.postPartner('/partner/removeUserPartner', {
      clientID: resolved,
    });
  }

  async updatePartnerToken(
    params: Record<string, string | number | undefined> = {},
  ) {
    this.assertReady();
    return this.client.postPartner('/partner/updateToken', params);
  }

  /** Gọi thử partner API — dùng getProfile + returnCode. */
  async probePartnerApi() {
    this.assertReady();
    const envelope = await this.client.postPartnerRaw(
      '/profile/getProfile',
      {},
    );
    assertHanetPartnerOk(envelope, '/profile/getProfile');
    return {
      ok: true,
      message: 'Partner API HANET phản hồi returnCode=1',
      profile: envelope.data,
    };
  }
}
