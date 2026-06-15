import {

  BadRequestException,

  Injectable,

} from '@nestjs/common';

import { HanetApiClient } from './hanet-api.client';

import { getHanetConfig, isHanetConfigured } from './hanet.config';

import { HanetPartnerService } from './hanet-partner.service';
import { HanetPersonAvatarSyncService } from './hanet-person-avatar-sync.service';

import type { HanetRegisterPersonByUrlInput } from './hanet-partner.types';

import { getHanetWebhookUrls } from './hanet-webhook-urls';



@Injectable()

export class HanetAdminService {

  constructor(

    private readonly hanetApi: HanetApiClient,

    private readonly partner: HanetPartnerService,

    private readonly avatarSync: HanetPersonAvatarSyncService,

  ) {}



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

        err instanceof Error ? err.message : 'Không kết nối được HANET OAuth/API';

      throw new BadRequestException(message);

    }

  }



  testPartnerApi() {

    return this.partner.probePartnerApi();

  }



  listPlaces() {

    return this.partner.getPlaces();

  }



  listDevices(placeId?: string) {

    return this.partner.getListDevices(placeId);

  }



  registerPersonByUrl(body: HanetRegisterPersonByUrlInput) {

    return this.partner.registerPersonByUrl(body);

  }



  getCheckinsByPlaceDay(placeId: string | undefined, date: string) {

    return this.partner.getCheckinByPlaceIdInDay({ placeId: placeId ?? '', date });

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

}


