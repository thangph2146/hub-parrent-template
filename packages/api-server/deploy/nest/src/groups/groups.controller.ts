import { toEntityId } from '../common';
/**
 * Groups Admin API Controller.
 * POST /groups — tạo nhóm. GET /groups — danh sách. GET /groups/:id — chi tiết.
 * DELETE /groups/:id — xóa mềm. DELETE /groups/:id/hard-delete — xóa vĩnh viễn. POST /groups/:id/restore — khôi phục.
 * Header: X-User-Id.
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { GroupsService } from './groups.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationKind } from '../entities/notification.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { createSuccessResponse, createErrorResponse } from '../common';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common';
import { RESOURCES, ACTIONS, PERMISSIONS } from '../config/permissions';
import { parseAdminListLimit } from '../common';

@Permissions(PERMISSIONS.GROUPS_VIEW)
@Controller(ADMIN_ROUTES.GROUPS)
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);

  constructor(
    private readonly groupsService: GroupsService,
    private readonly notificationsService: NotificationsService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private logActivity(
    userId: string,
    title: string,
    description: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>,
  ): void {
    void this.notificationsService
      .create({
        userId: toEntityId(userId),
        kind: NotificationKind.SYSTEM,
        title,
        description,
        actionUrl: actionUrl ?? null,
        metadata: metadata ?? undefined,
      })
      .catch(() => {});
  }

  private getUserId(
    headers: Record<string, string | undefined>,
  ): string | null {
    const id = headers[APP_HEADERS.USER_ID]?.trim();
    return id || null;
  }

  private unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse(
      `Thiếu header ${APP_HEADERS.USER_ID}`,
      { status: 401 },
    );
    return res.status(statusCode).json(body);
  }

  @Get()
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const result = await this.groupsService.list(userId, {
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 50),
      search: search?.trim(),
      includeDeleted: includeDeleted === 'true' || includeDeleted === '1',
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Post(':id/mark-read')
  @Permissions(PERMISSIONS.GROUPS_UPDATE)
  async markRead(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const done = await this.groupsService.markRead(id.trim(), userId);
    if (!done) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy nhóm', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(
      { message: 'Đã đánh dấu đã đọc' },
      { status: 200 },
    );
    return res.status(statusCode).json(body);
  }

  @Post(':id/members')
  @Permissions(PERMISSIONS.GROUPS_UPDATE)
  async addMembers(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: { memberIds?: string[] },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const memberIds = Array.isArray(body?.memberIds)
      ? body.memberIds.filter((x) => typeof x === 'string' && x.trim())
      : [];
    const done = await this.groupsService.addMembers(
      id.trim(),
      userId,
      memberIds,
    );
    if (!done) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy nhóm hoặc không có quyền',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(
      { message: 'Đã thêm thành viên' },
      { status: 200 },
    );
    return res.status(statusCode).json(okBody);
  }

  @Delete(':id/members/:userId')
  @Permissions(PERMISSIONS.GROUPS_UPDATE)
  async removeMember(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const done = await this.groupsService.removeMember(
      id.trim(),
      userId,
      memberUserId?.trim() ?? '',
    );
    if (!done) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy nhóm hoặc thành viên',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(
      { message: 'Đã xóa thành viên khỏi nhóm' },
      { status: 200 },
    );
    return res.status(statusCode).json(body);
  }

  @Patch(':id/members/:userId/role')
  @Permissions(PERMISSIONS.GROUPS_UPDATE)
  async updateMemberRole(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @Body() body: { role?: string },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const role =
      body?.role === 'ADMIN' || body?.role === 'MEMBER' ? body.role : undefined;
    if (!role) {
      const { statusCode, body: errBody } = createErrorResponse(
        'role phải là ADMIN hoặc MEMBER',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }
    const done = await this.groupsService.updateMemberRole(
      id.trim(),
      userId,
      memberUserId?.trim() ?? '',
      role,
    );
    if (!done) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy nhóm hoặc không có quyền',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    const { statusCode, body: okBody } = createSuccessResponse(
      { message: 'Đã cập nhật vai trò' },
      { status: 200 },
    );
    return res.status(statusCode).json(okBody);
  }

  @Get(':id/messages')
  async getMessages(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const limitNum = Math.min(
      200,
      Math.max(1, parseInt(String(limit), 10) || 100),
    );
    const messages = await this.groupsService.getMessages(
      id.trim(),
      userId,
      limitNum,
    );
    const { statusCode, body } = createSuccessResponse({
      data: messages,
    });
    return res.status(statusCode).json(body);
  }

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
    const group = await this.groupsService.findById(id.trim(), userId);
    if (!group) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy nhóm', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    const { statusCode, body } = createSuccessResponse(group);
    return res.status(statusCode).json(body);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.GROUPS_UPDATE)
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; avatar?: string },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      const { statusCode, body: errBody } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(errBody);
    }
    const group = await this.groupsService.update(
      id.trim(),
      userId,
      body ?? {},
    );
    if (!group) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Không tìm thấy nhóm',
        { status: 404 },
      );
      return res.status(statusCode).json(errBody);
    }
    if (userId) {
      this.logActivity(
        userId,
        'Đã cập nhật nhóm',
        `Cập nhật nhóm: ${group.name}`,
        `${ADMIN_ROUTES.GROUPS}/${group.id}`,
        {
          resource: RESOURCES.GROUPS,
          action: ACTIONS.UPDATE,
          resourceId: group.id,
        },
      );
    }
    const { statusCode, body: okBody } = createSuccessResponse(group);
    return res.status(statusCode).json(okBody);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.GROUPS_HARD_DELETE)
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }
    const done = await this.groupsService.hardDelete(id.trim(), userId);
    if (!done) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy nhóm', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    this.socketGateway.emitGroupEvent('group:hard-deleted', {
      id: toEntityId(id.trim()),
    });
    if (userId) {
      this.logActivity(
        userId,
        'Đã xóa vĩnh viễn nhóm',
        `Xóa vĩnh viễn nhóm id: ${id}`,
        ADMIN_ROUTES.GROUPS,
        {
          resource: RESOURCES.GROUPS,
          action: ACTIONS.HARD_DELETE,
          resourceId: id,
        },
      );
    }
    const { statusCode, body } = createSuccessResponse(
      { message: 'Đã xóa vĩnh viễn nhóm' },
      { status: 200 },
    );
    return res.status(statusCode).json(body);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.GROUPS_DELETE)
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }
    const done = await this.groupsService.softDelete(id.trim(), userId);
    if (!done) {
      const { statusCode, body } = createErrorResponse(
        'Không tìm thấy nhóm hoặc không có quyền',
        { status: 404 },
      );
      return res.status(statusCode).json(body);
    }
    this.socketGateway.emitGroupEvent('group:deleted', {
      id: toEntityId(id.trim()),
    });
    if (userId) {
      this.logActivity(
        userId,
        'Đã xóa nhóm',
        `Xóa nhóm (soft) id: ${id}`,
        ADMIN_ROUTES.GROUPS,
        {
          resource: RESOURCES.GROUPS,
          action: ACTIONS.DELETE,
          resourceId: id,
        },
      );
    }
    const { statusCode, body } = createSuccessResponse(
      { message: 'Đã xóa nhóm' },
      { status: 200 },
    );
    return res.status(statusCode).json(body);
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.GROUPS_RESTORE)
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      const { statusCode, body } = createErrorResponse(
        `Thiếu header ${APP_HEADERS.USER_ID}`,
        { status: 401 },
      );
      return res.status(statusCode).json(body);
    }
    const done = await this.groupsService.restore(id.trim(), userId);
    if (!done) {
      const { statusCode, body } = createErrorResponse('Không tìm thấy nhóm', {
        status: 404,
      });
      return res.status(statusCode).json(body);
    }
    this.socketGateway.emitGroupEvent('group:restored', {
      id: toEntityId(id.trim()),
    });
    if (userId) {
      this.logActivity(
        userId,
        'Đã khôi phục nhóm',
        `Khôi phục nhóm id: ${id}`,
        `${ADMIN_ROUTES.GROUPS}/${id}`,
        {
          resource: RESOURCES.GROUPS,
          action: ACTIONS.RESTORE,
          resourceId: id,
        },
      );
    }
    const { statusCode, body } = createSuccessResponse(
      { message: 'Đã khôi phục nhóm' },
      { status: 200 },
    );
    return res.status(statusCode).json(body);
  }

  @Post()
  @Permissions(PERMISSIONS.GROUPS_CREATE)
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body()
    body: {
      name?: string;
      description?: string;
      avatar?: string;
      memberIds?: string[];
    },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!name) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Tên nhóm là bắt buộc',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    const memberIds = Array.isArray(body?.memberIds)
      ? body.memberIds.filter((id) => typeof id === 'string' && id.trim())
      : [];

    try {
      const created = await this.groupsService.create(userId, {
        name,
        description: body?.description ?? null,
        avatar: body?.avatar ?? null,
        memberIds,
      });

      if (userId) {
        this.logActivity(
          userId,
          'Đã tạo nhóm',
          `Tạo nhóm: ${created.name}`,
          `${ADMIN_ROUTES.GROUPS}/${created.id}`,
          {
            resource: RESOURCES.GROUPS,
            action: ACTIONS.CREATE,
            resourceId: created.id,
          },
        );
      }
      const { statusCode, body: okBody } = createSuccessResponse(created, {
        status: 201,
      });
      return res.status(statusCode).json(okBody);
    } catch (err) {
      this.logger.error(
        `[POST ${ADMIN_ROUTES.GROUPS}] create group failed`,
        err instanceof Error ? err.stack : String(err),
      );
      const message = err instanceof Error ? err.message : 'Không thể tạo nhóm';
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }
}
