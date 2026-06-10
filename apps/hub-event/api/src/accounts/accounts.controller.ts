/**
 * Accounts API cho admin: xem/cập nhật profile user hiện tại.
 * Header: X-User-Id (bắt buộc).
 */
import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Headers,
  Res,
  Req,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AccountsService } from './accounts.service';
import type { UpdateAccountDto } from './accounts.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { appConfig } from '../config/app.config';
import { UploadsService } from '../uploads/uploads.service';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

@Permissions(PERMISSIONS.ACCOUNTS_VIEW)
@Controller(ADMIN_ROUTES.ACCOUNTS)
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly uploadsService: UploadsService,
  ) {}

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

  /**
   * POST /api/admin/accounts/avatar — upload ảnh đại diện (chỉ thư mục avatars).
   * Quyền `accounts:update`; không yêu cầu `uploads:create` (cổng sinh viên / self-service).
   */
  @Post('avatar')
  @Permissions(PERMISSIONS.ACCOUNTS_UPDATE)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_AVATAR_BYTES } }),
  )
  async uploadAvatar(
    @Res() res: Response,
    @Req() req: Request,
    @Headers() headers: Record<string, string | undefined>,
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }

    if (!file?.buffer?.length) {
      const { statusCode, body } = createErrorResponse('Thiếu file ảnh', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }

    const serveBaseUrl = this.getServeBaseUrl(req);

    try {
      const data = await this.uploadsService.saveFile(
        {
          buffer: file.buffer,
          originalname: file.originalname || 'avatar',
          mimetype: file.mimetype || 'application/octet-stream',
        },
        'avatars',
        undefined,
        serveBaseUrl,
        userId,
        userId,
      );
      const { statusCode, body } = createSuccessResponse({ url: data.url });
      return res.status(statusCode).json(body);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi upload ảnh';
      this.logger.warn(
        `POST ${ADMIN_ROUTES.ACCOUNTS}/avatar failed: ${message}`,
      );
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  private getServeBaseUrl(req?: Request): string {
    if (appConfig.publicUrl) {
      return `${appConfig.publicUrl.replace(/\/$/, '')}/api/uploads`;
    }
    if (appConfig.nodeEnv === 'production') {
      return '';
    }
    const fallback = req && `${req.protocol || 'http'}://${req.get('host')}`;
    return fallback ? `${fallback.replace(/\/$/, '')}/api/uploads` : '';
  }
}
