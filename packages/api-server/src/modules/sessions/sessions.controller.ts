/**
 * BaseSessionsController — HTTP admin dùng chung (@workspace/api-server).
 */
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { BaseSessionsService } from './sessions.service';
import type { BaseNotificationsService } from '../notifications/notifications.service';

import { BaseAdminHttpController } from '../../bases/base-admin-http.controller';
import { toEntityId } from '../../common/entity-id';
import {
  createSuccessResponse,
  createErrorResponse,
  Permissions,
} from '../../common';
import { APP_HEADERS, ADMIN_ROUTES, PERMISSIONS } from '../../config';
import { parseAdminListLimit } from '../../common';

export type ISessionsControllerService = Pick<
  BaseSessionsService,
  | 'list'
  | 'listAccountsWithSessionStatus'
  | 'create'
  | 'getOptions'
  | 'userHasSuperAdminRole'
  | 'revokeAllSessionsByUserId'
  | 'getById'
  | 'update'
  | 'softDelete'
  | 'bulk'
  | 'restore'
  | 'hardDelete'
>;
/** @deprecated Dùng `ISessionsControllerService`. */
export type ISessionsAdminControllerService = ISessionsControllerService;
/** @deprecated Dùng `ISessionsSocketGateway`. */
export type ISessionsAdminSocketGateway = ISessionsSocketGateway;

export interface ISessionsSocketGateway {
  emitSessionUpsert(session: unknown, fromStatus: string, toStatus: string): void;
  emitSessionRevoked(sessionId: string): void;
  emitSessionRemove(sessionId: string, status: string): void;
  emitNotificationToUser(
    userId: string | number,
    payload: {
      id: number;
      kind: 'info' | 'success' | 'warning' | 'system' | 'message' | 'announcement' | 'alert';
      title: string;
      description: string | null;
      toUserId: string;
      timestamp: number;
      read: boolean;
      actionUrl?: string | null;
    },
  ): void;
}

@Permissions(PERMISSIONS.SESSIONS_VIEW)
@Controller(ADMIN_ROUTES.SESSIONS)
export class BaseSessionsController extends BaseAdminHttpController {
  constructor(
    protected readonly service: ISessionsControllerService,
    protected readonly notificationsService: Pick<BaseNotificationsService, 'create' | 'getSuperAdminUserIds' | 'hasRecentLoginNotification' | 'hasRecentWelcomeBackNotification'>,
    protected readonly socketGateway: ISessionsSocketGateway,
  ) {
    super();
  }

  private buildErrorDetails(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack ?? null,
      };
    }
    return {
      message:
        typeof error === 'string'
          ? error
          : (() => {
              try {
                return JSON.stringify(error);
              } catch {
                return String(error);
              }
            })(),
      stack: null,
    };
  }

  private logApiWarning(
    api: string,
    message: string,
    error: unknown,
    metadata?: Record<string, unknown>,
  ): void {
    const details = {
      api,
      message,
      ...this.buildErrorDetails(error),
      metadata: metadata ?? null,
    };
    this.logger.warn(JSON.stringify(details));
  }

  protected unauthorized(
    res: Response,
    headerName: string = APP_HEADERS.USER_ID,
  ): Response {
    const { statusCode, body } = createErrorResponse(
      `Thiếu header ${headerName}`,
      {
        status: 401,
      },
    );
    return res.status(statusCode).json(body);
  }

  /**
   * GET /api/admin/sessions - List sessions
   */
  @Get()
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'deleted' | 'all',
    @Query() query?: Record<string, string>,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const filters: Record<string, string> = {};
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        const match = key.match(/^filter\[(.+)\]$/);
        if (match && value) filters[match[1]] = value;
      }
    }

    const result = await this.service.list({
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
      status: status === 'deleted' || status === 'all' ? status : 'active',
      filters: Object.keys(filters).length ? filters : undefined,
    });

    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  /**
   * GET /api/admin/sessions/accounts - Danh sách tài khoản (user) kèm trạng thái đăng nhập.
   * Trả về một dòng per user: id, email, name, isActive, hasActiveSession.
   */
  @Get('accounts')
  async listAccounts(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'deleted' | 'all',
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const result = await this.service.listAccountsWithSessionStatus({
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
      status: status ?? 'active',
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });

    return res.status(statusCode).json(body);
  }

  /**
   * POST /api/admin/sessions - Create session (sau khi login, từ admin create-session)
   * Body: { userId, userAgent?, ipAddress? }. Header: X-User-Id (người đang đăng nhập).
   */
  @Post()
  @Permissions(PERMISSIONS.SESSIONS_CREATE)
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      userId?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      userAgent?: string | null;
      ipAddress?: string | null;
    },
  ) {
    const actorId = this.getUserId(headers);
    if (!actorId) {
      return this.unauthorized(res, 'X-User-Id');
    }
    const userId = body?.userId?.trim();
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu userId trong body',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const session = await this.service.create({
      userId: toEntityId(userId),
      email: body?.email?.trim() || null,
      name: body?.name?.trim() || null,
      avatar: body?.image?.trim() || null,
      userAgent: body?.userAgent ?? null,
      ipAddress: body?.ipAddress ?? null,
    });
    if (!session) {
      const { statusCode, body: errBody } = createErrorResponse(
        'User không tồn tại',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    this.socketGateway.emitSessionUpsert(session, 'deleted', 'active');
    const loginLabel = session.userName || session.userEmail || session.userId;
    const loginDescription = `${loginLabel} đã đăng nhập vào hệ thống.`;
    try {
      const superAdminIds =
        await this.notificationsService.getSuperAdminUserIds();
      for (const superAdminId of superAdminIds) {
        if (superAdminId === session.userId) continue;
        const alreadySent =
          await this.notificationsService.hasRecentLoginNotification(
            superAdminId,
            loginDescription,
            60_000,
          );
        if (alreadySent) continue;
        const notif = await this.notificationsService.create({
          userId: superAdminId,
          kind: 'SYSTEM',
          title: 'Tài khoản đăng nhập',
          description: loginDescription,
          actionUrl: ADMIN_ROUTES.SESSIONS,
          metadata: { loggedInUserId: session.userId },
        });
        if (notif) {
          this.socketGateway.emitNotificationToUser(superAdminId, {
            id: notif.id,
            kind: 'info',
            title: notif.title,
            description: notif.description,
            toUserId: String(superAdminId),
            timestamp: notif.createdAt.getTime(),
            read: false,
            actionUrl: notif.actionUrl,
          });
        }
      }
    } catch (error) {
      this.logApiWarning(
        'POST /api/admin/sessions',
        'Bỏ qua lỗi gửi thông báo đăng nhập',
        error,
        {
          actorId,
          sessionUserId: session.userId,
        },
      );
    }
    if (toEntityId(actorId) === session.userId) {
      try {
        const alreadyWelcome =
          await this.notificationsService.hasRecentWelcomeBackNotification(
            session.userId,
            60_000,
          );
        if (!alreadyWelcome) {
          const welcomeNotif = await this.notificationsService.create({
            userId: session.userId,
            kind: 'SYSTEM',
            title: 'Chào mừng bạn trở lại',
            description: 'Chúc bạn làm việc hiệu quả.',
            actionUrl: ADMIN_ROUTES.DASHBOARD,
            metadata: { sessionId: session.id },
          });
          if (welcomeNotif) {
            this.socketGateway.emitNotificationToUser(session.userId, {
              id: welcomeNotif.id,
              kind: 'success',
              title: welcomeNotif.title,
              description: welcomeNotif.description,
              toUserId: String(session.userId),
              timestamp: welcomeNotif.createdAt.getTime(),
              read: false,
              actionUrl: welcomeNotif.actionUrl ?? undefined,
            });
          }
        }
      } catch (error) {
        this.logApiWarning(
          'POST /api/admin/sessions',
          'Bỏ qua lỗi gửi thông báo chào mừng',
          error,
          {
            actorId,
            sessionUserId: session.userId,
            sessionId: session.id,
          },
        );
      }
    }
    if (actorId && toEntityId(actorId) !== session.userId) {
    }
    const { statusCode, body: okBody } = createSuccessResponse(session, {
      message: 'Session created successfully',
      status: 201,
    });
    return res.status(statusCode).json(okBody);
  }

  /**
   * GET /api/admin/sessions/options - Column options
   */
  @Get('options')
  async options(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('column') column?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const options = await this.service.getOptions(
      column ?? '',
      search?.trim(),
      parseAdminListLimit(limit, 50),
    );
    const { statusCode, body } = createSuccessResponse(options);
    return res.status(statusCode).json(body);
  }

  /**
   * POST /api/admin/sessions/revoke-by-user/:userId - Cưỡng chế đăng xuất mọi phiên của user.
   * Không cho phép: (1) cưỡng chế đăng xuất chính mình, (2) cưỡng chế đăng xuất tài khoản Super Admin.
   */
  @Post('revoke-by-user/:userId')
  @Permissions(PERMISSIONS.SESSIONS_MANAGE)
  async revokeByUser(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('userId') targetUserId: string,
  ) {
    const actorId = this.getUserId(headers);
    if (!actorId) {
      return this.unauthorized(res);
    }
    const userId = targetUserId?.trim();
    if (!userId) {
      const { statusCode, body } = createErrorResponse('Thiếu userId', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
    if (userId === actorId) {
      const { statusCode, body } = createErrorResponse(
        'Không thể cưỡng chế đăng xuất chính mình',
        { status: 403 },
      );
      return res.status(statusCode).json(body);
    }
    const isSuperAdmin =
      await this.service.userHasSuperAdminRole(userId);
    if (isSuperAdmin) {
      const { statusCode, body } = createErrorResponse(
        'Không thể cưỡng chế đăng xuất tài khoản Super Admin',
        { status: 403 },
      );
      return res.status(statusCode).json(body);
    }
    const { count, sessionIds } =
      await this.service.revokeAllSessionsByUserId(String(userId));
    for (const sessionId of sessionIds) {
      this.socketGateway.emitSessionRevoked(String(sessionId));
      this.socketGateway.emitSessionRemove(String(sessionId), 'active');
    }
    const { statusCode, body } = createSuccessResponse(
      { count, message: `Đã thu hồi ${count} phiên đăng nhập` },
      { status: 200 },
    );
    return res.status(statusCode).json(body);
  }

  /**
   * GET /api/admin/sessions/:id
   */
  @Get(':id')
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const session = await this.service.getById(id);
    if (!session) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy session',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(session);
    return res.status(statusCode).json(body);
  }

  /**
   * PUT /api/admin/sessions/:id
   */
  @Put(':id')
  @Permissions(PERMISSIONS.SESSIONS_UPDATE)
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body()
    body: {
      isActive?: boolean;
      userAgent?: string | null;
      ipAddress?: string | null;
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res, 'X-User-Id');
    }

    const updated = await this.service.update(id, {
      isActive: body?.isActive,
      userAgent: body?.userAgent,
      ipAddress: body?.ipAddress,
    });
    if (!updated) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy session',
        {
          status: 404,
        },
      );
      return res.status(statusCode).json(errBody);
    }
    if (body?.isActive === false) {
      this.socketGateway.emitSessionRevoked(id);
      this.socketGateway.emitSessionUpsert(updated, 'active', 'deleted');
    }
    const { statusCode, body: okBody } = createSuccessResponse(updated);
    return res.status(statusCode).json(okBody);
  }

  /**
   * DELETE /api/admin/sessions/:id - Soft delete
   */
  @Delete(':id')
  @Permissions(PERMISSIONS.SESSIONS_DELETE)
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res, 'X-User-Id');
    }

    const ok = await this.service.softDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Session không tồn tại hoặc đã bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    this.socketGateway.emitSessionRevoked(id);
    const row = await this.service.getById(id);
    if (row) {
      this.socketGateway.emitSessionUpsert(row, 'active', 'deleted');
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa session',
    });
    return res.status(statusCode).json(body);
  }

  /**
   * POST /api/admin/sessions/bulk - phải khai báo trước :id/restore
   */
  @Post('bulk')
  @Permissions(PERMISSIONS.SESSIONS_MANAGE)
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: { action: 'delete' | 'restore' | 'hard-delete'; ids: string[] },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res, 'X-User-Id');
    }

    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !['delete', 'restore', 'hard-delete'].includes(action)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Action không hợp lệ',
        {
          status: 400,
        },
      );
      return res.status(statusCode).json(errBody);
    }

    const result = await this.service.bulk(action, ids);
    const affected = result.affectedCount ?? 0;
    if (action === 'delete' && affected > 0) {
      for (const sessionId of ids) {
        this.socketGateway.emitSessionRevoked(sessionId);
        this.socketGateway.emitSessionRemove(sessionId, 'active');
      }
    }
    if (action === 'restore' && affected > 0) {
      for (const sessionId of ids) {
        const row = await this.service.getById(sessionId);
        if (row) {
          this.socketGateway.emitSessionUpsert(row, 'deleted', 'active');
        }
      }
    }
    if (action === 'hard-delete' && affected > 0) {
      for (const sessionId of ids) {
        this.socketGateway.emitSessionRemove(sessionId, 'deleted');
      }
    }
    const { statusCode, body: okBody } = createSuccessResponse(
      { affectedCount: result.affectedCount ?? 0, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }

  /**
   * POST /api/admin/sessions/:id/restore
   */
  @Post(':id/restore')
  @Permissions(PERMISSIONS.SESSIONS_RESTORE)
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res, 'X-User-Id');
    }

    const ok = await this.service.restore(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Session không tồn tại hoặc chưa bị xóa',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const restored = await this.service.getById(id);
    if (restored) {
      this.socketGateway.emitSessionUpsert(restored, 'deleted', 'active');
    }
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã khôi phục session',
    });
    return res.status(statusCode).json(body);
  }

  /**
   * DELETE /api/admin/sessions/:id/hard-delete
   */
  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.SESSIONS_MANAGE)
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res, 'X-User-Id');
    }

    const ok = await this.service.hardDelete(id);
    if (!ok) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy session',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    this.socketGateway.emitSessionRemove(id, 'deleted');
    const { statusCode, body } = createSuccessResponse(undefined, {
      message: 'Đã xóa vĩnh viễn session',
    });
    return res.status(statusCode).json(body);
  }
}
