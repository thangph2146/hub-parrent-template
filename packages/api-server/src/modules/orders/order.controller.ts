/**
 * Orders Controller.
 *
 * Bám sát pattern của `apps/main/api/src/orders/orders.controller.ts`.
 * Extend `BaseCrudController` từ `@workspace/api-server/bases`.
 *
 * Endpoints được cung cấp sẵn (8 routes CRUD chuẩn admin):
 *   GET    /orders              - list
 *   GET    /orders/:id          - getById
 *   POST   /orders              - create
 *   PUT    /orders/:id          - update
 *   DELETE /orders/:id          - softDelete
 *   POST   /orders/:id/restore  - restore
 *   DELETE /orders/:id/hard     - hardDelete
 *   POST   /orders/bulk         - bulk action
 */
import { Get, Put, Param, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  BaseCrudController,
  type ICrudControllerService,
} from '../../bases';
import { createSuccessResponse, createErrorResponse, type ApiResponsePayload } from '../../common';
import type {
  OrdersRowDto,
  OrdersCreateData,
  OrdersUpdateData,
  StaffOrderStatusCounts,
} from './order.service';

export interface IOrdersControllerService
  extends ICrudControllerService<
    OrdersRowDto,
    OrdersCreateData,
    OrdersUpdateData
  > {
  getStaffStatusCounts(): Promise<StaffOrderStatusCounts>;
  updateStatus(
    id: string | number,
    status: OrdersRowDto['status'],
  ): Promise<OrdersRowDto | null>;
}

@ApiTags('Orders')
export class BaseOrdersController extends BaseCrudController<
  OrdersRowDto,
  OrdersCreateData,
  OrdersUpdateData
> {
  private readonly ordersService: IOrdersControllerService;

  constructor(service: IOrdersControllerService) {
    super(service, 'orders');
    this.ordersService = service;
  }

  @Get('staff/status-counts')
  @ApiOperation({ summary: 'Get staff order status counts' })
  @ApiResponse({ status: 200, description: 'Order status counts retrieved successfully' })
  async statusCounts(): Promise<ApiResponsePayload<StaffOrderStatusCounts>> {
    const counts = await this.ordersService.getStaffStatusCounts();
    return createSuccessResponse(counts).body;
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrdersRowDto['status'],
  ): Promise<ApiResponsePayload<OrdersRowDto | null>> {
    if (!status) {
      throw new BadRequestException(
        createErrorResponse('Trạng thái không hợp lệ', { status: 400 }).body,
      );
    }
    const updated = await this.ordersService.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException(
        createErrorResponse('Không tìm thấy đơn hàng', { status: 404 }).body,
      );
    }
    return createSuccessResponse(updated).body;
  }
}
