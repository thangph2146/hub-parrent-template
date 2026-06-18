import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Put,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { CartsService } from './carts.service';
import { createSuccessResponse, createErrorResponse } from '../common';
import { APP_HEADERS, PUBLIC_ROUTES } from '../config/constants';
import { Public } from '../common';

@Public()
@Controller(`${PUBLIC_ROUTES.BASE}/cart`)
export class PublicCartsController {
  private readonly logger = new Logger(PublicCartsController.name);

  constructor(private readonly cartsService: CartsService) {}

  private resolveCustomerId(header?: string): string | null {
    const id = header?.trim();
    return id || null;
  }

  @Get()
  async getMine(
    @Res() res: Response,
    @Headers(APP_HEADERS.USER_ID) userId?: string,
  ) {
    try {
      const customerId = this.resolveCustomerId(userId);
      if (!customerId) {
        const { statusCode, body } = createErrorResponse('Chưa đăng nhập', {
          status: 401,
        });
        return res.status(statusCode).json(body);
      }
      const data = await this.cartsService.getForCustomer(customerId);
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi tải giỏ hàng',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Put()
  async saveMine(
    @Res() res: Response,
    @Body() body: Record<string, unknown>,
    @Headers(APP_HEADERS.USER_ID) userId?: string,
  ) {
    try {
      const customerId = this.resolveCustomerId(userId);
      if (!customerId) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Chưa đăng nhập',
          { status: 401 },
        );
        return res.status(statusCode).json(errBody);
      }
      const data = await this.cartsService.saveForCustomer(customerId, body);
      const { statusCode, body: ok } = createSuccessResponse(data);
      return res.status(statusCode).json(ok);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi lưu giỏ hàng',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Delete()
  async clearMine(
    @Res() res: Response,
    @Headers(APP_HEADERS.USER_ID) userId?: string,
  ) {
    try {
      const customerId = this.resolveCustomerId(userId);
      if (!customerId) {
        const { statusCode, body } = createErrorResponse('Chưa đăng nhập', {
          status: 401,
        });
        return res.status(statusCode).json(body);
      }
      await this.cartsService.clearForCustomer(customerId);
      const { statusCode, body } = createSuccessResponse({ ok: true });
      return res.status(statusCode).json(body);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi xoá giỏ hàng',
      );
      return res.status(statusCode).json(body);
    }
  }
}
