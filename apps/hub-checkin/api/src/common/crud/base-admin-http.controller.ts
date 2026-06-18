/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */
/** CRUD runtime — template local (pnpm api:sync-template). */
/**
 * HTTP helpers cho admin controller (X-User-Id + envelope response).
 *
 * Dùng khi module không khớp full CRUD soft-delete (`BaseAdminCrudController`).
 */
import { Logger } from '@nestjs/common';
import type { Response } from 'express';
import { APP_HEADERS } from '../../config/constants';
import { createSuccessResponse, createErrorResponse } from '../api-response';

export abstract class BaseAdminHttpController {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  protected getUserId(
    headers: Record<string, string | string[] | undefined>,
  ): string | null {
    const val = headers[APP_HEADERS.USER_ID];
    const id = Array.isArray(val) ? val[0] : val;
    return id?.trim() || null;
  }

  protected unauthorized(res: Response): Response {
    const { statusCode, body } = createErrorResponse('Thiếu header X-User-Id', {
      status: 401,
    });
    return res.status(statusCode).json(body);
  }

  protected requireUserId(
    res: Response,
    headers: Record<string, string | string[] | undefined>,
  ): string | Response {
    const userId = this.getUserId(headers);
    if (!userId) return this.unauthorized(res);
    return userId;
  }

  protected sendSuccess<T>(
    res: Response,
    data: T,
    options?: { status?: number; message?: string },
  ): Response {
    const { statusCode, body } = createSuccessResponse(data, options);
    return res.status(statusCode).json(body);
  }

  protected sendError(
    res: Response,
    message: string,
    status = 400,
  ): Response {
    const { statusCode, body } = createErrorResponse(message, { status });
    return res.status(statusCode).json(body);
  }

  protected sendNotFound(res: Response, message = 'Không tìm thấy bản ghi'): Response {
    return this.sendError(res, message, 404);
  }

  /** Mutation trả về boolean (approve, delete, …). */
  protected async handleBoolMutation(
    res: Response,
    headers: Record<string, string | string[] | undefined>,
    run: () => Promise<boolean>,
    successMessage: string,
    notFoundMessage = 'Không tìm thấy bản ghi',
  ): Promise<Response> {
    const userId = this.requireUserId(res, headers);
    if (typeof userId !== 'string') return userId;

    const ok = await run();
    if (!ok) return this.sendNotFound(res, notFoundMessage);
    return this.sendSuccess(res, undefined, { message: successMessage });
  }
}
