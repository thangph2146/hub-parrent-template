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
import { EventSpeakersService } from './event-speakers.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { isBulkAction, type BulkAction } from '../common/bulk-actions';
import { parseAdminListLimit } from '../common/parse-list-query';

@ApiTags('Event Speakers')
@Permissions(PERMISSIONS.EVENT_SPEAKERS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_SPEAKERS)
export class EventSpeakersController {
  private readonly logger = new Logger(EventSpeakersController.name);

  constructor(private readonly eventSpeakersService: EventSpeakersService) {}

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
  @ApiOperation({ summary: 'List event speakers by eventId with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('eventId') eventId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.logger.log(
      `list eventId=${eventId} page=${page ?? 1} limit=${limit ?? 10}`,
    );
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!eventId?.trim()) {
      const { statusCode, body } = createErrorResponse('eventId là bắt buộc', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
    const result = await this.eventSpeakersService.list({
      eventId: eventId.trim(),
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event speaker by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const row = await this.eventSpeakersService.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy event speaker',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
  }

  @Post()
  @Permissions(PERMISSIONS.EVENT_SPEAKERS_CREATE)
  @ApiOperation({ summary: 'Create new event speaker' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      eventId: string;
      speakerId: number;
      sortOrder?: number;
      role?: string;
      presentationTitle?: string;
      startTime?: string;
      endTime?: string;
      duration?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.eventId?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'eventId là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    if (!body?.speakerId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'speakerId là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const created = await this.eventSpeakersService.create({
      eventId: body.eventId.trim(),
      speakerId: body.speakerId,
      sortOrder: body.sortOrder,
      role: body.role?.trim() ?? null,
      presentationTitle: body.presentationTitle?.trim() ?? null,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      duration: body.duration ?? null,
    });
    const { statusCode, body: okBody } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.EVENT_SPEAKERS_UPDATE)
  @ApiOperation({ summary: 'Update event speaker by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      speakerId?: number;
      sortOrder?: number;
      role?: string;
      presentationTitle?: string;
      startTime?: string;
      endTime?: string;
      duration?: number;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const updated = await this.eventSpeakersService.update(id, {
      speakerId: body?.speakerId,
      sortOrder: body?.sortOrder,
      role: body?.role !== undefined ? (body.role?.trim() ?? null) : undefined,
      presentationTitle:
        body?.presentationTitle !== undefined
          ? (body.presentationTitle?.trim() ?? null)
          : undefined,
      startTime:
        body?.startTime !== undefined ? (body.startTime ?? null) : undefined,
      endTime: body?.endTime !== undefined ? (body.endTime ?? null) : undefined,
      duration: body?.duration,
    });
    if (!updated) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy event speaker',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.EVENT_SPEAKERS_DELETE)
  @ApiOperation({ summary: 'Delete event speaker' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async delete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.eventSpeakersService.delete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy event speaker',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa event speaker',
    });
    return res.status(statusCode).json(body);
  }
  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_SPEAKERS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on gan dien gias' })
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
    const result = await this.eventSpeakersService.bulk(action, ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
