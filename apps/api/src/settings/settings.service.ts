import { Injectable } from '@nestjs/common';
import { toEntityId, toEntityIdList } from '../common/entity-id';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import { parseSettingValue } from '../common/parse-setting-value';
import { Setting } from '../entities/setting.entity';

export type PublicSiteBranding = {
  siteName: string;
  siteDescription: string;
};

const PUBLIC_BRANDING_DEFAULTS: PublicSiteBranding = {
  siteName: 'HUB',
  siteDescription: 'Quản trị hệ thống',
};

@Injectable()
export class SettingsService {
  constructor(private readonly em: EntityManager) {}

  async list(params: { group?: string; search?: string } = {}) {
    const { group, search } = params;
    const where: Record<string, unknown> = {};
    if (group) where.group = group;
    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      where.$or = [{ key: { $like: q } }, { group: { $like: q } }];
    }
    const data = await this.em.find(Setting, where as FilterQuery<Setting>, {
      orderBy: { key: 'ASC' },
    });

    return { data };
  }

  async getByKey(key: string) {
    return this.em.findOne(Setting, { key });
  }

  async update(key: string, value: any) {
    const existing = await this.em.findOne(Setting, { key });
    if (existing) {
      existing.value = value;
      await this.em.persistAndFlush(existing);
      return existing;
    } else {
      const created = new Setting();
      created.key = key;
      created.value = value;
      created.group = 'general';
      await this.em.persistAndFlush(created);
      return created;
    }
  }

  async bulkUpdate(settings: Record<string, any>) {
    const results: Setting[] = [];
    for (const [key, value] of Object.entries(settings)) {
      const existing = await this.em.findOne(Setting, { key });
      if (existing) {
        existing.value = value;
        results.push(existing);
      } else {
        const created = new Setting();
        created.key = key;
        created.value = value;
        created.group = 'general';
        results.push(created);
        this.em.persist(created);
      }
    }
    await this.em.flush();
    return results;
  }

  async delete(id: string) {
    const existing = await this.em.findOne(Setting, { id: toEntityId(id) });
    if (!existing) return null;
    await this.em.removeAndFlush(existing);
    return existing;
  }

  /** Branding hiển thị công khai — không cần đăng nhập admin. */
  async getPublicBranding(): Promise<PublicSiteBranding> {
    const [nameRow, descRow] = await Promise.all([
      this.getByKey('site_name'),
      this.getByKey('site_description'),
    ]);

    return {
      siteName: parseSettingValue(
        nameRow?.value,
        PUBLIC_BRANDING_DEFAULTS.siteName,
      ),
      siteDescription: parseSettingValue(
        descRow?.value,
        PUBLIC_BRANDING_DEFAULTS.siteDescription,
      ),
    };
  }
}
