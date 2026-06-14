/**
 * BasePageContentsController — HTTP admin page contents (@workspace/api-server).
 */
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
import { ApiOperation, ApiHeader, ApiBody, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { BaseAdminHttpController } from '../../crud/base-admin-http.controller';
import {
  Permissions,
  isBulkAction,
  parseColumnFiltersFromQuery,
  parseAdminListPage,
  parseAdminListLimit,
} from '../../index';
import { ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import type {
  BasePageContentsService,
  PageContentCreateInput,
  PageContentUpdateInput,
} from './page-contents.service';

export type IPageContentsControllerService = Pick<
  BasePageContentsService,
  | 'list'
  | 'getById'
  | 'create'
  | 'update'
  | 'delete'
  | 'bulk'
>;
/** @deprecated Dùng `IPageContentsControllerService`. */
export type IPageContentsAdminControllerService = IPageContentsControllerService;

@Permissions(PERMISSIONS.PAGE_CONTENTS_VIEW)
@Controller(ADMIN_ROUTES.PAGE_CONTENTS)
export class BasePageContentsController extends BaseAdminHttpController {
  constructor(
    protected readonly service: IPageContentsControllerService,
  ) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'List page contents' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query() query?: Record<string, string>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    try {
      const result = await this.service.list({
        page: parseAdminListPage(page),
        limit: parseAdminListLimit(limit, 10),
        search,
        filters: parseColumnFiltersFromQuery(query),
      });
      return this.sendSuccess(res, result);
    } catch (error) {
      this.logger.error(
        `GET ${ADMIN_ROUTES.PAGE_CONTENTS} ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.sendError(res, 'Lỗi server khi lấy danh sách page contents', 500);
    }
  }

  @Get(':id')
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    try {
      const result = await this.service.getById(id);
      if (!result) return this.sendNotFound(res, 'Page content not found');
      return this.sendSuccess(res, result);
    } catch (error) {
      this.logger.error(
        `GET ${ADMIN_ROUTES.PAGE_CONTENTS}/${id} ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.sendError(res, 'Lỗi server', 500);
    }
  }

  @Permissions(PERMISSIONS.PAGE_CONTENTS_CREATE)
  @Post()
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() data: PageContentCreateInput,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    try {
      const result = await this.service.create(data);
      return this.sendSuccess(res, result, { status: 201 });
    } catch (error) {
      this.logger.error(
        `POST ${ADMIN_ROUTES.PAGE_CONTENTS} ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.sendError(res, 'Lỗi server', 500);
    }
  }

  @Permissions(PERMISSIONS.PAGE_CONTENTS_UPDATE)
  @Put(':id')
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() data: PageContentUpdateInput,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    try {
      const result = await this.service.update(id, data);
      if (!result) return this.sendNotFound(res, 'Page content not found');
      return this.sendSuccess(res, result);
    } catch (error) {
      this.logger.error(
        `PUT ${ADMIN_ROUTES.PAGE_CONTENTS}/${id} ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.sendError(res, 'Lỗi server', 500);
    }
  }

  @Permissions(PERMISSIONS.PAGE_CONTENTS_DELETE)
  @Delete(':id')
  async delete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    try {
      await this.service.delete(id);
      return this.sendSuccess(res, { success: true });
    } catch (error) {
      this.logger.error(
        `DELETE ${ADMIN_ROUTES.PAGE_CONTENTS}/${id} ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.sendError(res, 'Lỗi server', 500);
    }
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.PAGE_CONTENTS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on page contents' })
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
