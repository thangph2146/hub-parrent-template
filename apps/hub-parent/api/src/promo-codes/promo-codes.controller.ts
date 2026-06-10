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
import { PromoCodesService } from './promo-codes.service';
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
import { parseColumnFiltersFromQuery } from '../common/parse-column-filters';

@Permissions(PERMISSIONS.PROMO_CODES_VIEW)
@Controller(ADMIN_ROUTES.PROMO_CODES)
export class PromoCodesController {
  private readonly logger = new Logger(PromoCodesController.name);

  constructor(private readonly promoCodesService: PromoCodesService) {}

  private unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse('Thiếu header X-User-Id', {
      status: 401,
    });
    return res.status(statusCode).json(body);
  }

  @Get()
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query() query?: Record<string, string>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const result = await this.promoCodesService.list({
      page: parseAdminListPage(page),
      limit: parseAdminListLimit(limit, 20),
      q,
      filters: parseColumnFiltersFromQuery(query),
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
    const row = await this.promoCodesService.getById(id);
    if (!row) {
      const err = createErrorResponse('Không tìm thấy mã KM', { status: 404 });
      return res.status(err.statusCode).json(err.body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Post()
  @Permissions(PERMISSIONS.PROMO_CODES_CREATE)
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const row = await this.promoCodesService.create(body);
    const { statusCode, body: payload } = createSuccessResponse(row, {
      status: 201,
    });
    return res.status(statusCode).json(payload);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.PROMO_CODES_UPDATE)
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const row = await this.promoCodesService.update(id, body);
    if (!row) {
      const err = createErrorResponse('Không tìm thấy mã KM', { status: 404 });
      return res.status(err.statusCode).json(err.body);
    }
    const { statusCode, body: payload } = createSuccessResponse(row);
    return res.status(statusCode).json(payload);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PROMO_CODES_DELETE)
  async remove(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const ok = await this.promoCodesService.softDelete(id);
    if (!ok) {
      const err = createErrorResponse('Không tìm thấy mã KM', { status: 404 });
      return res.status(err.statusCode).json(err.body);
    }
    const { statusCode, body } = createSuccessResponse({ ok: true });
    return res.status(statusCode).json(body);
  }
}
