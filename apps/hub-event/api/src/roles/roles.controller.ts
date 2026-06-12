/** AUTO-GENERATED — chạy pnpm api:generate:checkin. Không sửa tay; override trong api.app.config.json → native.* */
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
import type { Response } from 'express';
import { RolesService } from './roles.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction } from '../common/bulk-actions';
import { buildAdminListCrudParams } from '../common/admin-list-params';

@ApiTags('Roles')
@Controller(ADMIN_ROUTES.ROLES)
@Permissions(PERMISSIONS.ROLES_VIEW)
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

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
  @ApiOperation({ summary: 'List vai trò' })
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
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const result = await this.rolesService.list(
      buildAdminListCrudParams({
        page,
        limit,
        search,
        status,
        statusFilter,
        updatedAtFrom,
        updatedAtTo,
        deletedAtFrom,
        deletedAtTo,
        query,
      }),
    );
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get('options')
  @ApiOperation({ summary: 'Get vai trò options for dropdowns' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async options(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('column') column?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const options = await this.rolesService.getOptions(
      column?.trim() || 'name',
      search,
      Math.min(1000, Math.max(1, parseInt(String(limit), 10) || 50)),
    );
    const { statusCode, body } = createSuccessResponse(options);
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vai trò by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const row = await this.rolesService.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy vai trò', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.ROLES_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create vai trò' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    if (!body?.name?.toString().trim()) {
      const { statusCode, body: err } = createErrorResponse(
        'name là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(err);
    }
    const created = await this.rolesService.create(body);
    const { statusCode, body: ok } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(ok);
  }

  @Permissions(PERMISSIONS.ROLES_UPDATE)
  @Put(':id')
  @ApiOperation({ summary: 'Update vai trò' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const updated = await this.rolesService.update(id, body);
    if (!updated) {
      const { statusCode, body: err } = createErrorResponse(
        'Không tìm thấy vai trò',
        { status: 404 },
      );
      return res.status(statusCode).json(err);
    }
    const { statusCode, body: ok } = createSuccessResponse(updated);
    return res.status(statusCode).json(ok);
  }

  @Permissions(PERMISSIONS.ROLES_MANAGE)
  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Hard delete vai trò' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.rolesService.hardDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy vai trò', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn vai trò',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.ROLES_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete vai trò' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.rolesService.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'vai trò không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vai trò',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.ROLES_RESTORE)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore vai trò' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.rolesService.restore(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'vai trò không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục vai trò',
    });
    return res.status(statusCode).json(body);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.ROLES_MANAGE)
  @ApiOperation({ summary: 'Bulk action on vai tro' })
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
    const result = await this.rolesService.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.success, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
