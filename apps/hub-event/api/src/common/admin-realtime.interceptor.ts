import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { SocketGateway } from '../socket/socket.gateway';
import { parseAdminRealtimeInvalidate } from './admin-realtime.util';

@Injectable()
export class AdminRealtimeInterceptor implements NestInterceptor {
  constructor(private readonly socketGateway: SocketGateway) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const payload = parseAdminRealtimeInvalidate(
      req.method,
      req.originalUrl ?? req.url ?? '',
    );

    return next.handle().pipe(
      finalize(() => {
        if (!payload) return;
        if (res.statusCode < 200 || res.statusCode >= 300) return;
        this.socketGateway.emitAdminCacheInvalidate(payload);
      }),
    );
  }
}
