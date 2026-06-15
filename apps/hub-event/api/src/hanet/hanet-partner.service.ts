/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { BadRequestException, Injectable } from '@nestjs/common';
import { getHanetConfig, isHanetConfigured } from './hanet.config';
import { HanetApiClient } from './hanet-api.client';
import {
  assertHanetPartnerOk,
  formatHanetPartnerDayDate,
} from './hanet-partner.response';
import { resolveHanetPublicImageUrl } from './hanet-face-image';
import type {
  HanetCheckinByPlaceQuery,
  HanetPersonListQuery,
  HanetRegisterPersonByUrlInput,
} from './hanet-partner.types';

@Injectable()
export class HanetPartnerService {
  constructor(private readonly client: HanetApiClient) {}

  private assertReady(): void {
    if (!isHanetConfigured(getHanetConfig())) {
      throw new BadRequestException(
        'Chưa cấu hình HANET — đặt HANET_CLIENT_ID và HANET_CLIENT_SECRET trong .env API',
      );
    }
  }

  private resolvePlaceId(placeId?: string): string {
    const resolved =
      placeId?.trim() || getHanetConfig().defaultPlaceId || '';
    if (!resolved) {
      throw new BadRequestException(
        'Thiếu placeID — truyền query/body placeId hoặc đặt HANET_DEFAULT_PLACE_ID trong .env',
      );
    }
    return resolved;
  }

  async getProfile() {
    this.assertReady();
    return this.client.postPartner('/profile/getProfile', {});
  }

  async getPlaces() {
    this.assertReady();
    return this.client.postPartner('/place/getPlaces', {});
  }

  async getListDevices(placeId?: string) {
    this.assertReady();
    const resolved = this.resolvePlaceId(placeId);
    return this.client.postPartner('/device/getListDeviceByPlace', {
      placeID: resolved,
    });
  }

  async getConnectionStatus(deviceId: string) {
    this.assertReady();
    if (!deviceId.trim()) {
      throw new BadRequestException('Thiếu deviceID');
    }
    return this.client.postPartner('/device/getConnectionStatus', {
      deviceID: deviceId.trim(),
    });
  }

  async registerPersonByUrl(input: HanetRegisterPersonByUrlInput) {
    this.assertReady();
    const placeId = this.resolvePlaceId(input.placeId);
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

  async getListPersonByPlace(query: HanetPersonListQuery = {}) {
    this.assertReady();
    const placeId = this.resolvePlaceId(query.placeId);
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 50;

    const data = await this.client.postPartner<unknown>(
      '/person/getListPersonByPlace',
      {
        placeID: placeId,
        pageIndex,
        pageSize,
      },
    );

    return { placeId, pageIndex, pageSize, data };
  }

  async getCheckinByPlaceIdInDay(query: HanetCheckinByPlaceQuery) {
    this.assertReady();
    const placeId = this.resolvePlaceId(query.placeId);
    const date = formatHanetPartnerDayDate(query.date);

    const rows = await this.client.postPartner<unknown>(
      '/person/getCheckinByPlaceIdInDay',
      {
        placeID: placeId,
        date,
      },
    );

    const total = await this.client.postPartner<unknown>(
      '/person/getTotalCheckinByPlaceIdInDay',
      {
        placeID: placeId,
        date,
      },
    );

    return { placeId, date, rows, total };
  }

  /** Gọi thử partner API — dùng getProfile + returnCode. */
  async probePartnerApi() {
    this.assertReady();
    const envelope = await this.client.postPartnerRaw('/profile/getProfile', {});
    assertHanetPartnerOk(envelope, '/profile/getProfile');
    return {
      ok: true,
      message: 'Partner API HANET phản hồi returnCode=1',
      profile: envelope.data,
    };
  }
}
