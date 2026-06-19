/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { createErrorResponse, createSuccessResponse, Public } from '../../index';
import { PUBLIC_ROUTES } from '../../../config/constants';;
import type { BaseSettingsService, PublicSiteBranding } from './setting.service';

export type IPublicSettingsControllerService = Pick<
  BaseSettingsService,
  'getPublicBranding'
>;

@Public()
@Controller(PUBLIC_ROUTES.BASE)
export class BasePublicSettingsController {
  constructor(private readonly service: IPublicSettingsControllerService) {}

  @Get('site-branding')
  async getSiteBranding(@Res() res: Response): Promise<Response> {
    try {
      const data = await this.service.getPublicBranding();
      const { statusCode, body } = createSuccessResponse<PublicSiteBranding>(data);
      return res.status(statusCode).json(body);
    } catch {
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }
}
