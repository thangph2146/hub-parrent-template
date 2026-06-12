import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common';
import { PUBLIC_ROUTES } from '../../config';
import type { IUploadsControllerService } from './uploads.controller';

@Public()
@Controller(PUBLIC_ROUTES.SERVE_UPLOADS)
export class BasePublicUploadsController {
  constructor(private readonly service: IUploadsControllerService) {}

  @Get('resized/*path')
  async serveResized(
    @Param('path') relativePath: string | string[],
    @Query('w') width?: string,
    @Query('q') quality?: string,
    @Res() res?: Response,
  ): Promise<Response | void> {
    const target = Array.isArray(relativePath) ? relativePath.join('/') : relativePath;
    if (!target || !res) {
      return res?.status(404).json({ success: false, message: 'Not found' });
    }
    const parsedWidth = Number.parseInt(String(width ?? ''), 10);
    if (!parsedWidth || parsedWidth < 50 || parsedWidth > 2500) {
      return res.status(400).json({ success: false, message: 'Invalid width (50-2500)' });
    }
    try {
      const data = await this.service.serveResized(
        target,
        Math.round(parsedWidth),
        Number.parseInt(String(quality ?? '80'), 10) || 80,
      );
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

  @Get('*path')
  async serve(
    @Param('path') relativePath: string | string[],
    @Res() res?: Response,
  ): Promise<Response | void> {
    const target = Array.isArray(relativePath) ? relativePath.join('/') : relativePath;
    if (!target || !res) {
      return res?.status(404).json({ success: false, message: 'Not found' });
    }
    try {
      const data = await this.service.serveFile(target);
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
