import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { ADMIN_ROUTES, APP_HEADERS } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import {
  parseAdminListLimit,
  parseAdminListPage,
} from '../common/parse-list-query';
import type { OrderStatus } from '../entities/order.entity';

const ORDER_STATUSES = new Set<OrderStatus | 'all'>([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'all',
]);

@Permissions(PERMISSIONS.ORDERS_VIEW)
@Controller(ADMIN_ROUTES.ORDERS)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  private unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse('Thiếu header X-User-Id', {
      status: 401,
    });
    return res.status(statusCode).json(body);
  }

  @Get('staff/status-counts')
  async statusCounts(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const counts = await this.ordersService.getStaffStatusCounts();
    const { statusCode, body } = createSuccessResponse(counts);
    return res.status(statusCode).json(body);
  }

  @Get()
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('trash') trash?: string,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const statusFilter =
      status && ORDER_STATUSES.has(status as OrderStatus | 'all')
        ? (status as OrderStatus | 'all')
        : 'all';
    const result = await this.ordersService.list({
      page: parseAdminListPage(page),
      limit: parseAdminListLimit(limit),
      status: statusFilter,
      search,
      trash: trash === 'true',
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  async get(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const row = await this.ordersService.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy đơn hàng',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Post()
  @Permissions(PERMISSIONS.ORDERS_CREATE)
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    try {
      const row = await this.ordersService.checkout(body as never, {
        uploadedByUserId: headers[APP_HEADERS.USER_ID]?.trim(),
      });
      const { statusCode, body: ok } = createSuccessResponse(row, {
        status: 201,
      });
      return res.status(statusCode).json(ok);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Không tạo được đơn hàng',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Put(':id/status')
  @Permissions(PERMISSIONS.ORDERS_UPDATE)
  async updateStatus(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status?: OrderStatus },
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const status = body?.status;
    if (!status || !ORDER_STATUSES.has(status)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Trạng thái không hợp lệ',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const row = await this.ordersService.updateStatus(
      id,
      status,
      headers[APP_HEADERS.USER_ID]?.trim(),
    );
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy đơn hàng',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body: ok } = createSuccessResponse(row);
    return res.status(statusCode).json(ok);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ORDERS_DELETE)
  async remove(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const ok = await this.ordersService.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy đơn hàng',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse({ id });
    return res.status(statusCode).json(body);
  }
}
