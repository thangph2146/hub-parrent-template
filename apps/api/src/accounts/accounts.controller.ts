/**
 * Accounts API cho admin: xem/cập nhật profile user hiện tại.
 * Header: X-User-Id (bắt buộc).
 */
import {
  Controller,
  Get,
  Put,
  Body,
  Headers,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AccountsService } from './accounts.service';
import type { UpdateAccountDto } from './accounts.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';

@Permissions(PERMISSIONS.ACCOUNTS_VIEW)
@Controller(ADMIN_ROUTES.ACCOUNTS)
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(private readonly accountsService: AccountsService) {}

  private getUserId(
    headers: Record<string, string | undefined>,
  ): string | null {
    const id = headers[APP_HEADERS.USER_ID]?.trim();
    return id || null;
  }

  /**
   * GET /api/admin/accounts - Lấy profile user hiện tại
   */
  @Get()
  async getProfile(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        {
          status: 401,
        },
      );
      return res.status(statusCode).json(body);
    }

    const profile = await this.accountsService.getProfile(userId);

    if (!profile) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy tài khoản',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(body);
    }

    const { statusCode, body } = createSuccessResponse(profile);
    return res.status(statusCode).json(body);
  }

  /**
   * PUT /api/admin/accounts - Cập nhật profile user hiện tại
   */
  @Put()
  @Permissions(PERMISSIONS.ACCOUNTS_UPDATE)
  async updateProfile(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: UpdateAccountDto,
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }

    const allowed = [
      'name',
      'bio',
      'phone',
      'address',
      'citizenId',
      'avatar',
      'currentPassword',
      'password',
    ];
    const payload: UpdateAccountDto = {};
    for (const key of allowed) {
      if ((body as Record<string, unknown>)[key] !== undefined) {
        (payload as Record<string, unknown>)[key] = (
          body as Record<string, unknown>
        )[key];
      }
    }

    const result = await this.accountsService.updateProfile(userId, payload);

    if (!result.ok) {
      const messages: Record<
        typeof result.reason,
        { status: number; message: string }
      > = {
        not_found: {
          status: 404,
          message: 'Không tìm thấy tài khoản hoặc cập nhật thất bại',
        },
        wrong_password: {
          status: 400,
          message: 'Mật khẩu hiện tại không đúng',
        },
        password_required: {
          status: 400,
          message: 'Cần nhập mật khẩu hiện tại để đổi mật khẩu',
        },
      };
      const picked = messages[result.reason];
      const { statusCode, body: errBody } = createErrorResponse(
        picked.message,
        { status: picked.status },
      );
      return res.status(statusCode).json(errBody);
    }

    const { statusCode, body: okBody } = createSuccessResponse(result.profile);
    return res.status(statusCode).json(okBody);
  }
}
