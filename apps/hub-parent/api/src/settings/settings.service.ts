/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Setting } from '../entities/setting.entity';
import { parseSettingValue } from '../common/app/parse-setting-value';
import {
  BaseSettingsService,
  type PublicSiteBranding,
} from '../common/module-bases/settings/setting.service';

export type { PublicSiteBranding } from '../common/module-bases/settings/setting.service';

const PUBLIC_BRANDING_DEFAULTS: PublicSiteBranding = {
  siteName: 'HUB',
  siteDescription: 'Quản trị hệ thống',
};

@Injectable()
export class SettingsService extends BaseSettingsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity() {
    return Setting as unknown as new () => Record<string, unknown>;
  }

  async getPublicBranding(): Promise<PublicSiteBranding> {
    const [nameRow, descRow, heroRow] = await Promise.all([
      this.getByKey('site_name'),
      this.getByKey('site_description'),
      this.getByKey('admin_login_hero_image'),
    ]);

    const heroValue = heroRow?.value
      ? parseSettingValue(heroRow.value, '')
      : '';

    return {
      siteName: parseSettingValue(
        nameRow?.value,
        PUBLIC_BRANDING_DEFAULTS.siteName,
      ),
      siteDescription: parseSettingValue(
        descRow?.value,
        PUBLIC_BRANDING_DEFAULTS.siteDescription,
      ),
      authHeroImage: heroValue.trim() || null,
    };
  }
}
