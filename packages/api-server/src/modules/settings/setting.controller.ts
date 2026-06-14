import { Controller, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  createSuccessResponse,
  type ApiResponsePayload,
} from '../../common';
import type {
  SettingsRowDto,
  BaseSettingsService,
} from './setting.service';

export type ISettingsControllerService = Pick<
  BaseSettingsService,
  'listSettings' | 'getByKey' | 'bulkUpdate' | 'updateByKey' | 'deleteSetting'
>;

@ApiTags('Settings')
@Controller()
export class BaseSettingsController {
  constructor(service: ISettingsControllerService) {
    this.service = service;
  }

  protected readonly service: ISettingsControllerService;

  @Get()
  @ApiOperation({ summary: 'List settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async list(
    @Query('group') group?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponsePayload<SettingsRowDto[]>> {
    const rows = await this.service.listSettings({ group, search });
    return createSuccessResponse(rows).body;
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  async getByKey(
    @Param('key') key: string,
  ): Promise<ApiResponsePayload<SettingsRowDto | null>> {
    const row = await this.service.getByKey(key);
    return createSuccessResponse(row).body;
  }

  @Put()
  @ApiOperation({ summary: 'Bulk update settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateBulk(
    @Body() settings: Record<string, unknown>,
  ): Promise<ApiResponsePayload<SettingsRowDto[]>> {
    const rows = await this.service.bulkUpdate(settings);
    return createSuccessResponse(rows).body;
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update setting by key' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  async update(
    @Param('key') key: string,
    @Body('value') value: unknown,
  ): Promise<ApiResponsePayload<SettingsRowDto>> {
    const row = await this.service.updateByKey(key, value);
    return createSuccessResponse(row).body;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete setting by id' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  async delete(
    @Param('id') id: string,
  ): Promise<ApiResponsePayload<SettingsRowDto | null>> {
    const row = await this.service.deleteSetting(id);
    return createSuccessResponse(row).body;
  }
}
