/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * BaseNotificationsController — HTTP admin notifications (@workspace/api-server).
 */
import type { Response } from 'express';
import { toEntityId } from '../../entity-id';
import type {
  BaseNotificationsService,
  NotificationsListResult,
  UnreadCountsResult,
  AdminTableResult,
} from './notifications.service';
import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import { Permissions, createSuccessResponse, createErrorResponse } from '../../index';
import { APP_HEADERS, ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import { BaseAdminHttpController } from '../../crud/base-admin-http.controller';

export type INotificationsControllerService = Pick<
  BaseNotificationsService,
  | 'listForAdminTable'
  | 'getColumnOptions'
  | 'list'
  | 'getUnreadCounts'
  | 'markRead'
  | 'deleteOne'
  | 'markAllAsRead'
  | 'bulkDelete'
  | 'bulkMarkReadUnread'
>;
/** @deprecated Dùng `INotificationsControllerService`. */
export type INotificationsAdminControllerService = INotificationsControllerService;

@Permissions(PERMISSIONS.NOTIFICATIONS_VIEW)
@Controller(ADMIN_ROUTES.BASE)
export class BaseNotificationsController extends BaseAdminHttpController {
  constructor(
    protected readonly service: INotificationsControllerService,
  ) {
    super();
  }

  @Get('notifications/table')
  async listTable(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('search') searchParam?: string,
    @Query('filter[userEmail]') filterUserEmail?: string,
    @Query('filter[userName]') filterUserName?: string,
    @Query('filter[kind]') filterKind?: string,
    @Query('filter[isRead]') filterIsRead?: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;
    const viewAll =
      headers[APP_HEADERS.VIEW_ALL.toLowerCase()]?.toLowerCase() === 'true';

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return this.sendError(
        res,
        'page và limit không hợp lệ (page >= 1, limit 1-100)',
        400,
      );
    }

    const filters: Record<string, string> = {};
    if (filterUserEmail?.trim()) filters.userEmail = filterUserEmail.trim();
    if (filterUserName?.trim()) filters.userName = filterUserName.trim();
    if (filterKind?.trim()) filters.kind = filterKind.trim();
    if (filterIsRead?.trim()) filters.isRead = filterIsRead.trim();

    try {
      const result: AdminTableResult =
        await this.service.listForAdminTable({
          userId: toEntityId(userId),
          viewAll,
          page,
          limit,
          search: searchParam?.trim() || undefined,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        });
      return this.sendSuccess(
        res,
        { data: result.data, pagination: result.pagination },
        { message: 'Lấy danh sách thông báo thành công' },
      );
    } catch (error) {
      this.logger.error(error);
      return this.sendError(res, 'Không thể tải danh sách thông báo', 500);
    }
  }

  /**
   * GET /api/admin/notifications/options
   * Options cho filter cột (userEmail, userName). Header: X-User-Id.
   */
  @Get('notifications/options')
  async options(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('column') columnParam?: string,
    @Query('limit') limitParam?: string,
    @Query('search') searchParam?: string,
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }

    const column = columnParam?.trim();
    if (column !== 'userEmail' && column !== 'userName') {
      const { statusCode, body } = createErrorResponse(
        'column phải là userEmail hoặc userName',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    if (isNaN(limit) || limit < 1 || limit > 100) {
      const { statusCode, body } = createErrorResponse(
        'limit phải từ 1 đến 100',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }

    try {
      const options = await this.service.getColumnOptions(
        column,
        searchParam?.trim(),
        limit,
      );
      const { statusCode, body } = createSuccessResponse(options, {
        message: 'Lấy options thành công',
      });
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body } = createErrorResponse(
        'Không thể tải options',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  /**
   * GET /api/admin/notifications
   * Danh sách thông báo cho chuông (Notification bell).
   * Header: X-User-Id (bắt buộc).
   */
  @Get('notifications')
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('limit') limitParam?: string,
    @Query('offset') offsetParam?: string,
    @Query('unreadOnly') unreadOnlyParam?: string,
    @Query('mine') mineParam?: string,
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        {
          status: 401,
        },
      );
      return res.status(statusCode).json(body);
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    if (isNaN(limit) || limit < 1 || limit > 100) {
      const { statusCode, body } = createErrorResponse(
        'Limit phải từ 1 đến 100',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }
    if (isNaN(offset) || offset < 0) {
      const { statusCode, body } = createErrorResponse('Offset phải không âm', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }

    try {
      const result: NotificationsListResult =
        await this.service.list({
          userId: toEntityId(userId),
          limit,
          offset,
          unreadOnly: unreadOnlyParam === 'true',
          mine: mineParam !== 'false',
        });
      const { statusCode, body } = createSuccessResponse(result, {
        message: 'Lấy danh sách thông báo thành công',
      });
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body } = createErrorResponse(
        'Không thể tải danh sách thông báo',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  /**
   * GET /api/admin/unread-counts
   * Số lượng chưa đọc (chuông + badge). Header: X-User-Id (bắt buộc).
   */
  @Get('unread-counts')
  async unreadCounts(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        {
          status: 401,
        },
      );
      return res.status(statusCode).json(body);
    }

    try {
      const result: UnreadCountsResult =
        await this.service.getUnreadCounts(userId);
      const { statusCode, body } = createSuccessResponse(result, {
        message: 'Lấy số lượng chưa đọc thành công',
      });
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body } = createErrorResponse(
        'Không thể tải số lượng chưa đọc',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  /**
   * PATCH /api/admin/notifications/:id
   * Đánh dấu một thông báo đã đọc/chưa đọc. Body: { isRead: boolean }. Header: X-User-Id.
   */
  @Patch('notifications/:id')
  @Permissions(PERMISSIONS.NOTIFICATIONS_MANAGE)
  async markRead(
    @Res() res: Response,
    @Param('id') id: string,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { isRead?: boolean },
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }

    const isRead = body?.isRead !== false;

    try {
      const updated = await this.service.markRead(
        id,
        userId,
        isRead,
      );
      if (!updated) {
        const { statusCode, body: errBody } = createErrorResponse(
          'Không tìm thấy thông báo hoặc không có quyền',
          { status: 404 },
        );
        return res.status(statusCode).json(errBody);
      }
      const { statusCode, body: okBody } = createSuccessResponse(updated, {
        message: 'Cập nhật trạng thái đọc thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể cập nhật thông báo',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  /**
   * DELETE /api/admin/notifications/:id
   * Xóa một thông báo. Chỉ xóa được nếu thuộc user (X-User-Id). Trả 204 khi thành công, 404 nếu không tìm thấy hoặc không có quyền.
   */
  @Delete('notifications/:id')
  @Permissions(PERMISSIONS.NOTIFICATIONS_MANAGE)
  async deleteOne(
    @Res() res: Response,
    @Param('id') id: string,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    const userId = this.getUserId(headers);

    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const deleted = await this.service.deleteOne(id, userId);
      if (!deleted) {
        const { statusCode, body: errBody = {} } = createErrorResponse(
          'Không tìm thấy thông báo hoặc không có quyền xóa',
          { status: 404 },
        );
        return res.status(statusCode).json(errBody);
      }
      return res.status(204).send();
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể xóa thông báo',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  /**
   * POST /api/admin/notifications/mark-all-read
   * Đánh dấu tất cả thông báo của user là đã đọc. Header: X-User-Id (hoặc body.userId).
   */
  @Post('notifications/mark-all-read')
  @Permissions(PERMISSIONS.NOTIFICATIONS_MANAGE)
  async markAllAsRead(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { userId?: string },
  ) {
    const userId = this.getUserId(headers) || body?.userId?.trim() || null;

    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        `Thiếu ${APP_HEADERS.USER_ID} (header hoặc body.userId)`,
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const result: { count: number } =
        await this.service.markAllAsRead(userId);
      const { statusCode, body: okBody } = createSuccessResponse(result, {
        message: 'Đánh dấu tất cả đã đọc thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể đánh dấu tất cả đã đọc',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }

  /**
   * POST /api/admin/notifications/bulk
   * Thực hiện hành động hàng loạt (xóa, đánh dấu đã đọc/chưa đọc).
   * Body: { action: 'delete' | 'mark-read' | 'mark-unread', ids: string[] }.
   * Header: X-User-Id.
   */
  @Post('notifications/bulk')
  @Permissions(PERMISSIONS.NOTIFICATIONS_MANAGE)
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      action?: 'delete' | 'mark-read' | 'mark-unread';
      ids?: string[];
    },
  ) {
    const userId = this.getUserId(headers);
    const action = body?.action;
    const ids = body?.ids ?? [];

    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }

    if (
      !action ||
      !['delete', 'mark-read', 'mark-unread'].includes(action) ||
      !Array.isArray(ids) ||
      ids.length === 0
    ) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Action hoặc ids không hợp lệ',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      let result: { count: number; alreadyAffected?: number };
      if (action === 'delete') {
        result = await this.service.bulkDelete(userId, ids);
      } else {
        result = await this.service.bulkMarkReadUnread(
          userId,
          action,
          ids,
        );
      }

      const { statusCode, body: okBody } = createSuccessResponse(result, {
        message: 'Thực hiện hành động hàng loạt thành công',
      });
      return res.status(statusCode).json(okBody);
    } catch (error) {
      this.logger.error(error);
      const { statusCode, body: errBody } = createErrorResponse(
        'Không thể thực hiện hành động hàng loạt',
        { status: 500 },
      );
      return res.status(statusCode).json(errBody);
    }
  }
}
