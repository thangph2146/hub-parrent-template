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
import { FaceDataService } from './face-data.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction, type BulkAction } from '../common/bulk-actions';
import { toEntityId } from '../common/entity-id';
import {
  buildAdminListCrudParams,
  bulkAffectedCount,
} from '../common/admin-list-params';

@ApiTags('FaceData')
@Permissions(PERMISSIONS.FACE_DATA_VIEW)
@Controller(ADMIN_ROUTES.FACE_DATA)
export class FaceDataController {
  private readonly logger = new Logger(FaceDataController.name);

  constructor(private readonly faceDataService: FaceDataService) {}

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
    this.logger.log(`list page=${page ?? 1} limit=${limit ?? 10}`);
    const authUserId = this.getUserId(headers);
    if (!authUserId) return this.unauthorized(res);
    const result = await this.faceDataService.list(
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
    const row = await this.faceDataService.getById(id);
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
    const created = await this.faceDataService.create({
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
    const updated = await this.faceDataService.update(id, {
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
    const ok = await this.faceDataService.hardDelete(id);
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
    const ok = await this.faceDataService.softDelete(id);
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
    const ok = await this.faceDataService.restore(id);
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
    const result = await this.faceDataService.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: bulkAffectedCount(result), message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
