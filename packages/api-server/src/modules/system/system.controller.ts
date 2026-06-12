import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BaseSystemService } from './system.service';
import {
  createSuccessResponse,
  Permissions,
  type ApiResponsePayload,
} from '../../common';
import type {
  DatabaseSchemaResponse,
  ImportConfigResponse,
} from './system.types';

@Controller()
@ApiTags('System')
@Permissions()
export class BaseSystemController {
  protected readonly logger: Logger;

  constructor(protected readonly service: BaseSystemService) {
    this.logger = new Logger(this.constructor.name);
  }

  @Get('models')
  @ApiOperation({ summary: 'List all importable models' })
  @ApiResponse({ status: 200, description: 'Model list' })
  async getModels(): Promise<ApiResponsePayload<string[]>> {
    const models = await this.service.getModels();
    return createSuccessResponse(models).body;
  }

  @Get('export')
  @ApiOperation({ summary: 'Export data as JSON' })
  @ApiQuery({ name: 'model', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Exported data' })
  async exportData(
    @Query('model') model?: string,
  ): Promise<ApiResponsePayload<unknown>> {
    const result = await this.service.exportData(model || undefined);
    return createSuccessResponse(result).body;
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export data as Excel' })
  @ApiQuery({ name: 'model', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Excel binary' })
  async exportExcelData(
    @Query('model') model?: string,
  ): Promise<ApiResponsePayload<unknown>> {
    const buffer = await this.service.exportExcelData(model || undefined);
    return createSuccessResponse({ buffer: buffer.toString('base64') }).body;
  }

  @Post('import')
  @ApiOperation({ summary: 'Import data from JSON' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { type: 'object' },
        targetModel: { type: 'string' },
        skipClear: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import result' })
  async importData(
    @Body() body: { data: Record<string, unknown[]>; targetModel?: string; skipClear?: boolean },
  ): Promise<ApiResponsePayload<unknown>> {
    const result = await this.service.importData(
      body.data,
      body.targetModel,
      body.skipClear,
    );
    return createSuccessResponse(result).body;
  }

  @Get('import-config')
  @ApiOperation({ summary: 'Get import configuration' })
  @ApiResponse({ status: 200, description: 'Import config' })
  async getImportConfig(): Promise<ApiResponsePayload<ImportConfigResponse>> {
    const config = await this.service.getImportConfig();
    return createSuccessResponse(config).body;
  }

  @Get('database-schema')
  @ApiOperation({ summary: 'Get full database schema' })
  @ApiResponse({ status: 200, description: 'Database schema' })
  async getDatabaseSchema(): Promise<ApiResponsePayload<DatabaseSchemaResponse>> {
    const schema = await this.service.getDatabaseSchema();
    return createSuccessResponse(schema).body;
  }
}
