/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  Res,
  Delete,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { SettingsService } from './settings.service';
import { createSuccessResponse, createErrorResponse, resolveHttpErrorMessage } from '../common';
import { ADMIN_ROUTES } from '../config/constants';
import { Permissions } from '../common';
import { PERMISSIONS } from '../config/permissions';

@Permissions(PERMISSIONS.SETTINGS_VIEW)
@Controller(ADMIN_ROUTES.SETTINGS)
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(private readonly settingsService: SettingsService) {}

  private logApiError(api: string, error: unknown, metadata?: unknown): void {
    const details =
      error instanceof Error
        ? {
            api,
            name: error.name,
            message: error.message,
            stack: error.stack ?? null,
            metadata: metadata ?? null,
          }
        : {
            api,
            message: String(error),
            stack: null,
            metadata: metadata ?? null,
          };
    this.logger.error(JSON.stringify(details));
  }

  @Get()
  async list(
    @Res() res: Response,
    @Query('group') group?: string,
    @Query('search') search?: string,
  ) {
    try {
      const rows = await this.settingsService.listSettings({
        group,
        search,
      });
      const { statusCode, body } = createSuccessResponse({ data: rows });
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/settings', error, { group, search });
      const message = resolveHttpErrorMessage(error);
      const { statusCode, body } = createErrorResponse(message, {
        status: 500,
        error: message,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get(':key')
  async getByKey(@Res() res: Response, @Param('key') key: string) {
    try {
      const result = await this.settingsService.getByKey(key);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/settings/:key', error, { key });
      const message = resolveHttpErrorMessage(error);
      const { statusCode, body } = createErrorResponse(message, {
        status: 500,
        error: message,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SETTINGS_UPDATE)
  @Put()
  async updateBulk(
    @Res() res: Response,
    @Body() settings: Record<string, unknown>,
  ) {
    try {
      const result = await this.settingsService.bulkUpdate(settings);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('PUT /api/admin/settings', error, {
        keyCount: Object.keys(settings ?? {}).length,
      });
      const message = resolveHttpErrorMessage(error);
      const { statusCode, body } = createErrorResponse(message, {
        status: 500,
        error: message,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SETTINGS_UPDATE)
  @Put(':key')
  async update(
    @Res() res: Response,
    @Param('key') key: string,
    @Body('value') value: unknown,
  ) {
    try {
      const result = await this.settingsService.updateByKey(key, value);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('PUT /api/admin/settings/:key', error, { key });
      const message = resolveHttpErrorMessage(error);
      const { statusCode, body } = createErrorResponse(message, {
        status: 500,
        error: message,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SETTINGS_DELETE)
  @Delete(':id')
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.settingsService.deleteSetting(id);
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('DELETE /api/admin/settings/:id', error, { id });
      const message = resolveHttpErrorMessage(error);
      const { statusCode, body } = createErrorResponse(message, {
        status: 500,
        error: message,
      });
      return res.status(statusCode).json(body);
    }
  }
}
