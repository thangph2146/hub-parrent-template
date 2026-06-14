import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Param,
  ParseIntPipe,
  Query,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { createSuccessResponse, createErrorResponse } from '../common';
import { PUBLIC_ROUTES, APP_HEADERS } from '../config/constants';
import { Public } from '../common';

@Public()
@Controller(`${PUBLIC_ROUTES.BASE}/orders`)
export class PublicOrdersController {
  private readonly logger = new Logger(PublicOrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list(@Res() res: Response, @Query('email') email?: string) {
    try {
      if (!email?.trim()) {
        const { statusCode, body } = createErrorResponse(
          'Thiếu tham số email',
          { status: 400 },
        );
        return res.status(statusCode).json(body);
      }
      const data = await this.ordersService.listByCustomerEmail(email);
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi danh sách đơn',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get(':id')
  async get(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Query('email') email?: string,
  ) {
    try {
      const row = await this.ordersService.getPublicById(id, email);
      if (!row) {
        const { statusCode, body } = createErrorResponse('Không tìm thấy đơn', {
          status: 404,
        });
        return res.status(statusCode).json(body);
      }
      const { statusCode, body } = createSuccessResponse(row);
      return res.status(statusCode).json(body);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi đơn hàng',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Post()
  async checkout(
    @Res() res: Response,
    @Body() body: Record<string, unknown>,
    @Headers(APP_HEADERS.USER_ID) userId?: string,
  ) {
    try {
      const payload = {
        ...(body as object),
        customerId:
          typeof body.customerId === 'string'
            ? body.customerId
            : userId?.trim() || null,
      };
      const row = await this.ordersService.checkout(payload as never, {
        uploadedByUserId: userId?.trim(),
      });
      const { statusCode, body: ok } = createSuccessResponse(row, {
        status: 201,
      });
      return res.status(statusCode).json(ok);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Không đặt hàng được',
      );
      return res.status(statusCode).json(body);
    }
  }
}
