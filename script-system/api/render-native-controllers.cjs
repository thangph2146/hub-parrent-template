/**
 * Sinh controller đặc thù (lookup/upsert, eventId list, face-data create…) từ registry.
 */
const GENERATED_BANNER = `/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */\n`

/** @type {Record<string, (def: object) => string>} */
const NATIVE_CONTROLLER_TEMPLATES = {
  'face-data'(def) {
    const serviceProp = 'faceDataService'
    return `${GENERATED_BANNER}import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
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
} from '@nestjs/common';
import type { Response } from 'express';
import { ${def.serviceClass} } from './${def.serviceFile.replace(/\.ts$/, '')}';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction } from '../common/bulk-actions';
import { toEntityId } from '../common/entity-id';
import {
  buildAdminListCrudParams,
  bulkAffectedCount,
} from '../common/admin-list-params';

@ApiTags('FaceData')
@Permissions(PERMISSIONS.FACE_DATA_VIEW)
@Controller(ADMIN_ROUTES.FACE_DATA)
export class ${def.controllerClass} {
  private readonly logger = new Logger(${def.controllerClass}.name);

  constructor(private readonly ${serviceProp}: ${def.serviceClass}) {}

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
  @ApiOperation({ summary: 'List face data with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ) {
    this.logger.log(\`list page=\${page ?? 1} limit=\${limit ?? 10}\`);
    const authUserId = this.getUserId(headers);
    if (!authUserId) return this.unauthorized(res);
    const result = await this.${serviceProp}.list(
      buildAdminListCrudParams({ page, limit, userId }),
    );
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get face data by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const row = await this.${serviceProp}.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy face data',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Post()
  @Permissions(PERMISSIONS.FACE_DATA_CREATE)
  @ApiOperation({ summary: 'Create new face data' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      imagePath: string;
      userId?: string;
      status?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.imagePath?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'imagePath là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const created = await this.${serviceProp}.create({
      imagePath: body.imagePath.trim(),
      userId: body.userId?.trim() ? toEntityId(body.userId) : null,
      status: body.status,
    });
    const { statusCode, body: okBody } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.FACE_DATA_UPDATE)
  @ApiOperation({ summary: 'Update face data by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      imagePath?: string;
      status?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const updated = await this.${serviceProp}.update(id, {
      imagePath: body?.imagePath?.trim(),
      status: body?.status,
    });
    if (!updated) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy face data',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.FACE_DATA_HARD_DELETE)
  @ApiOperation({ summary: 'Hard delete face data permanently' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.${serviceProp}.hardDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy face data',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn face data',
    });
    return res.status(statusCode).json(body);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.FACE_DATA_DELETE)
  @ApiOperation({ summary: 'Soft delete face data' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.${serviceProp}.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Face data không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa face data',
    });
    return res.status(statusCode).json(body);
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.FACE_DATA_RESTORE)
  @ApiOperation({ summary: 'Restore soft-deleted face data' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.${serviceProp}.restore(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Face data không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục face data',
    });
    return res.status(statusCode).json(body);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.FACE_DATA_MANAGE)
  @ApiOperation({ summary: 'Bulk action on khuon mats' })
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
    const result = await this.${serviceProp}.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: bulkAffectedCount(result), message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
`
  },

  'seo-metas'(def) {
    const serviceProp = 'service'
    return `${GENERATED_BANNER}import {
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
import { ${def.serviceClass} } from './${def.serviceFile.replace(/\.ts$/, '')}';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction } from '../common/bulk-actions';
import { buildAdminListCrudParams } from '../common/admin-list-params';

@Permissions(PERMISSIONS.SEO_METAS_VIEW)
@Controller(ADMIN_ROUTES.SEO_METAS)
export class ${def.controllerClass} {
  constructor(private readonly ${serviceProp}: ${def.serviceClass}) {}

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
    const result = await this.${serviceProp}.list(
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
    const row = await this.${serviceProp}.getByPage(normalized);
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
      const saved = await this.${serviceProp}.upsertByPage(body.page.trim(), {
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
    const row = await this.${serviceProp}.getById(id);
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
    const created = await this.${serviceProp}.create({
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
    const updated = await this.${serviceProp}.update(id, {
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
    const ok = await this.${serviceProp}.softDelete(id);
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
    const ok = await this.${serviceProp}.restore(id);
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
    const ok = await this.${serviceProp}.hardDelete(id);
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
    const result = await this.${serviceProp}.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.success, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
`
  },

  'event-checkouts'(def) {
    const serviceProp = 'eventCheckoutsService'
    return `${GENERATED_BANNER}import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ${def.serviceClass} } from './${def.serviceFile.replace(/\.ts$/, '')}';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { parseAdminListLimit } from '../common/parse-list-query';

@ApiTags('Event Checkouts')
@Permissions(PERMISSIONS.EVENT_CHECKOUTS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_CHECKOUTS)
export class ${def.controllerClass} {
  private readonly logger = new Logger(${def.controllerClass}.name);

  constructor(private readonly ${serviceProp}: ${def.serviceClass}) {}

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
  @ApiOperation({
    summary: 'List event checkouts (registrations with hasCheckout=true)',
  })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('eventId') eventId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    this.logger.log(
      \`list eventId=\${eventId} page=\${page ?? 1} limit=\${limit ?? 10}\`,
    );
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!eventId?.trim()) {
      const { statusCode, body } = createErrorResponse('eventId là bắt buộc', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
    const result = await this.${serviceProp}.list({
      eventId: eventId.trim(),
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_CHECKOUTS_MANAGE)
  @ApiOperation({ summary: 'Bulk clear checkouts (reset hasCheckout=false)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({
    description: 'Bulk action with registration ids',
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
      },
      required: ['ids'],
    },
  })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  @ApiResponse({ status: 401, description: 'Missing X-User-Id header' })
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { ids?: string[] },
  ) {
    this.logger.log(\`bulk clear-checkout ids=\${(body?.ids ?? []).length}\`);
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const result = await this.${serviceProp}.bulkClear(ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
`
  },

  settings(def) {
    const serviceProp = 'settingsService'
    return `${GENERATED_BANNER}import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  Res,
  Delete,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ${def.serviceClass} } from './${def.serviceFile.replace(/\.ts$/, '')}';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';

@Permissions(PERMISSIONS.SETTINGS_VIEW)
@Controller(ADMIN_ROUTES.SETTINGS)
export class ${def.controllerClass} {
  private readonly logger = new Logger(${def.controllerClass}.name);

  constructor(private readonly ${serviceProp}: ${def.serviceClass}) {}

  private logApiError(api: string, error: unknown, metadata?: unknown): void {
    const details =
      error instanceof Error
        ? {
            api,
            name: error.name,
            message: error.message,
            stack: error.stack ?? null,
            metadata: metadata ?? null,
          }
        : {
            api,
            message: String(error),
            stack: null,
            metadata: metadata ?? null,
          };
    this.logger.error(JSON.stringify(details));
  }

  @Get()
  async list(
    @Res() res: Response,
    @Query('group') group?: string,
    @Query('search') search?: string,
  ) {
    try {
      const data = await this.${serviceProp}.listSettings({ group, search });
      const { statusCode, body } = createSuccessResponse({ data });
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/settings', error, { group, search });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get(':key')
  async getByKey(@Res() res: Response, @Param('key') key: string) {
    try {
      const result = await this.${serviceProp}.getByKey(key);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/settings/:key', error, { key });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SETTINGS_UPDATE)
  @Put()
  async updateBulk(
    @Res() res: Response,
    @Body() settings: Record<string, unknown>,
  ) {
    try {
      const result = await this.${serviceProp}.bulkUpdate(settings);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('PUT /api/admin/settings', error, {
        keyCount: Object.keys(settings ?? {}).length,
      });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SETTINGS_UPDATE)
  @Put(':key')
  async update(
    @Res() res: Response,
    @Param('key') key: string,
    @Body('value') value: unknown,
  ) {
    try {
      const result = await this.${serviceProp}.updateByKey(key, value);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('PUT /api/admin/settings/:key', error, { key });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SETTINGS_DELETE)
  @Delete(':id')
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.${serviceProp}.deleteSetting(id);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('DELETE /api/admin/settings/:id', error, { id });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }
}
`
  },
}

function renderNativeController(def) {
  const key = def.controllerTemplate
  if (!key) return null
  const fn = NATIVE_CONTROLLER_TEMPLATES[key]
  if (!fn) {
    throw new Error(`[render-native-controllers] Template không tồn tại: ${key}`)
  }
  return fn(def)
}

module.exports = { renderNativeController, NATIVE_CONTROLLER_TEMPLATES }
