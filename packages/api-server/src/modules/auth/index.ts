export {
  BaseAuthService,
  BaseAuthAdminController,
  BasePublicAuthController,
  BaseAuthModule,
} from './auth.module';

export type { IAuthAdminControllerService } from './auth-admin.controller';
export type { IPublicAuthControllerService } from './public-auth.controller';

export type {
  AuthRolePayload,
  AuthLoginPayload,
  GoogleProfileDto,
  DevLoginOptionDto,
} from './auth.service';
