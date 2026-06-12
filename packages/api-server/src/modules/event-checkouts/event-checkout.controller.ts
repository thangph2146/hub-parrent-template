import { Controller, Get, Post, Body, Query, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BaseEventCheckoutsService } from './event-checkout.service';
import {
  createSuccessResponse,
  createErrorResponse,
  Permissions,
  type ApiResponsePayload,
} from '../../common';

@Controller()
@ApiTags('EventCheckouts')
@Permissions()
export class BaseEventCheckoutsController {
  protected readonly logger: Logger;

  constructor(protected readonly service: BaseEventCheckoutsService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Get()
  @ApiOperation({ summary: 'List event checkouts (registrations with hasCheckout=true)' })
  @ApiQuery({ name: 'eventId', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list' })
  @ApiResponse({ status: 400, description: 'eventId is required' })
  async list(
    @Query('eventId') eventId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponsePayload<unknown>> {
    if (!eventId?.trim()) {
      throw new BadRequestException(
        createErrorResponse('eventId là bắt buộc', { status: 400 }).body,
      );
    }
    const result = await this.service.list({
      eventId: eventId.trim(),
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 1000),
      search: search?.trim(),
    });
    return createSuccessResponse({
      data: result.data,
      pagination: result.pagination,
    }).body;
  }

  @Post('bulk')
  @Permissions()
  @ApiOperation({ summary: 'Bulk clear checkouts (reset hasCheckout=false)' })
  @ApiBody({
    schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } }, required: ['ids'] },
  })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulk(
    @Body() body: { ids?: string[] },
  ): Promise<ApiResponsePayload<{ affected: number; message: string }>> {
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const result = await this.service.bulkClear(ids);
    return createSuccessResponse(
      { affected: result.affected, message: result.message },
      { message: result.message },
    ).body;
  }
}
