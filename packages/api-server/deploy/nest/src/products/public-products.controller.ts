import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { createSuccessResponse, createErrorResponse } from '../common';
import { PUBLIC_ROUTES } from '../config/constants';
import { Public } from '../common';

@Public()
@Controller(`${PUBLIC_ROUTES.BASE}/products`)
export class PublicProductsController {
  private readonly logger = new Logger(PublicProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('active') active?: string,
  ) {
    try {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(
        50,
        Math.max(1, parseInt(String(limit), 10) || 20),
      );
      const result = await this.productsService.listPublic({
        page: pageNum,
        limit: limitNum,
        activeOnly: active !== 'false',
        category,
        q,
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

  @Get('sku/:sku')
  async bySku(@Res() res: Response, @Param('sku') sku: string) {
    try {
      const row = await this.productsService.getBySku(sku);
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
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi sản phẩm',
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get(':id')
  async get(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      const row = await this.productsService.getPublicById(id);
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
    } catch (err) {
      this.logger.error(err);
      const { statusCode, body } = createErrorResponse(
        err instanceof Error ? err.message : 'Lỗi sản phẩm',
      );
      return res.status(statusCode).json(body);
    }
  }
}
