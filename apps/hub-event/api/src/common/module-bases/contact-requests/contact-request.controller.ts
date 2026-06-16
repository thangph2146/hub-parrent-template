/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/**
 * ContactRequests Controller.
 */
import {
  Get,
  Query,
  Patch,
  Param,
  Body,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseCrudController, type ICrudControllerService } from '../../crud';
import {
  createSuccessResponse,
  createErrorResponse,
  parseAdminListLimit,
  parseAdminListPage,
  type ApiResponsePayload,
} from '../../index';
import type {
  ContactRequestBulkAction,
  ContactRequestsRowDto,
  ContactRequestsCreateData,
  ContactRequestsUpdateData,
} from './contact-request.service';

export interface IContactRequestsControllerService extends ICrudControllerService<
  ContactRequestsRowDto,
  ContactRequestsCreateData,
  ContactRequestsUpdateData
> {
  update(
    id: string | number,
    data: ContactRequestsUpdateData,
  ): Promise<ContactRequestsRowDto | null>;
  bulkAction(
    action: ContactRequestBulkAction,
    ids: string[],
    status?: ContactRequestsUpdateData['status'],
  ): Promise<{ affectedCount: number; message: string }>;
}

@ApiTags('ContactRequests')
export class BaseContactRequestsController extends BaseCrudController<
  ContactRequestsRowDto,
  ContactRequestsCreateData,
  ContactRequestsUpdateData
> {
  private readonly contactService: IContactRequestsControllerService;
  private readonly contactBulkActions = new Set<ContactRequestBulkAction>([
    'delete',
    'restore',
    'hard-delete',
    'mark-read',
    'mark-unread',
    'update-status',
  ]);

  constructor(service: IContactRequestsControllerService) {
    super(service, 'contact-requests');
    this.contactService = service;
  }

  @Get()
  @ApiOperation({ summary: 'List contact requests' })
  @ApiResponse({
    status: 200,
    description: 'Contact requests retrieved successfully',
  })
  async list(
    @Query() query: Record<string, string | string[] | undefined>,
  ): Promise<
    ApiResponsePayload<{
      data: ContactRequestsRowDto[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    const filters: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('filter[') && key.endsWith(']') && value) {
        const column = key.slice(7, -1);
        const raw = Array.isArray(value) ? value[0] : value;
        if (raw?.trim()) filters[column] = raw.trim();
      }
    }

    if (
      typeof query.status === 'string' &&
      ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(query.status)
    ) {
      filters.status = query.status;
    }

    const result = await this.service.list({
      page: parseAdminListPage(query.page),
      limit: parseAdminListLimit(query.limit, 20),
      search: typeof query.search === 'string' ? query.search.trim() : '',
      status:
        query.trash === 'true'
          ? 'deleted'
          : query.status === 'deleted' || query.status === 'all'
            ? query.status
            : 'all',
      filters,
    });
    return createSuccessResponse(result).body;
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive contact request' })
  @ApiResponse({
    status: 200,
    description: 'Contact request archived successfully',
  })
  async archive(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<ContactRequestsRowDto | null>> {
    const updated = await this.contactService.update(id, { status: 'CLOSED' });
    return createSuccessResponse(updated).body;
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign contact request to user' })
  @ApiResponse({
    status: 200,
    description: 'Contact request assigned successfully',
  })
  async assign(
    @Param('id') id: string,
    @Body() body: { assigneeId?: string | number | null },
  ): Promise<ApiResponsePayload<ContactRequestsRowDto | null>> {
    const updated = await this.contactService.update(id, {
      assignedToId: body.assigneeId ?? null,
      status: body.assigneeId ? 'IN_PROGRESS' : undefined,
    });
    return createSuccessResponse(updated).body;
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update contact requests' })
  @ApiResponse({
    status: 200,
    description: 'Bulk action completed successfully',
  })
  async bulkContactRequests(
    @Body()
    body: {
      action: ContactRequestBulkAction;
      ids: string[];
      status?: ContactRequestsUpdateData['status'];
    },
  ): Promise<
    ApiResponsePayload<{ affected: number; message: string | undefined }>
  > {
    if (!this.contactBulkActions.has(body.action)) {
      throw new BadRequestException(
        createErrorResponse('Action không hợp lệ', { status: 400 }).body,
      );
    }
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException(
        createErrorResponse('ids phải là mảng không rỗng', { status: 400 })
          .body,
      );
    }
    if (
      body.action === 'update-status' &&
      !['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(
        String(body.status ?? ''),
      )
    ) {
      throw new BadRequestException(
        createErrorResponse('status không hợp lệ', { status: 400 }).body,
      );
    }
    const data = await this.contactService.bulkAction(
      body.action,
      body.ids,
      body.status,
    );
    return createSuccessResponse({
      affected: data.affectedCount,
      message: data.message,
    }).body;
  }
}
