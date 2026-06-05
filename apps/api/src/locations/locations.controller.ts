import {
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
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import type { Response } from 'express';
import { LocationsService } from './locations.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { BULK_ACTIONS, type BulkAction } from '../common/bulk-actions';
import { parseAdminListLimit } from '../common/parse-list-query';
import { parseColumnFiltersFromQuery } from '../common/parse-column-filters';

@ApiTags('Locations')
@Controller(ADMIN_ROUTES.LOCATIONS)
@Permissions(PERMISSIONS.LOCATIONS_VIEW)
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(private readonly locationsService: LocationsService) {}

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
  @ApiOperation({ summary: 'List locations with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('statusFilter') statusFilter?: string,
    @Query('updatedAtFrom') updatedAtFrom?: string,
    @Query('updatedAtTo') updatedAtTo?: string,
    @Query('deletedAtFrom') deletedAtFrom?: string,
    @Query('deletedAtTo') deletedAtTo?: string,
    @Query() query?: Record<string, string>,
  ) {
    this.logger.log(`list page=${page ?? 1} limit=${limit ?? 10}`);
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const result = await this.locationsService.list({
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
      status: (status as 'active' | 'deleted' | 'all') ?? 'active',
      statusFilter: statusFilter != null ? Number(statusFilter) : undefined,
      updatedAtFrom: updatedAtFrom?.trim(),
      updatedAtTo: updatedAtTo?.trim(),
      deletedAtFrom: deletedAtFrom?.trim(),
      deletedAtTo: deletedAtTo?.trim(),
      filters: parseColumnFiltersFromQuery(query),
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const row = await this.locationsService.getById(Number(id));
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy địa điểm',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.LOCATIONS_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create new location' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: { name?: string; address?: string; mapUrl: string; status?: number },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.mapUrl?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'mapUrl là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const created = await this.locationsService.create({
      mapUrl: body.mapUrl.trim(),
      name: body.name?.trim() ?? null,
      address: body.address?.trim() ?? null,
      status: body.status ?? null,
    });
    const { statusCode, body: okBody } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  @Permissions(PERMISSIONS.LOCATIONS_UPDATE)
  @Put(':id')
  @ApiOperation({ summary: 'Update location by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: { name?: string; address?: string; mapUrl?: string; status?: number },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const updated = await this.locationsService.update(Number(id), {
      name: body?.name !== undefined ? (body.name?.trim() ?? null) : undefined,
      address:
        body?.address !== undefined
          ? (body.address?.trim() ?? null)
          : undefined,
      mapUrl: body?.mapUrl?.trim(),
      status: body?.status !== undefined ? (body.status ?? null) : undefined,
    });
    if (!updated) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy địa điểm',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
  }

  @Permissions(PERMISSIONS.LOCATIONS_MANAGE)
  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Hard delete location permanently' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.locationsService.hardDelete(Number(id));
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy địa điểm',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn địa điểm',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.LOCATIONS_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete location' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.locationsService.softDelete(Number(id));
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Địa điểm không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa địa điểm',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.LOCATIONS_RESTORE)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted location' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.locationsService.restore(Number(id));
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Địa điểm không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục địa điểm',
    });
    return res.status(statusCode).json(body);
  }
  @Post('bulk')
  @Permissions(PERMISSIONS.LOCATIONS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on dia diems' })
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
    const validActions = BULK_ACTIONS as ReadonlySet<string>;
    if (!action || !validActions.has(action)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Action khong hop le',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const result = await this.locationsService.bulk(action as BulkAction, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
