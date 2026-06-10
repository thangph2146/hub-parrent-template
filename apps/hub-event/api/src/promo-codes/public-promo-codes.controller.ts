import { Controller, Get, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { PromoCodesService } from './promo-codes.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { PUBLIC_ROUTES } from '../config/constants';
import { Public } from '../common/public.decorator';

@Public()
@Controller(`${PUBLIC_ROUTES.BASE}/promo-codes`)
export class PublicPromoCodesController {
  private readonly logger = new Logger(PublicPromoCodesController.name);

  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Get()
  async listPublic(@Res() res: Response) {
    try {
      const data = await this.promoCodesService.listPublicRules();
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi mã khuyến mãi',
      );
      return res.status(statusCode).json(body);
    }
  }
}
