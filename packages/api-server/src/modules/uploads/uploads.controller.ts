import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import {
  createErrorResponse,
  createSuccessResponse,
  parseAdminListLimit,
  Permissions,
} from '../../common';
import { APP_HEADERS, ADMIN_ROUTES, PERMISSIONS } from '../../config';
import type {
  BaseUploadsService,
  BulkMoveFilesResult,
  CreateStorageFolderResult,
  ExportArchiveResult,
  ImageItemDto,
  ImportArchiveResult,
  ListImagesResult,
  ReorganizeDateFoldersResult,
  StorageRealm,
  UploadFileInput,
  UploadsBulkDeleteResult,
} from './uploads.service';

const MAX_UPLOAD_FILE_BYTES = 50 * 1024 * 1024;
const MAX_IMPORT_ARCHIVE_BYTES = 512 * 1024 * 1024;

export type IUploadsControllerService = Pick<
  BaseUploadsService,
  | 'listImages'
  | 'listFolders'
  | 'createFolder'
  | 'saveFile'
  | 'deleteFile'
  | 'deleteFolder'
  | 'bulkMoveFiles'
  | 'bulkDeleteFiles'
  | 'reorganizeDateFolders'
  | 'exportArchive'
  | 'importArchive'
  | 'serveFile'
  | 'serveResized'
>;

function resolveRealm(value: string | undefined): StorageRealm | undefined {
  return value === 'images' || value === 'files' || value === 'videos' || value === 'audio'
    ? value
    : undefined;
}

@ApiTags('Uploads')
@Permissions(PERMISSIONS.UPLOADS_VIEW)
@Controller(ADMIN_ROUTES.UPLOADS)
export class BaseUploadsController {
  constructor(protected readonly service: IUploadsControllerService) {}

  protected getUserId(headers: Record<string, string | undefined>): string | null {
    const userId =
      headers[APP_HEADERS.USER_ID]?.trim() ??
      headers[APP_HEADERS.USER_ID.toUpperCase()]?.trim();
    return userId || null;
  }

  protected unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse(`Thieu header ${APP_HEADERS.USER_ID}`, {
      status: 401,
    });
    return res.status(statusCode).json(body);
  }

  protected getServeBaseUrl(req?: Request): string {
    if (!req) return '';
    const host = req.get?.('host');
    if (!host) return '';
    return `${req.protocol || 'http'}://${host}`.replace(/\/$/, '') + '/api/uploads';
  }

  @Get('export')
  async exportArchive(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }

    try {
      const data = await this.service.exportArchive();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="kho-luu-tru.zip"');
      res.setHeader('X-Export-File-Count', String(data.fileCount));
      if (data.skipped > 0) {
        res.setHeader('X-Export-Skipped', String(data.skipped));
      }
      return res.status(200).send(data.buffer);
    } catch (error) {
      const { statusCode, body } = createErrorResponse(
        error instanceof Error ? error.message : 'Loi xuat kho luu tru',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get()
  async list(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('listFolders') listFolders?: string,
    @Query('realm') realm?: string,
    @Query('folderPath') folderPath?: string,
    @Query('tab') tab?: string,
    @Query('includeDescendants') includeDescendants?: string,
    @Query('uploadOwnerId') uploadOwnerId?: string,
    @Req() req?: Request,
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }

    if (listFolders === 'true') {
      const result = await this.service.listFolders();
      const { statusCode, body } = createSuccessResponse(result.data);
      return res.status(statusCode).json(body);
    }

    const result = await this.service.listImages({
      page: Math.max(1, Number.parseInt(String(page ?? '1'), 10) || 1),
      limit: parseAdminListLimit(limit, 50),
      serveBaseUrl: this.getServeBaseUrl(req),
      realm: resolveRealm(realm),
      folderPath: folderPath?.trim() || tab?.trim() || undefined,
      tab: tab?.trim() || undefined,
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
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }
    if (!file?.buffer?.length) {
      const { statusCode, body } = createErrorResponse('Thieu file ZIP', { status: 400 });
      return res.status(statusCode).json(body);
    }

    try {
      const body = (req.body ?? {}) as Record<string, string | undefined>;
      const data = await this.service.importArchive(file.buffer, {
        overwrite: body.overwrite === 'true',
      });
      const { statusCode, body: responseBody } = createSuccessResponse(data);
      return res.status(statusCode).json(responseBody);
    } catch (error) {
      const { statusCode, body } = createErrorResponse(
        error instanceof Error ? error.message : 'Loi khoi phuc kho luu tru',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Post()
  @Permissions(PERMISSIONS.UPLOADS_CREATE)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_FILE_BYTES },
    }),
  )
  async post(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Req() req: Request,
    @UploadedFile()
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<Response> {
    const body = (req.body ?? {}) as Record<string, string | undefined>;
    const action = body.action?.trim();

    if (action === 'createFolder') {
      if (!body.folderName?.trim()) {
        const { statusCode, body: responseBody } = createErrorResponse('Thieu folderName', {
          status: 400,
        });
        return res.status(statusCode).json(responseBody);
      }

      const allowedExtensions = body.allowedExtensions
        ? (() => {
            try {
              const parsed = JSON.parse(body.allowedExtensions) as unknown;
              return Array.isArray(parsed)
                ? parsed.filter((value): value is string => typeof value === 'string')
                : undefined;
            } catch {
              return body.allowedExtensions
                ?.split(/[,\s;]+/)
                .map((value) => value.trim())
                .filter(Boolean);
            }
          })()
        : undefined;

      const data = await this.service.createFolder(
        body.folderName.trim(),
        body.parentPath?.trim() || undefined,
        resolveRealm(body.resourceType) ?? 'images',
        allowedExtensions,
      );
      const { statusCode, body: responseBody } = createSuccessResponse(data);
      return res.status(statusCode).json(responseBody);
    }

    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }
    if (!file?.buffer) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Thieu file hoac action createFolder',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }

    try {
      const data = await this.service.saveFile(
        file as UploadFileInput,
        body.folderPath?.trim() || undefined,
        body.isExistingFolder === 'true',
        this.getServeBaseUrl(req),
        this.getUserId(headers) ?? undefined,
        body.ownerUserId?.trim() || undefined,
      );
      const { statusCode, body: responseBody } = createSuccessResponse(data);
      return res.status(statusCode).json(responseBody);
    } catch (error) {
      const { statusCode, body: responseBody } = createErrorResponse(
        error instanceof Error ? error.message : 'Da xay ra loi khi upload',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }
  }

  @Post('bulk-move')
  @Permissions(PERMISSIONS.UPLOADS_MANAGE)
  async bulkMove(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { paths?: unknown; destinationFolder?: string },
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }
    if (!Array.isArray(body?.paths)) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Thieu hoac sai dinh dang paths',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }
    const destinationFolder = body.destinationFolder?.trim();
    if (!destinationFolder) {
      const { statusCode, body: responseBody } = createErrorResponse('Thieu destinationFolder', {
        status: 400,
      });
      return res.status(statusCode).json(responseBody);
    }
    try {
      const data = await this.service.bulkMoveFiles(
        body.paths
          .map((value) => (typeof value === 'string' ? value.trim() : ''))
          .filter(Boolean),
        destinationFolder,
      );
      const { statusCode, body: responseBody } = createSuccessResponse(data);
      return res.status(statusCode).json(responseBody);
    } catch (error) {
      const { statusCode, body: responseBody } = createErrorResponse(
        error instanceof Error ? error.message : 'Loi di chuyen file',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }
  }

  @Post('reorganize-date-folders')
  @Permissions(PERMISSIONS.UPLOADS_MANAGE)
  async reorganizeDateFolders(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { scopePath?: string; dryRun?: boolean },
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }
    try {
      const data = await this.service.reorganizeDateFolders({
        scopePath: body?.scopePath?.trim() || undefined,
        dryRun: body?.dryRun === true,
      });
      const { statusCode, body: responseBody } = createSuccessResponse(data);
      return res.status(statusCode).json(responseBody);
    } catch (error) {
      const { statusCode, body: responseBody } = createErrorResponse(
        error instanceof Error ? error.message : 'Loi cau truc lai folder',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }
  }

  @Post('bulk-delete')
  @Permissions(PERMISSIONS.UPLOADS_DELETE)
  async bulkDelete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { paths?: unknown },
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }
    if (!Array.isArray(body?.paths)) {
      const { statusCode, body: responseBody } = createErrorResponse(
        'Thieu hoac sai dinh dang paths (phai la mang)',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }

    const paths = body.paths
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);
    if (!paths.length) {
      const { statusCode, body: responseBody } = createErrorResponse('Danh sach paths trong', {
        status: 400,
      });
      return res.status(statusCode).json(responseBody);
    }

    try {
      const data = await this.service.bulkDeleteFiles(paths);
      const { statusCode, body: responseBody } = createSuccessResponse(data);
      return res.status(statusCode).json(responseBody);
    } catch (error) {
      const { statusCode, body: responseBody } = createErrorResponse(
        error instanceof Error ? error.message : 'Loi xoa hang loat',
        { status: 400 },
      );
      return res.status(statusCode).json(responseBody);
    }
  }

  @Delete()
  @Permissions(PERMISSIONS.UPLOADS_DELETE)
  async delete(
    @Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Query('path') pathParam?: string,
    @Query('deleteFolder') deleteFolder?: string,
  ): Promise<Response> {
    if (!this.getUserId(headers)) {
      return this.unauthorized(res);
    }

    const relativePath = pathParam?.trim();
    if (!relativePath) {
      const { statusCode, body } = createErrorResponse('Thieu path', { status: 400 });
      return res.status(statusCode).json(body);
    }

    try {
      if (deleteFolder === 'true') {
        await this.service.deleteFolder(relativePath);
      } else {
        await this.service.deleteFile(relativePath);
      }
      const { statusCode, body } = createSuccessResponse({ deleted: true });
      return res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = createErrorResponse(
        error instanceof Error ? error.message : 'Loi xoa',
        { status: 400 },
      );
      return res.status(statusCode).json(body);
    }
  }

  @Get('serve/*path')
  async serve(
    @Param('path') relativePath: string | string[],
    @Res() res: Response,
  ): Promise<Response | void> {
    const pathValue = Array.isArray(relativePath) ? relativePath.join('/') : relativePath;
    if (!pathValue) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    try {
      const data = await this.service.serveFile(pathValue);
      res.setHeader('Content-Type', data.contentType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(data.originalName)}"`,
      );
      data.stream.pipe(res);
      return undefined;
    } catch {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
  }
}

export type {
  ListImagesResult,
  ImageItemDto,
  CreateStorageFolderResult,
  UploadsBulkDeleteResult,
  BulkMoveFilesResult,
  ReorganizeDateFoldersResult,
  ImportArchiveResult,
  ExportArchiveResult,
};
