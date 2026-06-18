/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * BaseEventSpeakersController — HTTP admin event speakers (@workspace/api-server).
 */
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
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseAdminHttpController } from '../../crud/base-admin-http.controller';
import { Permissions, parseAdminListLimit, isBulkAction } from '../../index';
import { ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import type { BaseEventSpeakersService } from './event-speakers.service';

export type IEventSpeakersControllerService = Pick<
  BaseEventSpeakersService,
  | 'list'
  | 'getById'
  | 'create'
  | 'update'
  | 'delete'
  | 'bulk'
>;
/** @deprecated Dùng `IEventSpeakersControllerService`. */
export type IEventSpeakersAdminControllerService = IEventSpeakersControllerService;

@ApiTags('Event Speakers')
@Permissions(PERMISSIONS.EVENT_SPEAKERS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_SPEAKERS)
export class BaseEventSpeakersController extends BaseAdminHttpController {
  constructor(
    protected readonly service: IEventSpeakersControllerService,
  ) {
    super();
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
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;
    if (!eventId?.trim()) {
      return this.sendError(res, 'eventId là bắt buộc', 400);
    }

    const result = await this.service.list({
      eventId: eventId.trim(),
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
    });
    return this.sendSuccess(res, {
      data: result.data,
      pagination: result.pagination,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event speaker by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const row = await this.service.getById(id);
    if (!row) return this.sendNotFound(res, 'Không tìm thấy event speaker');
    return this.sendSuccess(res, row);
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
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;
    if (!body?.eventId?.trim()) {
      return this.sendError(res, 'eventId là bắt buộc', 400);
    }
    if (!body?.speakerId) {
      return this.sendError(res, 'speakerId là bắt buộc', 400);
    }

    const created = await this.service.create({
      eventId: body.eventId.trim(),
      speakerId: body.speakerId,
      sortOrder: body.sortOrder,
      role: body.role?.trim() ?? null,
      presentationTitle: body.presentationTitle?.trim() ?? null,
      startTime: body.startTime ?? null,
      endTime: body.endTime ?? null,
      duration: body.duration ?? null,
    });
    return this.sendSuccess(res, created, { status: 201 });
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
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const updated = await this.service.update(id, {
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
    if (!updated) return this.sendNotFound(res, 'Không tìm thấy event speaker');
    return this.sendSuccess(res, updated);
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
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.delete(id),
      'Đã xóa event speaker',
      'Không tìm thấy event speaker',
    );
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_SPEAKERS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on event speakers' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({ description: 'Bulk action with ids' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { action?: string; ids?: string[] },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !isBulkAction(action)) {
      return this.sendError(res, 'Action không hợp lệ', 400);
    }

    const result = await this.service.bulk(action, ids);
    return this.sendSuccess(
      res,
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
  }
}
