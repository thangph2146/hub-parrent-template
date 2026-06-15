/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Headers,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { BaseCartsService, type CartDto } from './carts.service';
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponsePayload,
} from '../../index';

@Controller()
@ApiTags('Carts')
export class BaseCartsController {
  protected readonly logger: Logger;
  protected readonly userIdHeader = 'x-user-id';

  constructor(protected readonly service: BaseCartsService) {
    this.logger = new Logger(this.constructor.name);
  }

  protected resolveCustomerId(
    headers: Record<string, string | undefined>,
  ): string | null {
    const id = headers[this.userIdHeader]?.trim();
    return id || null;
  }

  @Get()
  @ApiOperation({ summary: 'Get current customer cart' })
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiResponse({ status: 200, description: 'Cart data' })
  @ApiResponse({ status: 401, description: 'Not logged in' })
  async getMine(
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<CartDto>> {
    const customerId = this.resolveCustomerId(headers);
    if (!customerId) {
      throw new UnauthorizedException(
        createErrorResponse('Chưa đăng nhập', { status: 401 }).body,
      );
    }
    const data = await this.service.getForCustomer(customerId);
    return createSuccessResponse(data).body;
  }

  @Put()
  @ApiOperation({ summary: 'Save customer cart' })
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Saved cart' })
  @ApiResponse({ status: 401, description: 'Not logged in' })
  async saveMine(
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<CartDto>> {
    const customerId = this.resolveCustomerId(headers);
    if (!customerId) {
      throw new UnauthorizedException(
        createErrorResponse('Chưa đăng nhập', { status: 401 }).body,
      );
    }
    const data = await this.service.saveForCustomer(customerId, body);
    return createSuccessResponse(data).body;
  }

  @Delete()
  @ApiOperation({ summary: 'Clear customer cart' })
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  @ApiResponse({ status: 401, description: 'Not logged in' })
  async clearMine(
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ApiResponsePayload<{ ok: boolean }>> {
    const customerId = this.resolveCustomerId(headers);
    if (!customerId) {
      throw new UnauthorizedException(
        createErrorResponse('Chưa đăng nhập', { status: 401 }).body,
      );
    }
    await this.service.clearForCustomer(customerId);
    return createSuccessResponse({ ok: true }).body;
  }
}
