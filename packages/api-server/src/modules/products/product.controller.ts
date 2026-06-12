/**
 * Products Controller.
 *
 * Bám sát pattern của `apps/main/api/src/products/products.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /products              - list
 *   GET    /products/:id          - getById
 *   POST   /products              - create
 *   PUT    /products/:id          - update
 *   DELETE /products/:id          - softDelete
 *   POST   /products/:id/restore  - restore
 *   DELETE /products/:id/hard     - hardDelete
 *   POST   /products/bulk         - bulk action
 */
import {
  Post,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponsePayload,
} from '../../common';
import type {
  ProductsRowDto,
  ProductsCreateData,
  ProductsUpdateData,
} from './product.service';

export interface IProductsControllerService
  extends ICrudControllerService<
    ProductsRowDto,
    ProductsCreateData,
    ProductsUpdateData
  > {
  restoreRow(id: string | number): Promise<ProductsRowDto | null>;
}

@ApiTags('Products')
export class BaseProductsController extends BaseCrudController<
  ProductsRowDto,
  ProductsCreateData,
  ProductsUpdateData,
  ProductsRowDto
> {
  private readonly productsService: IProductsControllerService;

  constructor(service: IProductsControllerService) {
    super(service, 'products');
    this.productsService = service;
  }

  /**
   * POST /products/:id/restore — trả về row đầy đủ (khớp apps/main/api + api-client).
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft-deleted product' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Restored product row' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async restore(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<ProductsRowDto>> {
    const row = await this.productsService.restoreRow(id);
    if (!row) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy sản phẩm', { status: 404 }).body,
      );
    }
    return createSuccessResponse(row).body;
  }
}
