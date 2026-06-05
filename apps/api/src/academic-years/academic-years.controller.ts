import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiQuery,
  ApiParam,
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
} from '@nestjs/common';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { BULK_ACTIONS, type BulkAction } from '../common/bulk-actions';
import type { Response } from 'express';
import { AcademicYearsService } from './academic-years.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { parseAdminListLimit } from '../common/parse-list-query';

@ApiTags('AcademicYears')
@Controller(ADMIN_ROUTES.ACADEMIC_YEARS)
@Permissions(PERMISSIONS.ACADEMIC_YEARS_VIEW)
export class AcademicYearsController {
  private readonly bulkActions: ReadonlySet<BulkAction> = BULK_ACTIONS;

  constructor(private readonly service: AcademicYearsService) {}

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

  private isBulkAction(action: string): action is BulkAction {
    return this.bulkActions.has(action as BulkAction);
  }

  @Get()
  @ApiOperation({ summary: 'List academic years with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'deleted', 'all'],
  })
  @ApiResponse({ status: 200, description: 'Academic years retrieved' })
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
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const result = await this.service.list({
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
      status: (status as 'active' | 'deleted' | 'all') ?? 'active',
      statusFilter: statusFilter != null ? Number(statusFilter) : undefined,
      updatedAtFrom: updatedAtFrom?.trim(),
      updatedAtTo: updatedAtTo?.trim(),
      deletedAtFrom: deletedAtFrom?.trim(),
      deletedAtTo: deletedAtTo?.trim(),
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get academic year by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Academic year found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const row = await this.service.getById(Number(id));
    if (!row) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.ACADEMIC_YEARS_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create academic year' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({ description: 'Academic year data', required: true })
  @ApiResponse({ status: 201, description: 'Created' })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { name?: string; startDate?: string; endDate?: string },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.name?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'name là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const created = await this.service.create({
      name: body.name.trim(),
      startDate: body.startDate?.trim() ?? null,
      endDate: body.endDate?.trim() ?? null,
    });
    const { statusCode, body: okBody } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  @Permissions(PERMISSIONS.ACADEMIC_YEARS_UPDATE)
  @Put(':id')
  @ApiOperation({ summary: 'Update academic year' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ description: 'Updated data' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      startDate?: string | null;
      endDate?: string | null;
      status?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const updated = await this.service.update(Number(id), {
      name: body?.name?.trim(),
      startDate: body?.startDate,
      endDate: body?.endDate,
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

  @Permissions(PERMISSIONS.ACADEMIC_YEARS_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete academic year' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Not found or already deleted' })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.service.softDelete(Number(id));
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

  @Permissions(PERMISSIONS.ACADEMIC_YEARS_RESTORE)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted academic year' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Restored' })
  @ApiResponse({ status: 404, description: 'Not found or not deleted' })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.service.restore(Number(id));
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

  @Permissions(PERMISSIONS.ACADEMIC_YEARS_MANAGE)
  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Permanently delete academic year' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Hard deleted' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.service.hardDelete(Number(id));
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
  @Permissions(PERMISSIONS.ACADEMIC_YEARS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on academic years' })
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
    if (!userId) return this.unauthorized(res);
    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !this.isBulkAction(action)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Action không hợp lệ',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const result = await this.service.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
