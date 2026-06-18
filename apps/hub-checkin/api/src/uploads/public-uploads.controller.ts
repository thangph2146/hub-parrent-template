/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';
import { PUBLIC_ROUTES } from '../config/constants';
import { Public } from '../common';

/** Serve ảnh/tệp công khai — không áp rate limit (trang admin có thể tải hàng chục thumbnail cùng lúc). */
@Public()
@SkipThrottle()
@Controller(PUBLIC_ROUTES.SERVE_UPLOADS)
export class PublicUploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('resized/*path')
  async serveResized(
    @Param('path') relativePath: string | string[],
    @Query('w') widthStr: string | undefined,
    @Query('q') qualityStr: string | undefined,
    @Res() res: Response,
  ) {
    const pathStr = Array.isArray(relativePath)
      ? relativePath.join('/')
      : (relativePath ?? '');
    if (!pathStr) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    const width = widthStr ? parseInt(widthStr, 10) : undefined;
    const quality = qualityStr ? parseInt(qualityStr, 10) : undefined;
    if (!width || width < 50 || width > 2500) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid width (50-2500)' });
    }
    try {
      const { stream, contentType, originalName } =
        await this.uploadsService.serveResized(
          pathStr.replace(/\\/g, '/'),
          Math.round(width),
          quality ?? 80,
        );
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(originalName)}"`,
      );
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      stream.pipe(res);
    } catch {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
  }

  @Get('*path')
  async serve(
    @Param('path') relativePath: string | string[],
    @Res() res: Response,
  ) {
    const pathStr = Array.isArray(relativePath)
      ? relativePath.join('/')
      : (relativePath ?? '');
    if (!pathStr) {
      return res.status(404).json({ success: false, message: 'Not found' });
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
    } catch {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
  }
}
