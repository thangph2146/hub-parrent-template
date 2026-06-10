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
import { ProductsService } from './products.service';
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

@Permissions(PERMISSIONS.PRODUCTS_VIEW)
@Controller(ADMIN_ROUTES.PRODUCTS)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

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
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('category') category?: string,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    try {
      const result = await this.productsService.list({
        page: parseAdminListPage(page),
        limit: parseAdminListLimit(limit),
        trash: status === 'deleted',
        activeOnly: status === 'active',
        q,
        category,
      });
      const { statusCode, body } = createSuccessResponse({
        data: result.data,
        pagination: result.pagination,
      });
      return res.status(statusCode).json(body);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi danh sách sản phẩm',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get(':id')
  async get(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const row = await this.productsService.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy sản phẩm',
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
  @Permissions(PERMISSIONS.PRODUCTS_CREATE)
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    try {
      const row = await this.productsService.create(body as never);
      const { statusCode, body: ok } = createSuccessResponse(row, {
        status: 201,
      });
      return res.status(statusCode).json(ok);
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Không tạo được sản phẩm',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Put(':id')
  @Permissions(PERMISSIONS.PRODUCTS_UPDATE)
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const row = await this.productsService.update(id, body as never);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy sản phẩm',
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
  @Permissions(PERMISSIONS.PRODUCTS_DELETE)
  async remove(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const ok = await this.productsService.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy sản phẩm',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse({ id });
    return res.status(statusCode).json(body);
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.PRODUCTS_UPDATE)
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!headers[APP_HEADERS.USER_ID]?.trim()) return this.unauthorized(res);
    const row = await this.productsService.restore(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy sản phẩm',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }
}
