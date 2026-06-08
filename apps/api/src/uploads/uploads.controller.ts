/**
 * Uploads Controller - Admin API: list images/folders, upload, create folder, delete, serve file.
 * Header: X-User-Id (bắt buộc). Serve base URL có thể truyền qua query hoặc header để build URL ảnh.
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Res,
  Req,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { UploadsService } from './uploads.service';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../common/api-response';
import { appConfig } from '../config/app.config';
import { Permissions } from '../common/permissions.decorator';
import { PERMISSIONS } from '../config/permissions';
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { parseAdminListLimit } from '../common/parse-list-query';

/** Giới hạn kích thước file upload đơn lẻ (multer). */
const MAX_UPLOAD_FILE_BYTES = 50 * 1024 * 1024;
/** Giới hạn file ZIP khôi phục kho lưu trữ. */
const MAX_IMPORT_ARCHIVE_BYTES = 512 * 1024 * 1024;

@Permissions(PERMISSIONS.UPLOADS_VIEW)
@Controller(ADMIN_ROUTES.UPLOADS)
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly uploadsService: UploadsService) {}

  private getUserId(
    headers: Record<string, string | undefined>,
  ): string | null {
    const id = headers[APP_HEADERS.USER_ID]?.trim();
    return id || null;
  }

  private unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse(
      `Thiếu header ${APP_HEADERS.USER_ID}`,
      { status: 401 },
    );
    return res.status(statusCode).json(body);
  }

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

  /** GET /api/admin/uploads/export — ZIP toàn bộ kho (quét disk trên server). */
  @Get('export')
  @SkipThrottle()
  async exportArchive(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    try {
      const { buffer, fileCount, skipped } =
        await this.uploadsService.exportArchive();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="kho-luu-tru.zip"',
      );
      res.setHeader('X-Export-File-Count', String(fileCount));
      if (skipped > 0) {
        res.setHeader('X-Export-Skipped', String(skipped));
      }
      return res.status(200).send(buffer);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi xuất kho lưu trữ';
      this.logApiError(`GET ${ADMIN_ROUTES.UPLOADS}/export`, err);
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  /** GET /api/admin/uploads?page=1&limit=50&realm=images&tab=admincp hoặc ?listFolders=true */
  @Get()
  @SkipThrottle()
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('listFolders') listFolders?: string,
    @Query('realm') realm?: string,
    @Query('folderPath') folderPath?: string,
    @Query('tab') tab?: string,
    @Query('type') type?: string,
    @Query('includeDescendants') includeDescendants?: string,
    @Query('uploadOwnerId') uploadOwnerId?: string,
    @Req() req?: Request,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    if (listFolders === 'true') {
      const result = await this.uploadsService.listFolders();
      const { statusCode, body } = createSuccessResponse(result.data);
      return res.status(statusCode).json(body);
    }

    const serveBaseUrl = this.getServeBaseUrl(req);
    const realmFilter =
      realm === 'images' ||
      realm === 'files' ||
      realm === 'videos' ||
      realm === 'audio'
        ? realm
        : undefined;
    const result = await this.uploadsService.listImages({
      page: Math.max(1, parseInt(String(page), 10) || 1),
      limit: parseAdminListLimit(limit, 50),
      serveBaseUrl,
      realm: realmFilter,
      folderPath: folderPath?.trim() || tab?.trim() || undefined,
      tab: tab?.trim() || undefined,
      type: type === 'images' || type === 'files' ? type : undefined,
      includeDescendants:
        includeDescendants === 'true' || includeDescendants === '1',
      uploadOwnerId: uploadOwnerId?.trim() || undefined,
    });
    const { statusCode, body } = createSuccessResponse({
      data: result.data,
      folderTree: result.folderTree,
      realms: result.realms,
      tabs: result.tabs,
      subTabs: result.subTabs,
      childFolders: result.childFolders,
      breadcrumb: result.breadcrumb,
      folderPath: result.folderPath,
      pagination: result.pagination,
    });
    return res.status(statusCode).json(body);
  }

  /** POST /api/admin/uploads/import - FormData: file (.zip), overwrite? */
  @Post('import')
  @Permissions(PERMISSIONS.UPLOADS_CREATE)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMPORT_ARCHIVE_BYTES },
    }),
  )
  async importArchive(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Req() req: Request,
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    if (!file?.buffer?.length) {
      const { statusCode, body } = createErrorResponse('Thiếu file ZIP', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }

    const formData = req.body as Record<string, string>;
    const overwrite = formData?.overwrite === 'true';

    try {
      const data = await this.uploadsService.importArchive(file.buffer, {
        overwrite,
      });
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi khôi phục kho lưu trữ';
      this.logApiError(`POST ${ADMIN_ROUTES.UPLOADS}/import`, err, {
        overwrite,
        fileName: file.originalname ?? null,
        size: file.buffer.length,
      });
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  /** POST /api/admin/uploads - FormData: action=createFolder + folderName + parentPath? hoặc file + folderPath? + isExistingFolder? */
  @Post()
  @Permissions(PERMISSIONS.UPLOADS_CREATE)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_FILE_BYTES } }),
  )
  async post(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Req() req: Request,
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const formData = req.body as Record<string, string>;
    const action = formData?.action;

    if (action === 'createFolder') {
      const folderName = formData?.folderName;
      const parentPath = formData?.parentPath || null;
      const resourceTypeRaw = formData?.resourceType;
      const resourceType =
        resourceTypeRaw === 'files' ||
        resourceTypeRaw === 'videos' ||
        resourceTypeRaw === 'audio' ||
        resourceTypeRaw === 'images'
          ? resourceTypeRaw
          : 'images';
      if (!folderName?.trim()) {
        const { statusCode, body } = createErrorResponse('Thiếu folderName', {
          status: 400,
        });
        return res.status(statusCode).json(body);
      }
      const allowedExtensionsRaw = formData?.allowedExtensions;
      const allowedExtensions = allowedExtensionsRaw
        ? (() => {
            try {
              const parsed = JSON.parse(allowedExtensionsRaw) as unknown;
              return Array.isArray(parsed)
                ? parsed.filter(
                    (item): item is string => typeof item === 'string',
                  )
                : undefined;
            } catch {
              return allowedExtensionsRaw
                .split(/[,\s;]+/)
                .map((s) => s.trim())
                .filter(Boolean);
            }
          })()
        : undefined;

      const data = await this.uploadsService.createFolder(
        folderName.trim(),
        parentPath || undefined,
        resourceType,
        allowedExtensions,
      );
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    }

    if (!file?.buffer) {
      const { statusCode, body } = createErrorResponse(
        'Thiếu file hoặc action createFolder',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }

    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const folderPath = formData?.folderPath;
    const isExistingFolder = formData?.isExistingFolder === 'true';
    const ownerUserId = formData?.ownerUserId?.trim() || undefined;
    const serveBaseUrl = this.getServeBaseUrl(req);

    try {
      const data = await this.uploadsService.saveFile(
        {
          buffer: file.buffer,
          originalname: file.originalname || 'image',
          mimetype: file.mimetype || 'application/octet-stream',
        },
        folderPath || undefined,
        isExistingFolder,
        serveBaseUrl,
        userId,
        ownerUserId,
      );
      const { statusCode, body } = createSuccessResponse(data);
      return res.status(statusCode).json(body);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Đã xảy ra lỗi khi upload';
      this.logApiError(`POST ${ADMIN_ROUTES.UPLOADS}`, err, {
        action,
        folderPath,
        isExistingFolder,
        fileName: file?.originalname ?? null,
      });
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  /**
   * POST /api/admin/uploads/bulk-move — di chuyển file vào folder đích.
   */
  @Post('bulk-move')
  @Permissions(PERMISSIONS.UPLOADS_MANAGE)
  @SkipThrottle()
  async bulkMove(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { paths?: unknown; destinationFolder?: string },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const rawPaths = body?.paths;
    if (!Array.isArray(rawPaths)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu hoặc sai định dạng paths',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    const paths = rawPaths
      .map((p) => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean);
    const destinationFolder = body?.destinationFolder?.trim();
    if (!destinationFolder) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu destinationFolder',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const data = await this.uploadsService.bulkMoveFiles(
        paths,
        destinationFolder,
      );
      const { statusCode, body: okBody } = createSuccessResponse(data);
      return res.status(statusCode).json(okBody);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi di chuyển file';
      this.logApiError(`POST ${ADMIN_ROUTES.UPLOADS}/bulk-move`, err, {
        count: paths.length,
        destinationFolder,
      });
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  /**
   * POST /api/admin/uploads/reorganize-date-folders
   * Gom file từ folder YYYY/MM/DD (hoặc YYYY/MM, YYYY) về folder chính.
   */
  @Post('reorganize-date-folders')
  @Permissions(PERMISSIONS.UPLOADS_MANAGE)
  @SkipThrottle()
  async reorganizeDateFolders(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { scopePath?: string; dryRun?: boolean },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    try {
      const data = await this.uploadsService.reorganizeDateFolders({
        scopePath: body?.scopePath,
        dryRun: body?.dryRun === true,
      });
      const { statusCode, body: okBody } = createSuccessResponse(data);
      return res.status(statusCode).json(okBody);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi cấu trúc lại folder';
      this.logApiError(
        `POST ${ADMIN_ROUTES.UPLOADS}/reorganize-date-folders`,
        err,
        { scopePath: body?.scopePath ?? null },
      );
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  /**
   * POST /api/admin/uploads/bulk-delete — xóa nhiều file trong một request (server xử lý song song).
   * Body: { paths: string[] }
   */
  @Post('bulk-delete')
  @Permissions(PERMISSIONS.UPLOADS_DELETE)
  @SkipThrottle()
  async bulkDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { paths?: unknown },
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const rawPaths = body?.paths;
    if (!Array.isArray(rawPaths)) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Thiếu hoặc sai định dạng paths (phải là mảng)',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    const paths = rawPaths
      .map((p) => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean);
    if (!paths.length) {
      const { statusCode, body: errBody } = createErrorResponse(
        'Danh sách paths trống',
        { status: 400 },
      );
      return res.status(statusCode).json(errBody);
    }

    try {
      const data = await this.uploadsService.bulkDeleteFiles(paths);
      const { statusCode, body: okBody } = createSuccessResponse(data);
      return res.status(statusCode).json(okBody);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi xóa hàng loạt';
      this.logApiError(`POST ${ADMIN_ROUTES.UPLOADS}/bulk-delete`, err, {
        count: paths.length,
      });
      const { statusCode, body: errBody } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(errBody);
    }
  }

  /** DELETE /api/admin/uploads?path=... hoặc ?path=...&deleteFolder=true */
  @Delete()
  @Permissions(PERMISSIONS.UPLOADS_DELETE)
  async delete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('path') pathParam?: string,
    @Query('deleteFolder') deleteFolder?: string,
  ) {
    const userId = this.getUserId(headers);
    if (!userId) {
      return this.unauthorized(res);
    }

    const relativePath = pathParam?.trim();
    if (!relativePath) {
      const { statusCode, body } = createErrorResponse('Thiếu path', {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }

    try {
      if (deleteFolder === 'true') {
        await this.uploadsService.deleteFolder(relativePath);
      } else {
        await this.uploadsService.deleteFile(relativePath);
      }
      const { statusCode, body } = createSuccessResponse({ deleted: true });
      return res.status(statusCode).json(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi xóa';
      this.logApiError(`DELETE ${ADMIN_ROUTES.UPLOADS}`, err, {
        path: relativePath,
        deleteFolder: deleteFolder === 'true',
      });
      const { statusCode, body } = createErrorResponse(message, {
        status: 400,
      });
      return res.status(statusCode).json(body);
    }
  }

  /**
   * GET /api/uploads/*path - Serve file ảnh. path-to-regexp v8: dùng *path (có thể trả về mảng)
   * @deprecated Legacy route kept for backward compatibility. New URLs use PublicUploadsController at /api/uploads/*path
   */
  @Get('serve/*path')
  @SkipThrottle()
  async serve(
    @Param('path') relativePath: string | string[],
    @Res() res: Response,
  ) {
    const pathStr = Array.isArray(relativePath)
      ? relativePath.join('/')
      : (relativePath ?? '');
    if (!pathStr) {
      return res.status(400).json({ success: false, message: 'Invalid path' });
    }
    const pathNorm = pathStr.replace(/\\/g, '/');
    try {
      const { stream, contentType, originalName } =
        await this.uploadsService.serveFile(pathNorm);
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(originalName)}"`,
      );
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      stream.pipe(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Not found';
      this.logApiError(`GET ${ADMIN_ROUTES.UPLOADS}/serve/*path`, err, {
        path: pathNorm,
      });
      return res.status(404).json({ success: false, message });
    }
  }

  private getServeBaseUrl(req?: Request): string {
    if (appConfig.publicUrl) {
      return `${appConfig.publicUrl.replace(/\/$/, '')}/api/uploads`;
    }
    if (appConfig.nodeEnv === 'production') {
      return '';
    }
    const fallback = req && `${req.protocol || 'http'}://${req.get('host')}`;
    return fallback ? `${fallback.replace(/\/$/, '')}/api/uploads` : '';
  }
}
