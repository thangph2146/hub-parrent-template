import { Module, type ModuleMetadata } from '@nestjs/common';
import { BaseAuthAdminController } from './auth-admin.controller';
import { BasePublicAuthController } from './public-auth.controller';

@Module({})
export class BaseAuthModule {
  static forRoot(metadata: ModuleMetadata = {}): ModuleMetadata {
    return {
      imports: metadata.imports ?? [],
      controllers: [
        ...(metadata.controllers ?? []),
        BaseAuthAdminController,
        BasePublicAuthController,
      ],
      providers: metadata.providers ?? [],
      exports: metadata.exports ?? [],
    };
  }
}

export { BaseAuthAdminController } from './auth-admin.controller';
export { BasePublicAuthController } from './public-auth.controller';
export {
  BaseAuthService,
  type AuthRolePayload,
  type AuthLoginPayload,
  type GoogleProfileDto,
  type DevLoginOptionDto,
} from './auth.service';
