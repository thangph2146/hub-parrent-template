/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * Settings Module.
 *
 * Bám sát pattern của `apps/main/api/src/settings/settings.module.ts`.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePublicSettingsController } from './public-settings.controller';
import { BaseSettingsController } from './setting.controller';

@Module({})
export class BaseSettingsModule {
  /**
   * Configure module với metadata bổ sung.
   */
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseSettingsController,
        BasePublicSettingsController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseSettingsController } from './setting.controller';
export { BasePublicSettingsController } from './public-settings.controller';
export {
  BaseSettingsService,
  type PublicSiteBranding,
  type SettingsRowDto,
  type SettingsCreateData,
  type SettingsUpdateData,
} from './setting.service';
