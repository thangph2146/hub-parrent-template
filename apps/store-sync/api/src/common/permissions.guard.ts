import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth/auth.service';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import { APP_HEADERS, AUTH_ROLE_NAMES } from '../config/constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
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
      const byReason: Record<NonNullable<typeof reason>, string> = {
        not_found:
          'Không tìm thấy tài khoản (sai id hoặc đã xóa). Vui lòng đăng nhập lại.',
        inactive:
          'Tài khoản đã bị vô hiệu hóa hoặc xóa mềm. Liên hệ quản trị viên.',
        no_roles:
          'Tài khoản chưa được gán vai trò (user_roles). Liên hệ quản trị viên.',
      };
      throw new UnauthorizedException(
        reason
          ? byReason[reason]
          : 'Người dùng không tồn tại hoặc không có quyền truy cập',
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
