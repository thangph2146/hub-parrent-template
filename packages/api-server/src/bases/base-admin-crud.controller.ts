/**
 * Base Admin CRUD Controller.
 *
 * HTTP admin với header `X-User-Id` + envelope `createSuccessResponse` /
 * `createErrorResponse` (pattern `apps/main/api` admin).
 *
 * Subclass inject service (Pick admin service) và chỉ override endpoint đặc thù
 * (create/update/bulk mở rộng) — giống `BaseCrudController` cho scaffold CRUD.
 */
import {
  Get,
  Post,
  Delete,
  Param,
  Query,
  Headers,
  Res,
  Body,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiHeader,
  ApiParam,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  isBulkAction,
  buildAdminListCrudParams,
  type AdminListQueryInput,
  type BulkResult,
} from '../common';
import { BaseAdminHttpController } from './base-admin-http.controller';

export type AdminCrudControllerConfig = {
  /** Nhãn entity trong message lỗi (vd: "bài viết", "sự kiện"). */
  entityLabel: string;
  listDefaultLimit?: number;
};

export interface IAdminCrudControllerService<
  TRow = Record<string, unknown>,
  TListParams = AdminListQueryInput,
  TListResult extends {
    data: TRow[];
    pagination: Record<string, unknown>;
  } = { data: TRow[]; pagination: Record<string, unknown> },
> {
  list(params: TListParams): Promise<TListResult>;
  getById(id: string): Promise<TRow | null>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  hardDelete(id: string): Promise<boolean>;
  bulk(action: string, ids: string[]): Promise<BulkResult>;
}

export abstract class BaseAdminCrudController<
  TRow = Record<string, unknown>,
  TListParams = ReturnType<typeof buildAdminListCrudParams>,
  TListResult extends {
    data: TRow[];
    pagination: Record<string, unknown>;
  } = { data: TRow[]; pagination: Record<string, unknown> },
  TService extends IAdminCrudControllerService<
    TRow,
    TListParams,
    TListResult
  > = IAdminCrudControllerService<TRow, TListParams, TListResult>,
> extends BaseAdminHttpController {
  constructor(
    protected readonly service: TService,
    protected readonly config: AdminCrudControllerConfig,
  ) {
    super();
  }

  protected sendEntityNotFound(res: Response, message?: string): Response {
    return this.sendNotFound(
      res,
      message ?? `Không tìm thấy ${this.config.entityLabel}`,
    );
  }

  /** Map query string → params list; override khi service cần shape khác. */
  protected buildListParams(input: AdminListQueryInput): TListParams {
    return buildAdminListCrudParams({
      ...input,
      defaultLimit: input.defaultLimit ?? this.config.listDefaultLimit ?? 10,
    }) as TListParams;
  }

  @Get()
  @ApiOperation({ summary: 'List with pagination' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'deleted', 'all'],
  })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Missing X-User-Id header' })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query() query?: Record<string, string>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const result = await this.service.list(
      this.buildListParams({
        page,
        limit,
        search,
        status,
        query,
        statusFilter: query?.statusFilter,
        updatedAtFrom: query?.updatedAtFrom,
        updatedAtTo: query?.updatedAtTo,
        deletedAtFrom: query?.deletedAtFrom,
        deletedAtTo: query?.deletedAtTo,
        userId: query?.userId,
        defaultLimit: this.config.listDefaultLimit,
      }),
    );
    return this.sendSuccess(res, {
      data: result.data,
      pagination: result.pagination,
    });
  }

  /** Gọi từ `@Get(':id')` của subclass — đặt sau các route tĩnh (`options`, …). */
  protected async handleGetById(
    res: Response,
    headers: Record<string, string | string[] | undefined>,
    id: string,
  ): Promise<Response> {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const row = await this.service.getById(id);
    if (!row) return this.sendEntityNotFound(res);
    return this.sendSuccess(res, row);
  }

  @Delete(':id/hard-delete')
  @ApiOperation({ summary: 'Hard delete permanently' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  async hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const ok = await this.service.hardDelete(id);
    if (!ok) return this.sendEntityNotFound(res);
    return this.sendSuccess(res, undefined, {
      message: `Đã xóa vĩnh viễn ${this.config.entityLabel}`,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  async softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const ok = await this.service.softDelete(id);
    if (!ok) {
      return this.sendError(
        res,
        `${this.capitalizeLabel()} không tồn tại hoặc đã bị xóa`,
        404,
      );
    }
    return this.sendSuccess(res, undefined, {
      message: `Đã xóa ${this.config.entityLabel}`,
    });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted record' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiParam({ name: 'id', type: String })
  async restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const ok = await this.service.restore(id);
    if (!ok) {
      return this.sendError(
        res,
        `${this.capitalizeLabel()} không tồn tại hoặc chưa bị xóa`,
        404,
      );
    }
    return this.sendSuccess(res, undefined, {
      message: `Đã khôi phục ${this.config.entityLabel}`,
    });
  }

  /** Bulk CRUD chuẩn (delete / restore / hard-delete). Override cho action mở rộng. */
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk action' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | string[] | undefined>,
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

  protected capitalizeLabel(): string {
    const label = this.config.entityLabel;
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
