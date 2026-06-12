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
import { SpeakersService } from './speakers.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction } from '../common/bulk-actions';
import { buildAdminListCrudParams } from '../common/admin-list-params';

@ApiTags('Speakers')
@Controller(ADMIN_ROUTES.SPEAKERS)
@Permissions(PERMISSIONS.SPEAKERS_VIEW)
export class SpeakersController {
  private readonly logger = new Logger(SpeakersController.name);

  constructor(private readonly speakersService: SpeakersService) {}

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
  @ApiOperation({ summary: 'List diễn giả' })
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
    const result = await this.speakersService.list(
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

  @Get(':id')
  @ApiOperation({ summary: 'Get diễn giả by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const row = await this.speakersService.getById(Number(id));
    if (!row) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy diễn giả', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.SPEAKERS_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create diễn giả' })
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
    const created = await this.speakersService.create(body);
    const { statusCode, body: ok } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(ok);
  }

  @Permissions(PERMISSIONS.SPEAKERS_UPDATE)
  @Put(':id')
  @ApiOperation({ summary: 'Update diễn giả' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const updated = await this.speakersService.update(Number(id), body);
    if (!updated) {
      const { statusCode, body: err } = createErrorResponse(
        'Không tìm thấy diễn giả',
        { status: 404 },
      );
      return res.status(statusCode).json(err);
    }
    const { statusCode, body: ok } = createSuccessResponse(updated);
    return res.status(statusCode).json(ok);
  }

  @Permissions(PERMISSIONS.SPEAKERS_MANAGE)
  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Hard delete diễn giả' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.speakersService.hardDelete(Number(id));
    if (!ok) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy diễn giả', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn diễn giả',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.SPEAKERS_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete diễn giả' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.speakersService.softDelete(Number(id));
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'diễn giả không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa diễn giả',
    });
    return res.status(statusCode).json(body);
  }

  @Permissions(PERMISSIONS.SPEAKERS_RESTORE)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore diễn giả' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    if (!this.getUserId(headers)) return this.unauthorized(res);
    const ok = await this.speakersService.restore(Number(id));
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'diễn giả không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục diễn giả',
    });
    return res.status(statusCode).json(body);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.SPEAKERS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on diễn giả' })
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
    const result = await this.speakersService.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.success, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
