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
import {
  EventRegistrationAttendanceService,
  type ManualAttendanceAction,
} from './event-registration-attendance.service';
import { EventRegistrationsService } from './event-registrations.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { BULK_ACTIONS, type BulkAction } from '../common/bulk-actions';

@ApiTags('Event Registrations')
@Permissions(PERMISSIONS.EVENT_REGISTRATIONS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_REGISTRATIONS)
export class EventRegistrationsController {
  private readonly logger = new Logger(EventRegistrationsController.name);

  constructor(
    private readonly eventRegistrationsService: EventRegistrationsService,
    private readonly attendanceService: EventRegistrationAttendanceService,
  ) {}

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
    const trimmedEventId = eventId.trim();
    await this.eventRegistrationsService.syncEventRegistrationCount(
      trimmedEventId,
    );
    const result = await this.eventRegistrationsService.list({
      eventId: trimmedEventId,
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(String(limit), 10) || 10)),
      search: search?.trim(),
      status: status?.trim(),
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event registration by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const row = await this.eventRegistrationsService.getById(id);
    if (!row) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy đăng ký sự kiện',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(row);
    return res.status(statusCode).json(body);
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
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    if (!body?.eventId?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'eventId là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    if (!body?.email?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'email là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    if (!body?.fullName?.trim()) {
      const { statusCode, body: errBody } = createErrorResponse(
        'fullName là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const created = await this.eventRegistrationsService.create({
      eventId: body.eventId.trim(),
      email: body.email.trim(),
      fullName: body.fullName.trim(),
      phone: body.phone?.trim() ?? null,
    });
    const { statusCode, body: okBody } = createSuccessResponse(created, {
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  @Post(':id/attendance')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_UPDATE)
  @ApiOperation({
    summary:
      'Cập nhật trạng thái check-in/out thủ công (khi socket lỗi hoặc điều chỉnh)',
  })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async setAttendance(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: { action?: ManualAttendanceAction },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const action = body?.action;
    const allowed: ManualAttendanceAction[] = [
      'checkin',
      'checkout',
      'reset-checkin',
      'reset-checkout',
      'reset-all',
    ];
    if (!action || !allowed.includes(action)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'action phải là checkin | checkout | reset-checkin | reset-checkout | reset-all',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const updated = await this.attendanceService.applyManual(id, action);
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
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
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const updated = await this.eventRegistrationsService.update(id, {
      email: body?.email?.trim(),
      fullName: body?.fullName?.trim(),
      phone:
        body?.phone !== undefined ? (body.phone?.trim() ?? null) : undefined,
      status: body?.status,
      faceVerified: body?.faceVerified,
      attendanceStatus: body?.attendanceStatus,
      checkinMethod: body?.checkinMethod,
    });
    if (!updated) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy đăng ký sự kiện',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_HARD_DELETE)
  @ApiOperation({ summary: 'Hard delete event registration permanently' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.eventRegistrationsService.hardDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy đăng ký sự kiện',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn đăng ký sự kiện',
    });
    return res.status(statusCode).json(body);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_DELETE)
  @ApiOperation({ summary: 'Soft delete event registration' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.eventRegistrationsService.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Đăng ký không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa đăng ký sự kiện',
    });
    return res.status(statusCode).json(body);
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_RESTORE)
  @ApiOperation({ summary: 'Restore soft-deleted event registration' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ok = await this.eventRegistrationsService.restore(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Đăng ký không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục đăng ký sự kiện',
    });
    return res.status(statusCode).json(body);
  }
  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_REGISTRATIONS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on luot dang kys' })
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
    const result = await this.eventRegistrationsService.bulk(
      action as BulkAction,
      ids,
    );
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
