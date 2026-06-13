/**
 * Auth module — HTTP admin + service binding (@workspace/api-server).
 */
export {
  BaseAuthService,
  BaseAuthService as BaseAuthAdminService,
} from './auth.service';
export {
  BaseAuthController,
  BaseAuthController as BaseAuthAdminController,
} from './auth.controller';
export type { IAuthControllerService } from './auth.controller';
/** @deprecated Dùng `IAuthControllerService`. */
export type { IAuthControllerService as IAuthAdminControllerService } from './auth.controller';
export type {
  AuthRolePayload,
  AuthLoginPayload,
  GoogleProfileDto,
  DevLoginOptionDto,
} from './auth.service';
export {
  BaseAuthModule,
  BasePublicAuthController,
} from './auth.module';
export type { IPublicAuthControllerService } from './public-auth.controller';
