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
} from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiBody, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { SeoMetasService } from './seo-metas.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction, type BulkAction } from '../common/bulk-actions';
import { buildAdminListCrudParams } from '../common/admin-list-params';

@Permissions(PERMISSIONS.SEO_METAS_VIEW)
@Controller(ADMIN_ROUTES.SEO_METAS)
export class SeoMetasController {
  constructor(private readonly service: SeoMetasService) {}

  private getUserId(
    headers: Record<string, string | undefined>,
  ): string | null {
    const id = headers[APP_HEADERS.USER_ID]?.trim();
    return id || null;
  }

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
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query() query?: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const result = await this.service.list(
      buildAdminListCrudParams({ page, limit, search, status, query }),
    );
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get('lookup')
  async lookupByPage(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const normalized = page?.trim();
    if (!normalized) {
      const { statusCode, body } = createErrorResponse('Thiếu query page', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
    const row = await this.service.getByPage(normalized);
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Put('upsert')
  @Permissions(
    PERMISSIONS.SEO_METAS_UPDATE,
    PERMISSIONS.SEO_METAS_MANAGE,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SETTINGS_MANAGE,
  )
  async upsertByPage(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      page: string;
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
      status?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.page?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'page là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    try {
      const saved = await this.service.upsertByPage(body.page.trim(), {
        title: body.title,
        description: body.description,
        keywords: body.keywords,
        ogTitle: body.ogTitle,
        ogDescription: body.ogDescription,
        ogImage: body.ogImage,
        status: body.status,
      });
      const { statusCode, body: okBody } = createSuccessResponse(saved);
      return res.status(statusCode).json(okBody);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không lưu được SEO meta';
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  @Get(':id')
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const row = await this.service.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Post()
  @Permissions(PERMISSIONS.SEO_METAS_CREATE)
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      page: string;
      title?: string;
      description?: string;
      keywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.page?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'page là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const created = await this.service.create({
      page: body.page.trim(),
      title: body.title?.trim(),
      description: body.description?.trim(),
      keywords: body.keywords?.trim(),
      ogTitle: body.ogTitle?.trim(),
      ogDescription: body.ogDescription?.trim(),
      ogImage: body.ogImage?.trim(),
    });
    const { statusCode, body: okBody } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.SEO_METAS_UPDATE)
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      page?: string;
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
      ogImage?: string | null;
      status?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const updated = await this.service.update(id, {
      page: body?.page?.trim(),
      title: body?.title,
      description: body?.description,
      keywords: body?.keywords,
      ogTitle: body?.ogTitle,
      ogDescription: body?.ogDescription,
      ogImage: body?.ogImage,
      status: body?.status,
    });
    if (!updated) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.SEO_METAS_DELETE)
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.service.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy hoặc đã xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa',
    });
    return res.status(statusCode).json(body);
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.SEO_METAS_RESTORE)
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.service.restore(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy hoặc chưa xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục',
    });
    return res.status(statusCode).json(body);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.SEO_METAS_MANAGE)
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.service.hardDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn',
    });
    return res.status(statusCode).json(body);
  }
  @Post('bulk')
  @Permissions(PERMISSIONS.SEO_METAS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on SEO metas' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({ description: 'Bulk action with ids' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { action?: string; ids?: string[] },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !isBulkAction(action)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Action khong hop le',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const result = await this.service.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.success, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
