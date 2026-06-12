/**
 * Categories Controller.
 */
import { Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import {
  createSuccessResponse,
  type ApiResponsePayload,
} from '../../common';
import type {
  CategoryRowDto,
  CategoryCreateData,
  CategoryUpdateData,
  CategoryUsageRow,
} from './categories.service';

export interface ICategoriesControllerService
  extends ICrudControllerService<
    CategoryRowDto,
    CategoryCreateData,
    CategoryUpdateData
  > {
  getUsage(): Promise<CategoryUsageRow[]>;
}

@ApiTags('Categories')
export class BaseCategoriesController extends BaseCrudController<
  CategoryRowDto,
  CategoryCreateData,
  CategoryUpdateData
> {
  private readonly categoriesService: ICategoriesControllerService;

  constructor(service: ICategoriesControllerService) {
    super(service, 'categories');
    this.categoriesService = service;
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get category usage summary' })
  @ApiResponse({ status: 200, description: 'Category usage retrieved successfully' })
  async usage(): Promise<ApiResponsePayload<CategoryUsageRow[]>> {
    const rows = await this.categoriesService.getUsage();
    return createSuccessResponse(rows).body;
  }
}
