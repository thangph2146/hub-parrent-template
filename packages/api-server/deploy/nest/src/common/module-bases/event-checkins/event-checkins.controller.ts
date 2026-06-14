/**
 * BaseEventCheckinsController — HTTP admin event checkins (@workspace/api-server).
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
import type {
  BaseEventCheckinsService,
  ListEventCheckinsParams,
} from './event-checkins.service';

export type IEventCheckinsControllerService = Pick<
  BaseEventCheckinsService,
  | 'list'
  | 'getById'
  | 'create'
  | 'update'
  | 'hardDelete'
  | 'softDelete'
  | 'restore'
  | 'bulk'
>;
/** @deprecated Dùng `IEventCheckinsControllerService`. */
export type IEventCheckinsAdminControllerService = IEventCheckinsControllerService;

@ApiTags('Event Checkins')
@Permissions(PERMISSIONS.EVENT_CHECKINS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_CHECKINS)
export class BaseEventCheckinsController extends BaseAdminHttpController {
  constructor(
    protected readonly service: IEventCheckinsControllerService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'List event checkins with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('eventId') eventId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
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
      search: search?.trim(),
      status: (status as ListEventCheckinsParams['status']) ?? 'active',
    });
    return this.sendSuccess(res, {
      data: result.data,
      pagination: result.pagination,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event checkin by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const row = await this.service.getById(id);
    if (!row) return this.sendNotFound(res, 'Không tìm thấy check-in');
    return this.sendSuccess(res, row);
  }

  @Post()
  @Permissions(PERMISSIONS.EVENT_CHECKINS_CREATE)
  @ApiOperation({ summary: 'Create new event checkin' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      eventId: string;
      email: string;
      fullName: string;
      registrationId?: string;
    },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;
    if (!body?.eventId?.trim()) {
      return this.sendError(res, 'eventId là bắt buộc', 400);
    }
    if (!body?.email?.trim()) {
      return this.sendError(res, 'email là bắt buộc', 400);
    }
    if (!body?.fullName?.trim()) {
      return this.sendError(res, 'fullName là bắt buộc', 400);
    }

    const created = await this.service.create({
      eventId: body.eventId.trim(),
      email: body.email.trim(),
      fullName: body.fullName.trim(),
      registrationId: body.registrationId?.trim() ?? null,
      checkinTime: new Date(),
    });
    return this.sendSuccess(res, created, { status: 201 });
  }

  @Put(':id')
  @Permissions(PERMISSIONS.EVENT_CHECKINS_UPDATE)
  @ApiOperation({ summary: 'Update event checkin by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      email?: string;
      fullName?: string;
      checkinType?: number;
      faceVerified?: boolean;
      status?: number;
    },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const updated = await this.service.update(id, {
      email: body?.email?.trim(),
      fullName: body?.fullName?.trim(),
      checkinType: body?.checkinType,
      faceVerified: body?.faceVerified,
      status: body?.status,
    });
    if (!updated) return this.sendNotFound(res, 'Không tìm thấy check-in');
    return this.sendSuccess(res, updated);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.EVENT_CHECKINS_HARD_DELETE)
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.hardDelete(id),
      'Đã xóa vĩnh viễn check-in',
      'Không tìm thấy check-in',
    );
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.EVENT_CHECKINS_DELETE)
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.softDelete(id),
      'Đã xóa check-in',
      'Check-in không tồn tại hoặc đã bị xóa',
    );
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.EVENT_CHECKINS_RESTORE)
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.restore(id),
      'Đã khôi phục check-in',
      'Check-in không tồn tại hoặc chưa bị xóa',
    );
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_CHECKINS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on event checkins' })
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
