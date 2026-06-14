/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAuthController } from './auth.controller';
import { BasePublicAuthController } from './public-auth.controller';

@Module({})
export class BaseAuthModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseAuthController,
        BasePublicAuthController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseAuthController } from './auth.controller';
export { BasePublicAuthController } from './public-auth.controller';
export {
  BaseAuthService,
  type AuthRolePayload,
  type AuthLoginPayload,
  type GoogleProfileDto,
  type DevLoginOptionDto,
} from './auth.service';
