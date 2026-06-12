/**
 * Dashboard Controller.
 *
 * Bám sát pattern của `apps/main/api/src/dashboard/dashboard.controller.ts`.
 * Extend `BaseController` từ `@workspace/api-server/bases`.
 *
 * Endpoints:
 *   GET /stats - Get dashboard statistics
 */
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseDashboardService } from './dashboard.service';
import {
  createSuccessResponse,
  Permissions,
  type ApiResponsePayload,
} from '../../common';
import type { DashboardStatsDto } from './dashboard.types';

@ApiTags('Dashboard')
@Permissions()
@Controller()
export class BaseDashboardController {
  protected readonly logger: Logger;

  constructor(protected readonly service: BaseDashboardService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getStats(): Promise<ApiResponsePayload<DashboardStatsDto>> {
    const stats = await this.service.getStats();
    return createSuccessResponse(stats).body;
  }
}