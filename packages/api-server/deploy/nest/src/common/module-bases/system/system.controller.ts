/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Res,
  Logger,
  Query,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { BaseSystemService } from './system.service';
import {
  createSuccessResponse,
  createErrorResponse,
  Permissions,
} from '../../index';
import { APP_HEADERS, ADMIN_ROUTES } from '../../../config/constants';
import { PERMISSIONS } from '../../../config/permissions';;
import type { AuthLoginPayload } from '../auth/auth.service';
import { canAccessSystemMaintenance } from './system-maintenance';

const MAX_SYSTEM_EXCEL_FILE_BYTES = 50 * 1024 * 1024;

export interface ISystemMaintenanceAuth {
  getAuthPayloadByUserId(userId: string): Promise<AuthLoginPayload | null>;
}

export type ISystemControllerService = Pick<
  BaseSystemService,
  | 'getModels'
  | 'exportData'
  | 'exportExcelData'
  | 'importData'
  | 'importExcelData'
  | 'runSuperadminBootstrapSeed'
  | 'getImportConfig'
  | 'getDatabaseSchema'
>;

/** Import/export nhiều chunk — không áp dụng giới hạn 100 req/phút toàn cục. */
@SkipThrottle()
@Permissions(
  PERMISSIONS.SYSTEM_MANAGE,
  PERMISSIONS.SETTINGS_MANAGE,
  PERMISSIONS.SETTINGS_EXPORT,
  PERMISSIONS.SETTINGS_IMPORT,
)
@Controller(ADMIN_ROUTES.SYSTEM)
export class BaseSystemController {
  protected readonly logger: Logger;

  constructor(
    protected readonly service: ISystemControllerService,
    protected readonly authService?: ISystemMaintenanceAuth,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  protected async canAccessSystemMaintenance(
    headers: Record<string, string | undefined>,
  ): Promise<boolean> {
    if (!this.authService) return true;

    const userId = headers[APP_HEADERS.USER_ID]?.trim();
    if (!userId) return false;

    const payload = await this.authService.getAuthPayloadByUserId(userId);
    if (!payload) return false;

    return canAccessSystemMaintenance(payload);
  }

  protected logApiError(api: string, error: unknown, metadata?: unknown): void {
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

  protected async denyMaintenance(
    res: Response,
    headers: Record<string, string | undefined>,
  ): Promise<boolean> {
    if (await this.canAccessSystemMaintenance(headers)) return true;
    const { statusCode, body } = createErrorResponse(
      'Unauthorized: Super Admin or system manage permission required',
      { status: 403 },
    );
    res.status(statusCode).json(body);
    return false;
  }

  @Get('models')
  async getModels(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      const data = this.service.getModels();
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/system/models', error);
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('export')
  async exportData(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('model') model?: string,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      const data = await this.service.exportData(model);
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/system/export', error, { model });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Get('export/excel')
  async exportExcelData(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('model') model?: string,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      const buffer = await this.service.exportExcelData(model);
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const dateStamp = `${y}-${m}-${d}`;
      const filename = model
        ? `hub-system-${model}-${dateStamp}.xlsx`
        : `hub-system-export-${dateStamp}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      return res.status(200).send(buffer);
    } catch (error) {
      this.logApiError('GET /api/admin/system/export/excel', error, { model });
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SYSTEM_IMPORT, PERMISSIONS.SETTINGS_IMPORT)
  @Post('import')
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      transform: false,
    }),
  )
  async importData(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('model') model?: string,
    @Query('skipClear') skipClear?: string,
    @Query('stream') stream?: string,
    @Body() data?: Record<string, unknown[]>,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      if (!data || Object.keys(data).length === 0) {
        const { statusCode, body } = createErrorResponse(
          'Invalid data: No data provided',
          { status: 400 },
        );
        return res.status(statusCode).json(body);
      }

      if (stream === 'true') {
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');

        const onProgress = (event: object) => {
          if (!res.writableEnded) {
            res.write(`${JSON.stringify(event)}\n`);
          }
        };

        try {
          const result = await this.service.importData(
            data as Record<string, unknown[]>,
            model,
            skipClear === 'true',
            onProgress,
            headers[APP_HEADERS.USER_ID],
            headers[APP_HEADERS.USER_EMAIL],
          );
          onProgress({ type: 'complete', ...result });
        } catch (error) {
          onProgress({
            type: 'error',
            message:
              error instanceof Error ? error.message : 'Internal Server Error',
          });
        } finally {
          if (!res.writableEnded) {
            res.end();
          }
        }
        return;
      }

      const result = await this.service.importData(
        data as Record<string, unknown[]>,
        model,
        skipClear === 'true',
        undefined,
        headers[APP_HEADERS.USER_ID],
        headers[APP_HEADERS.USER_EMAIL],
      );
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('POST /api/admin/system/import', error, {
        model,
        skipClear,
        stream,
        modelCount: data ? Object.keys(data).length : 0,
      });
      const { statusCode, body } = createErrorResponse(
        error instanceof Error ? error.message : 'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SYSTEM_IMPORT, PERMISSIONS.SETTINGS_IMPORT)
  @Post('import/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SYSTEM_EXCEL_FILE_BYTES },
    }),
  )
  async importExcelData(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('model') model?: string,
    @Query('skipClear') skipClear?: string,
    @Query('stream') stream?: string,
    @UploadedFile()
    file?: { buffer: Buffer; originalname?: string; mimetype?: string },
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      if (!file?.buffer || file.buffer.length === 0) {
        const { statusCode, body } = createErrorResponse(
          'Invalid file: No Excel file uploaded',
          { status: 400 },
        );
        return res.status(statusCode).json(body);
      }

      if (stream === 'true') {
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');

        const onProgress = (event: object) => {
          if (!res.writableEnded) {
            res.write(`${JSON.stringify(event)}\n`);
          }
        };

        try {
          const result = await this.service.importExcelData(
            file.buffer,
            model,
            skipClear === 'true',
            onProgress,
            headers[APP_HEADERS.USER_ID],
            headers[APP_HEADERS.USER_EMAIL],
          );
          onProgress({ type: 'complete', ...result });
        } catch (error) {
          onProgress({
            type: 'error',
            message:
              error instanceof Error ? error.message : 'Internal Server Error',
          });
        } finally {
          if (!res.writableEnded) {
            res.end();
          }
        }
        return;
      }

      const result = await this.service.importExcelData(
        file.buffer,
        model,
        skipClear === 'true',
        undefined,
        headers[APP_HEADERS.USER_ID],
        headers[APP_HEADERS.USER_EMAIL],
      );
      const { statusCode, body } = createSuccessResponse(result);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('POST /api/admin/system/import/excel', error, {
        model,
        skipClear,
        stream,
        filename: file?.originalname ?? null,
      });
      const { statusCode, body } = createErrorResponse(
        error instanceof Error ? error.message : 'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Post('seed-bootstrap')
  async seedBootstrap(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      const data = await this.service.runSuperadminBootstrapSeed();
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('POST /api/admin/system/seed-bootstrap', error);
      const { statusCode, body } = createErrorResponse(
        error instanceof Error ? error.message : 'Internal Server Error',
        { status: 500 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SYSTEM_IMPORT, PERMISSIONS.SETTINGS_IMPORT)
  @Get('import-config')
  async getImportConfig(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      const data = this.service.getImportConfig();
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/system/import-config', error);
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }

  @Permissions(PERMISSIONS.SYSTEM_VIEW, PERMISSIONS.SETTINGS_MANAGE)
  @Get('database-schema')
  async getDatabaseSchema(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response | void> {
    try {
      if (!(await this.denyMaintenance(res, headers))) return;

      const data = await this.service.getDatabaseSchema();
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (error) {
      this.logApiError('GET /api/admin/system/database-schema', error);
      const { statusCode, body } = createErrorResponse('Internal Server Error', {
        status: 500,
      });
      return res.status(statusCode).json(body);
    }
  }
}
