/**
 * BaseAccountsController — HTTP admin accounts (@workspace/api-server).
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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { BaseAdminHttpController } from '../../crud/base-admin-http.controller';
import type { BaseAccountsService, UpdateAccountDto } from './accounts.service';
import { Permissions } from '../../index';
import { ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import { apiServerAppConfig } from '../../../config/app-config';

type AvatarUploadsBinding = {
  saveFile: (
    file: { buffer: Buffer; originalname: string; mimetype: string },
    folderPath?: string,
    isExistingFolder?: boolean,
    serveBaseUrl?: string,
    userId?: string,
    ownerUserId?: string,
    options?: { imageOutput?: 'webp' | 'jpeg-face' },
  ) => Promise<{ url: string }>;
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export type IAccountsControllerService = Pick<
  BaseAccountsService,
  | 'getProfile'
  | 'updateProfile'
>;
/** @deprecated Dùng `IAccountsControllerService`. */
export type IAccountsAdminControllerService = IAccountsControllerService;

@Permissions(PERMISSIONS.ACCOUNTS_VIEW)
@Controller(ADMIN_ROUTES.ACCOUNTS)
export class BaseAccountsController extends BaseAdminHttpController {
  constructor(
    protected readonly service: IAccountsControllerService,
    protected readonly uploadsService: Pick<AvatarUploadsBinding, 'saveFile'>,
  ) {
    super();
  }

  @Get()
  async getProfile(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const profile = await this.service.getProfile(userId);
    if (!profile) return this.sendNotFound(res, 'Không tìm thấy tài khoản');
    return this.sendSuccess(res, profile);
  }

  @Put()
  @Permissions(PERMISSIONS.ACCOUNTS_UPDATE)
  async updateProfile(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: UpdateAccountDto,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const allowed = [
      'name',
      'bio',
      'phone',
      'address',
      'citizenId',
      'avatar',
      'studentCode',
      'currentPassword',
      'password',
    ] as const;
    const payload: UpdateAccountDto = {};
    for (const key of allowed) {
      if ((body as Record<string, unknown>)[key] !== undefined) {
        (payload as Record<string, unknown>)[key] = (
          body as Record<string, unknown>
        )[key];
      }
    }

    const result = await this.service.updateProfile(userId, payload);
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
        invalid_student_code: {
          status: 400,
          message:
            'Mã số sinh viên không hợp lệ hoặc đã được sử dụng. MSSV phải là số (5–12 chữ số).',
        },
      };
      const picked = messages[result.reason];
      return this.sendError(res, picked.message, picked.status);
    }

    return this.sendSuccess(res, result.profile);
  }

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
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    if (!file?.buffer?.length) {
      return this.sendError(res, 'Thiếu file ảnh', 400);
    }

    try {
      const data = await this.uploadsService.saveFile(
        {
          buffer: file.buffer,
          originalname: file.originalname || 'avatar',
          mimetype: file.mimetype || 'application/octet-stream',
        },
        'avatars',
        undefined,
        this.getServeBaseUrl(req),
        userId,
        userId,
      );
      return this.sendSuccess(res, { url: data.url });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi upload ảnh';
      this.logger.warn(
        `POST ${ADMIN_ROUTES.ACCOUNTS}/avatar failed: ${message}`,
      );
      return this.sendError(res, message, 400);
    }
  }

  private getServeBaseUrl(req?: Request): string {
    if (apiServerAppConfig.publicUrl) {
      return `${apiServerAppConfig.publicUrl.replace(/\/$/, '')}/api/uploads`;
    }
    if (apiServerAppConfig.nodeEnv === 'production') {
      return '';
    }
    const fallback = req && `${req.protocol || 'http'}://${req.get('host')}`;
    return fallback ? `${fallback.replace(/\/$/, '')}/api/uploads` : '';
  }
}
