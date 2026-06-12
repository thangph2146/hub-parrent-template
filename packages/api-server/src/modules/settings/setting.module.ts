/**
 * Settings Module.
 */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BasePublicSettingsController } from './public-settings.controller';
import { BaseSettingsController } from './setting.controller';

@Module({})
export class BaseSettingsModule {
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
