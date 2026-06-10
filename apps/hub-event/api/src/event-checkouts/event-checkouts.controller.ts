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
  Body,
  Query,
  Headers,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { EventCheckoutsService } from './event-checkouts.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { parseAdminListLimit } from '../common/parse-list-query';

@ApiTags('Event Checkouts')
@Permissions(PERMISSIONS.EVENT_CHECKOUTS_VIEW)
@Controller(ADMIN_ROUTES.EVENT_CHECKOUTS)
export class EventCheckoutsController {
  private readonly logger = new Logger(EventCheckoutsController.name);

  constructor(private readonly eventCheckoutsService: EventCheckoutsService) {}

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
  @ApiOperation({
    summary: 'List event checkouts (registrations with hasCheckout=true)',
  })
  @ApiHeader({ name: 'X-User-Id', required: true })
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('eventId') eventId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
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
    const result = await this.eventCheckoutsService.list({
      eventId: eventId.trim(),
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 10),
      search: search?.trim(),
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  @Post('bulk')
  @Permissions(PERMISSIONS.EVENT_CHECKOUTS_MANAGE)
  @ApiOperation({ summary: 'Bulk clear checkouts (reset hasCheckout=false)' })
  @ApiHeader({ name: 'X-User-Id', required: true })
  @ApiBody({
    description: 'Bulk action with registration ids',
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' } },
      },
      required: ['ids'],
    },
  })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  @ApiResponse({ status: 401, description: 'Missing X-User-Id header' })
  async bulk(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { ids?: string[] },
  ) {
    this.logger.log(`bulk clear-checkout ids=${(body?.ids ?? []).length}`);
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const result = await this.eventCheckoutsService.bulkClear(ids);
    const { statusCode, body: okBody } = createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    );
    return res.status(statusCode).json(okBody);
  }
}
