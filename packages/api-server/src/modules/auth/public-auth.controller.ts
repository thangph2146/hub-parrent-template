import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public, createErrorResponse, createSuccessResponse } from '../../common';
import { PUBLIC_ROUTES } from '../../config';
import { AUTH_ROLE_NAMES } from '../../config';
import type { AuthLoginPayload, BaseAuthService, GoogleProfileDto } from './auth.service';

export interface IPublicAuthControllerService
  extends Pick<
    BaseAuthService,
    | 'listDevelopmentLoginOptions'
    | 'register'
    | 'login'
    | 'loginAsDevelopmentUser'
    | 'verifyGoogleToken'
    | 'loginWithGoogleAsStudent'
  > {}

const EVENT_STUDENT_EMAIL_SUFFIX = '@st.buh.edu.vn';
const EVENT_STUDENT_EMAIL_ERROR =
  'Vui lòng đăng nhập bằng email sinh viên @st.buh.edu.vn.';

function isEventStudentSchoolEmail(email: string | null | undefined): boolean {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!normalized) return false;
  return normalized.endsWith(EVENT_STUDENT_EMAIL_SUFFIX);
}

function hasRole(payload: AuthLoginPayload, roleName: string): boolean {
  return Boolean(payload.roles?.some((role) => role.name === roleName));
}

function isStudentPayload(payload: AuthLoginPayload): boolean {
  return hasRole(payload, AUTH_ROLE_NAMES.STUDENT);
}

function isEventGuestPayload(payload: AuthLoginPayload): boolean {
  return hasRole(payload, AUTH_ROLE_NAMES.PARENT) || hasRole(payload, AUTH_ROLE_NAMES.USER);
}

@Public()
@Controller(PUBLIC_ROUTES.BASE)
export class BasePublicAuthController {
  constructor(private readonly service: IPublicAuthControllerService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      fullName?: string;
      email?: string;
      password?: string;
      phone?: string;
      address?: string;
    },
    @Res() res: Response,
  ): Promise<Response> {
    const fullName = body?.fullName?.trim();
    const email = body?.email?.trim();
    const password = body?.password?.trim();
    if (!fullName || !email || !password) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Vui long dien day du ho ten, email va mat khau.',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    try {
      const payload = await this.service.register({
        fullName,
        email,
        password,
        phone: body?.phone,
        address: body?.address,
      });
      const { statusCode, body: okBody } = createSuccessResponse(payload, {
        status: 201,
        message: 'Dang ky tai khoan thanh cong',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Khong the dang ky tai khoan. Vui long thu lai sau.';
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: message.toLowerCase().includes('ton tai') ? 409 : 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  @Get('auth/google/config')
  getPublicGoogleConfig(@Res() res: Response): Response {
    const { statusCode, body } = createSuccessResponse({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
    });
    return res.status(statusCode).json(body);
  }

  @Post('auth/google')
  async publicGoogleLogin(
    @Body() body: { credential?: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      if (!body?.credential?.trim()) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Thiếu credential Google.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const profile = await this.service.verifyGoogleToken(body.credential);
      if (!profile) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Credential Google không hợp lệ.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      if (!isEventStudentSchoolEmail(profile.email)) {
        const { statusCode, body: errBody } = createErrorResponse(
          EVENT_STUDENT_EMAIL_ERROR,
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.service.loginWithGoogleAsStudent(profile as GoogleProfileDto);
      if (!user || !isStudentPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Chỉ tài khoản sinh viên mới được đăng nhập cổng sự kiện.'
            : 'Không thể xác thực tài khoản Google.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập Google thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'Unknown Google login error';
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const { statusCode, body: errBody } = createErrorResponse(
        isDevelopment
          ? `Đã xảy ra lỗi khi đăng nhập Google: ${detail}`
          : 'Đã xảy ra lỗi khi đăng nhập Google.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/login')
  async publicLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const email = body?.email?.trim();
      const password = body?.password;
      if (!email || !password) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng nhập email và mật khẩu.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      if (!isEventStudentSchoolEmail(email)) {
        const { statusCode, body: errBody } = createErrorResponse(
          EVENT_STUDENT_EMAIL_ERROR,
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = (await this.service.login({ email, password })) as AuthLoginPayload | null;
      if (!user || !isStudentPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Chỉ tài khoản sinh viên mới được đăng nhập cổng sự kiện.'
            : 'Email hoặc mật khẩu không đúng.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/dev-login')
  async publicDevLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse('Thiếu userId.', {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }

    try {
      const user = (await this.service.loginAsDevelopmentUser(userId)) as AuthLoginPayload | null;
      if (!user || !isStudentPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Tài khoản development được chọn không có role student.'
            : 'Không tìm thấy tài khoản development.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      if (!isEventStudentSchoolEmail(user.email)) {
        const { statusCode, body: errBody } = createErrorResponse(
          EVENT_STUDENT_EMAIL_ERROR,
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập development thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập development.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/guest-login')
  async publicGuestLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const email = body?.email?.trim();
      const password = body?.password;
      if (!email || !password) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng nhập email và mật khẩu.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = (await this.service.login({ email, password })) as AuthLoginPayload | null;
      if (!user || !isEventGuestPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Chỉ tài khoản khách (phụ huynh/cá nhân) mới được đăng nhập kênh này.'
            : 'Email hoặc mật khẩu không đúng.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/guest-dev-login')
  async publicGuestDevLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse('Thiếu userId.', {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }

    try {
      const user = (await this.service.loginAsDevelopmentUser(userId)) as AuthLoginPayload | null;
      if (!user || !isEventGuestPayload(user)) {
        const { statusCode, body: errBody } = createErrorResponse(
          user
            ? 'Tài khoản development được chọn không phải khách (parent/user).'
            : 'Không tìm thấy tài khoản development.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập development thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập development.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/store-login')
  async storeLogin(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const email = body?.email?.trim();
      const password = body?.password;
      if (!email || !password) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Vui lòng nhập email và mật khẩu.',
          { status: 400 },
        );
        return res.status(statusCode).json(errBody);
      }

      const user = await this.service.login({ email, password });
      if (!user) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Email hoặc mật khẩu không đúng.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập. Vui lòng thử lại.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Post('auth/store-dev-login')
  async storeDevLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body: errBody } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(errBody);
    }

    const userId = body?.userId?.trim();
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse('Thiếu userId.', {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }

    try {
      const user = await this.service.loginAsDevelopmentUser(userId);
      if (!user) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Không tìm thấy tài khoản development.',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }

      const { statusCode, body: okBody } = createSuccessResponse(user, {
        message: 'Đăng nhập development thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đăng nhập development.',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  @Get('dev-login-options')
  getDevelopmentLoginOptions(
    @Query('role') role: string | undefined,
    @Query('roles') roles: string | undefined,
    @Query('excludeRoles') excludeRoles: string | undefined,
    @Query('emailSuffix') emailSuffix: string | undefined,
    @Query('activeOnly') activeOnly: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    return this.respondDevelopmentLoginOptions(
      res,
      { role, roles, excludeRoles, emailSuffix, activeOnly },
    );
  }

  @Get('auth/dev-login-options')
  getAuthDevelopmentLoginOptions(
    @Query('role') role: string | undefined,
    @Query('roles') roles: string | undefined,
    @Query('excludeRoles') excludeRoles: string | undefined,
    @Query('emailSuffix') emailSuffix: string | undefined,
    @Query('activeOnly') activeOnly: string | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    return this.respondDevelopmentLoginOptions(
      res,
      { role, roles, excludeRoles, emailSuffix, activeOnly },
    );
  }

  private async respondDevelopmentLoginOptions(
    res: Response,
    query: {
      role?: string;
      roles?: string;
      excludeRoles?: string;
      emailSuffix?: string;
      activeOnly?: string;
    },
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body } = createErrorResponse('Not Found', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }

    try {
      const data = await this.service.listDevelopmentLoginOptions({
        role: query.role,
        roles: query.roles,
        excludeRoles: query.excludeRoles,
        emailSuffix: query.emailSuffix,
        activeOnly: query.activeOnly !== 'false',
      });
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse(
        'Khong the tai danh sach tai khoan development.',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }
}
