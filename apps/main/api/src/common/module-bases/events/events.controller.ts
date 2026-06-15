/**
 * BaseEventsController — HTTP admin events (@workspace/api-server).
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
  Headers,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { BaseAdminCrudController } from '../../crud/base-admin-crud.controller';
import {
  Permissions,
  parseColumnFiltersFromQuery,
  parseAdminListLimit,
  type AdminListQueryInput,
} from '../../index';
import { ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';
import type {
  BaseEventsService,
  EventRowDto,
  ListEventsParams,
  ListEventsResult,
} from './events.service';

export type IEventsControllerService = Pick<
  BaseEventsService,
  | 'list'
  | 'getById'
  | 'create'
  | 'update'
  | 'hardDelete'
  | 'softDelete'
  | 'restore'
  | 'bulk'
>;
/** @deprecated Dùng `IEventsControllerService`. */
export type IEventsAdminControllerService = IEventsControllerService;

@ApiTags('Events')
@Controller(ADMIN_ROUTES.EVENTS)
@Permissions(PERMISSIONS.EVENTS_VIEW)
export class BaseEventsController extends BaseAdminCrudController<
  EventRowDto,
  ListEventsParams,
  ListEventsResult,
  IEventsControllerService
> {
  constructor(service: IEventsControllerService) {
    super(service, { entityLabel: 'sự kiện', listDefaultLimit: 10 });
  }

  protected override buildListParams(
    input: AdminListQueryInput,
  ): ListEventsParams {
    return {
      page: Math.max(1, parseInt(String(input.page), 10) || 1),
      limit: parseAdminListLimit(input.limit, 10),
      search: input.search?.trim(),
      status: (input.status as ListEventsParams['status']) ?? 'active',
      statusFilter:
        input.statusFilter != null ? Number(input.statusFilter) : undefined,
      updatedAtFrom: input.updatedAtFrom?.trim(),
      updatedAtTo: input.updatedAtTo?.trim(),
      deletedAtFrom: input.deletedAtFrom?.trim(),
      deletedAtTo: input.deletedAtTo?.trim(),
      filters: parseColumnFiltersFromQuery(input.query),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async getById(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return this.handleGetById(res, headers, id);
  }

  @Permissions(PERMISSIONS.EVENTS_CREATE)
  @Post()
  @ApiOperation({ summary: 'Create new event' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async create(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: Record<string, unknown>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    if (!body?.title?.toString().trim()) {
      return this.sendError(res, 'title là bắt buộc', 400);
    }
    const created = await this.service.create(body);
    return this.sendSuccess(res, created, { status: 201 });
  }

  @Permissions(PERMISSIONS.EVENTS_UPDATE)
  @Put(':id')
  @ApiOperation({ summary: 'Update event by ID' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async update(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const updated = await this.service.update(id, body);
    if (!updated) return this.sendNotFound(res);
    return this.sendSuccess(res, updated);
  }

  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @Delete(':id/hard-delete')
  override hardDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return super.hardDelete(res, headers, id);
  }

  @Permissions(PERMISSIONS.EVENTS_DELETE)
  @Delete(':id')
  override softDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return super.softDelete(res, headers, id);
  }

  @Permissions(PERMISSIONS.EVENTS_RESTORE)
  @Post(':id/restore')
  override restore(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ) {
    return super.restore(res, headers, id);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.EVENTS_MANAGE)
  @ApiOperation({ summary: 'Bulk action on events' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({ description: 'Bulk action with ids' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  override bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { action?: string; ids?: string[] },
  ) {
    return super.bulk(res, headers, body);
  }
}
