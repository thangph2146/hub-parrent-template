import { Module, forwardRef } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminRealtimeInterceptor } from '../common/admin-realtime.interceptor';
import { AdminRealtimeBroadcastService } from '../common/admin-realtime-broadcast.service';
import { SocketGateway } from './socket.gateway';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [forwardRef(() => SessionsModule)],
  providers: [
    SocketGateway,
    AdminRealtimeBroadcastService,
    AdminRealtimeInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminRealtimeInterceptor,
    },
  ],
  exports: [
    SocketGateway,
    AdminRealtimeBroadcastService,
    AdminRealtimeInterceptor,
  ],
})
export class SocketModule {}
