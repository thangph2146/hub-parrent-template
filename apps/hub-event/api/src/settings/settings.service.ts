/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BaseSettingsService } from '@workspace/api-server/modules/settings';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class SettingsService extends BaseSettingsService {
  constructor(private readonly em: EntityManager) {
    super();
  }

  protected getEm(): EntityManager {
    return this.em;
  }

  protected getEntity(): new () => Record<string, unknown> {
    return Setting as unknown as new () => Record<string, unknown>;
  }
}
