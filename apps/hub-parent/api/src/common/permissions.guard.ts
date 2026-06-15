/**
 * Permissions Guard.
 *
 * Bám sát pattern `apps/main/api/src/common/permissions.guard.ts`.
 *
 * Generic NestJS `CanActivate` guard that:
 *   1. Bypasses khi handler có `@Public()` (IS_PUBLIC_KEY).
 *   2. Đọc user id từ header `APP_HEADERS.USER_ID`.
 *   3. Lấy required permissions từ `@Permissions(...)` decorator metadata.
 *   4. Gọi `authService.tryAuthPayloadByUserId(userId)` để resolve payload.
 *   5. Nếu payload.roles có role SUPER_ADMIN → bypass.
 *   6. Ngược lại: throw 403 nếu user không có ít nhất 1 quyền yêu cầu.
 *
 * Apps that import `@workspace/api-server` chỉ cần:
 *   - Cung cấp `AuthService` implement `AuthPayloadResolver`.
 *   - Gọi `app.useGlobalGuards(new PermissionsGuard(reflector, authService))`.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { APP_HEADERS, AUTH_ROLE_NAMES } from '../config/constants';

export const IS_PUBLIC_KEY = 'isPublic';

/** Auth payload tối thiểu mà guard cần để check quyền. */
export interface AuthPayload {
  roles: Array<{ name: string }>;
  permissions: string[];
}

/** Reason khi resolve payload thất bại. */
export type AuthFailureReason =
  | 'not_found'
  | 'inactive'
  | 'no_roles'
  | 'unknown';

/**
 * Interface mà app-specific AuthService phải implement để dùng guard.
 */
export interface AuthPayloadResolver {
  tryAuthPayloadByUserId(
    userId: string,
  ): Promise<{ payload: AuthPayload | null; reason?: AuthFailureReason }>;
}

const FAILURE_MESSAGES: Record<AuthFailureReason, string> = {
  not_found:
    'Không tìm thấy tài khoản (sai id hoặc đã xóa). Vui lòng đăng nhập lại.',
  inactive: 'Tài khoản đã bị vô hiệu hóa hoặc xóa mềm. Liên hệ quản trị viên.',
  no_roles:
    'Tài khoản chưa được gán vai trò (user_roles). Liên hệ quản trị viên.',
  unknown: 'Người dùng không tồn tại hoặc không có quyền truy cập',
};

/**
 * Mark route as public (bypass auth/permission check).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    /** App binding: AuthService — wire qua AppModule APP_GUARD useFactory (sync patch). */
    private readonly authService: AuthPayloadResolver,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const userId: string | undefined =
      request.headers[APP_HEADERS.USER_ID]?.trim();
    if (!userId) {
      throw new UnauthorizedException(`Thiếu header ${APP_HEADERS.USER_ID}`);
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions?.length) return true;

    const { payload, reason } =
      await this.authService.tryAuthPayloadByUserId(userId);
    if (!payload) {
      throw new UnauthorizedException(
        reason ? FAILURE_MESSAGES[reason] : FAILURE_MESSAGES.unknown,
      );
    }

    if (payload.roles.some((r) => r.name === AUTH_ROLE_NAMES.SUPER_ADMIN)) {
      return true;
    }

    const hasPermission = requiredPermissions.some((p) =>
      payload.permissions.includes(p),
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    return true;
  }
}
