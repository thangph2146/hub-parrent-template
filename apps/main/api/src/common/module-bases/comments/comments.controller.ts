/**
 * BaseCommentsController — HTTP admin comments (@workspace/api-server).
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseAdminCrudController } from '../../crud/base-admin-crud.controller';
import { Permissions, parseAdminListLimit } from '../../index';
import { ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import type {
  BaseCommentsService,
  CommentRowDto,
  ListCommentsParams,
  ListCommentsResult,
} from './comments.service';

export type ICommentsControllerService = Pick<
  BaseCommentsService,
  | 'list'
  | 'getOptions'
  | 'getById'
  | 'softDelete'
  | 'restore'
  | 'hardDelete'
  | 'approve'
  | 'unapprove'
  | 'bulk'
>;
/** @deprecated Dùng `ICommentsControllerService`. */
export type ICommentsAdminControllerService = ICommentsControllerService;

type CommentBulkAction =
  | 'active'
  | 'unactive'
  | 'delete'
  | 'restore'
  | 'hard-delete';

const COMMENT_BULK = new Set<CommentBulkAction>([
  'active',
  'unactive',
  'delete',
  'restore',
  'hard-delete',
]);

function isCommentBulkAction(action: string): action is CommentBulkAction {
  return COMMENT_BULK.has(action as CommentBulkAction);
}

function mapCommentBulkAction(
  action: CommentBulkAction,
): 'approve' | 'unapprove' | 'delete' | 'restore' | 'hard-delete' {
  switch (action) {
    case 'active':
      return 'approve';
    case 'unactive':
      return 'unapprove';
    default:
      return action;
  }
}

@Permissions(PERMISSIONS.COMMENTS_VIEW)
@Controller(ADMIN_ROUTES.COMMENTS)
export class BaseCommentsController extends BaseAdminCrudController<
  CommentRowDto,
  ListCommentsParams,
  ListCommentsResult,
  ICommentsControllerService
> {
  constructor(service: ICommentsControllerService) {
    super(service, { entityLabel: 'bình luận' });
  }

  @Get('options')
  async options(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('column') column?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const options = await this.service.getOptions(
      column ?? '',
      search?.trim(),
      parseAdminListLimit(limit, 50),
    );
    return this.sendSuccess(res, options);
  }

  @Get(':id')
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleGetById(res, headers, id);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.COMMENTS_DELETE)
  override softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return super.softDelete(res, headers, id);
  }

  @Post(':id/restore')
  @Permissions(PERMISSIONS.COMMENTS_RESTORE)
  override restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return super.restore(res, headers, id);
  }

  @Delete(':id/hard-delete')
  @Permissions(PERMISSIONS.COMMENTS_MANAGE)
  override hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return super.hardDelete(res, headers, id);
  }

  @Post(':id/approve')
  @Permissions(PERMISSIONS.COMMENTS_APPROVE)
  async approve(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.approve(id),
      'Đã duyệt bình luận',
      'Bình luận không tồn tại hoặc đã bị xóa',
    );
  }

  @Post(':id/unapprove')
  @Permissions(PERMISSIONS.COMMENTS_APPROVE)
  async unapprove(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleBoolMutation(
      res,
      headers,
      () => this.service.unapprove(id),
      'Đã bỏ duyệt bình luận',
      'Bình luận không tồn tại hoặc đã bị xóa',
    );
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.COMMENTS_MANAGE)
  override async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { action?: string; ids?: string[] },
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const action = body?.action;
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (!action || !isCommentBulkAction(action)) {
      return this.sendError(res, 'Action không hợp lệ', 400);
    }

    const result = await this.service.bulk(mapCommentBulkAction(action), ids);
    return this.sendSuccess(
      res,
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
  }
}
