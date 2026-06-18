/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * BaseEventRegistrationsController — HTTP admin event registrations.
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
import type { BaseEventRegistrationsService } from './event-registrations.service';
import type { ManualAttendanceAction } from './event-registration-attendance.types';
import type { BaseEventRegistrationAttendanceService } from './event-registration-attendance.service';

export type IEventRegistrationsControllerService = Pick<
  BaseEventRegistrationsService,
  | 'syncEventRegistrationCount'
  | 'list'
  | 'getById'
  | 'create'
  | 'update'
  | 'hardDelete'
  | 'softDelete'
  | 'restore'
  | 'bulk'
>;
/** @deprecated Dùng `IEventRegistrationsControllerService`. */
export type IEventRegistrationsAdminControllerService = IEventRegistrationsControllerService;

@ApiTags('Event Registrations')
@Permissions(PERMISSIONS.EVENT_REGISTRATIONS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_REGISTRATIONS)
export class BaseEventRegistrationsController extends BaseAdminHttpController {
  constructor(
    protected readonly service: IEventRegistrationsControllerService,
    protected readonly attendanceService: BaseEventRegistrationAttendanceService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'List event registrations with pagination' })
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

    const trimmedEventId = eventId.trim();
    await this.service.syncEventRegistrationCount(trimmedEventId);
    const result = await this.service.list({
      eventId: trimmedEventId,
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
      status: status?.trim(),
    });
    return this.sendSuccess(res, {
      data: result.data,
      pagination: result.pagination,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event registration by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const row = await this.service.getById(id);
    if (!row) return this.sendNotFound(res, 'Không tìm thấy đăng ký sự kiện');
    return this.sendSuccess(res, row);
  }

  @Post()
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_CREATE)
  @ApiOperation({ summary: 'Create new event registration' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      eventId: string;
      email: string;
      fullName: string;
      phone?: string;
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
      phone: body.phone?.trim() ?? null,
    });
    return this.sendSuccess(res, created, { status: 201 });
  }

  @Post(':id/attendance')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_UPDATE)
  @ApiOperation({ summary: 'Cập nhật trạng thái check-in/out thủ công' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async setAttendance(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: { action?: ManualAttendanceAction },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const action = body?.action;
    const allowed: ManualAttendanceAction[] = [
      'checkin',
      'checkout',
      'reset-checkin',
      'reset-checkout',
      'reset-all',
    ];
    if (!action || !allowed.includes(action)) {
      return this.sendError(
        res,
        'action phải là checkin | checkout | reset-checkin | reset-checkout | reset-all',
        400,
      );
    }

    const updated = await this.attendanceService.applyManual(id, action);
    return this.sendSuccess(res, updated);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_UPDATE)
  @ApiOperation({ summary: 'Update event registration by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      email?: string;
      fullName?: string;
      phone?: string;
      status?: number;
      faceVerified?: boolean;
      attendanceStatus?: number;
      checkinMethod?: number;
    },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const updated = await this.service.update(id, {
      email: body?.email?.trim(),
      fullName: body?.fullName?.trim(),
      phone:
        body?.phone !== undefined ? (body.phone?.trim() ?? null) : undefined,
      status: body?.status,
      faceVerified: body?.faceVerified,
      attendanceStatus: body?.attendanceStatus,
      checkinMethod: body?.checkinMethod,
    });
    if (!updated) return this.sendNotFound(res, 'Không tìm thấy đăng ký sự kiện');
    return this.sendSuccess(res, updated);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_HARD_DELETE)
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.hardDelete(id),
      'Đã xóa vĩnh viễn đăng ký sự kiện',
      'Không tìm thấy đăng ký sự kiện',
    );
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_DELETE)
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.softDelete(id),
      'Đã xóa đăng ký sự kiện',
      'Đăng ký không tồn tại hoặc đã bị xóa',
    );
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_RESTORE)
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.restore(id),
      'Đã khôi phục đăng ký sự kiện',
      'Đăng ký không tồn tại hoặc chưa bị xóa',
    );
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on event registrations' })
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
