/**
 * SeoMetas Controller.
 */
import { Get, Put, Query, Body } from '@nestjs/common';
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
  SeoMetasRowDto,
  SeoMetasCreateData,
  SeoMetasUpdateData,
} from './seo-meta.service';

export interface ISeoMetasControllerService
  extends ICrudControllerService<
    SeoMetasRowDto,
    SeoMetasCreateData,
    SeoMetasUpdateData
  > {
  getByPage(page: string): Promise<SeoMetasRowDto | null>;
  upsertByPage(
    page: string,
    data: Omit<SeoMetasUpdateData, 'page'>,
  ): Promise<SeoMetasRowDto>;
}

@ApiTags('SeoMetas')
export class BaseSeoMetasController extends BaseCrudController<
  SeoMetasRowDto,
  SeoMetasCreateData,
  SeoMetasUpdateData
> {
  private readonly seoMetasService: ISeoMetasControllerService;

  constructor(service: ISeoMetasControllerService) {
    super(service, 'seo-metas');
    this.seoMetasService = service;
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Lookup SEO meta by page key' })
  @ApiResponse({ status: 200, description: 'SEO meta lookup completed' })
  async getByPage(
    @Query('page') page?: string,
  ): Promise<ApiResponsePayload<SeoMetasRowDto | null>> {
    const row = await this.seoMetasService.getByPage(page?.trim() ?? '');
    return createSuccessResponse(row).body;
  }

  @Put('upsert')
  @ApiOperation({ summary: 'Upsert SEO meta by page key' })
  @ApiResponse({ status: 200, description: 'SEO meta upsert completed' })
  async upsertByPage(
    @Body()
    body: {
      page: string;
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
      status?: number | null;
    },
  ): Promise<ApiResponsePayload<SeoMetasRowDto>> {
    const row = await this.seoMetasService.upsertByPage(body.page, {
      title: body.title,
      description: body.description,
      keywords: body.keywords,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      ogImage: body.ogImage,
      status: body.status,
    });
    return createSuccessResponse(row).body;
  }
}
