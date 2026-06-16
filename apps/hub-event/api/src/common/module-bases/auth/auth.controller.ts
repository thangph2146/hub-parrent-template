/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Body, Controller, Get, Headers, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  Public,
  createErrorResponse,
  createSuccessResponse,
} from '../../index';
import { ADMIN_ROUTES, APP_HEADERS } from '../../../config/constants';
import type { BaseAuthService, GoogleProfileDto } from './auth.service';

export type IAuthControllerService = Pick<
  BaseAuthService,
  | 'login'
  | 'tryAuthPayloadByUserId'
  | 'loginAsDevelopmentUser'
  | 'verifyGoogleToken'
  | 'loginWithGoogle'
  | 'loginWithGoogleAsStudent'
  | 'logout'
>;

/** @deprecated Dùng `IAuthControllerService`. */
export type IAuthAdminControllerService = IAuthControllerService;

@ApiTags('Auth')
@Controller(ADMIN_ROUTES.AUTH)
export class BaseAuthController {
  constructor(private readonly service: IAuthControllerService) {}

  @Get('me')
  async me(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response> {
    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thieu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }

    const { payload, reason } =
      await this.service.tryAuthPayloadByUserId(userId);
    if (!payload) {
      const byReason: Record<
        NonNullable<typeof reason>,
        { status: number; message: string }
      > = {
        not_found: {
          status: 404,
          message: 'Khong tim thay tai khoan. Dang nhap lai.',
        },
        inactive: {
          status: 404,
          message: 'Tai khoan da bi vo hieu hoa hoac xoa mem.',
        },
        no_roles: {
          status: 404,
          message:
            'Khong tim thay tai khoan hop le cho phien dang nhap: thieu user_roles.',
        },
      };
      const picked = reason ? byReason[reason] : byReason.not_found;
      const { statusCode, body } = createErrorResponse(picked.message, {
        status: picked.status,
      });
      return res.status(statusCode).json(body);
    }

    const { statusCode, body } = createSuccessResponse(payload);
    return res.status(statusCode).json(body);
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string },
    @Res() res: Response,
  ): Promise<Response> {
    const payload = await this.service.login(body);
    if (!payload) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Email hoac mat khau khong dung.',
        { status: 401 },
      );
      return res.status(statusCode).json(responseBody);
    }
    const { statusCode, body: responseBody } = createSuccessResponse(payload, {
      message: 'Dang nhap thanh cong',
    });
    return res.status(statusCode).json(responseBody);
  }

  @Public()
  @Post('dev-login')
  async developmentLogin(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ): Promise<Response> {
    if (process.env.NODE_ENV !== 'development') {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Not Found',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(responseBody);
    }
    const userId = body?.userId?.trim();
    if (!userId) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'userId la bat buoc.',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }

    const payload = await this.service.loginAsDevelopmentUser(userId);
    if (!payload) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Khong tim thay tai khoan development hop le trong database.',
        { status: 404 },
      );
      return res.status(statusCode).json(responseBody);
    }

    const { statusCode, body: responseBody } = createSuccessResponse(payload, {
      message: 'Dang nhap development thanh cong',
    });
    return res.status(statusCode).json(responseBody);
  }

  @Public()
  @Get('google/config')
  getGoogleConfig(@Res() res: Response): Response {
    const { statusCode, body } = createSuccessResponse({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
    });
    return res.status(statusCode).json(body);
  }

  @Public()
  @Post('google')
  async google(
    @Body() body: { credential?: string },
    @Res() res: Response,
  ): Promise<Response> {
    if (!body?.credential?.trim()) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Thieu credential Google.',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }

    const profile = await this.service.verifyGoogleToken(body.credential);
    if (!profile) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Credential Google khong hop le.',
        { status: 401 },
      );
      return res.status(statusCode).json(responseBody);
    }

    const payload = await this.service.loginWithGoogle(profile);
    if (!payload) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Khong the xac thuc tai khoan Google.',
        { status: 401 },
      );
      return res.status(statusCode).json(responseBody);
    }

    const { statusCode, body: responseBody } = createSuccessResponse(payload, {
      message: 'Dang nhap Google thanh cong',
    });
    return res.status(statusCode).json(responseBody);
  }

  @Post('logout')
  async logout(
    @Body() body: { userId?: string },
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.service.logout(body?.userId);
    const { statusCode, body: responseBody } = createSuccessResponse(result, {
      message: 'Dang xuat thanh cong',
    });
    return res.status(statusCode).json(responseBody);
  }
}

/** @deprecated Dùng `BaseAuthController`. */
export class BaseAuthAdminController extends BaseAuthController {}
